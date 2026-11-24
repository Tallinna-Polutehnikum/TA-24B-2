import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/mysql';
import { randomInt, randomUUID } from 'node:crypto';
import { faker } from '@faker-js/faker';
import { CinemaBuilding } from './cinema-building.entity';
import { Creator } from './creator.entity';
import { MovieCreator } from './movie-creator.entity';
import { Movie } from './movie.entity';
import { MovieRating } from './movie-rating.entity';
import { Screening } from './screening.entity';
import { MovieSeedData } from '../database/seeders/movie-seed-data';
import { CreateMovieDto, MovieCreatorDto, MovieRatingDto, MovieUpdateDto } from './dto/create-movie.dto';

const movieGenres = ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Sci-Fi', 'Thriller'];

interface ValidatedMovieChanges {
  movieFields: CreateMovieDto;
  hasRating: boolean;
  rating?: MovieRatingDto | null;
  hasCreators: boolean;
  creators?: MovieCreatorDto[];
}


@Injectable()
export class MoviesService {
  private readonly logger = new Logger(MoviesService.name);

  constructor(private readonly em: EntityManager) {}

  async seedGeneratedMovies(regenerate: boolean) {
    const configuredCount = Number.parseInt(process.env.MOVIE_COUNT ?? '20', 10);
    const movieCount = Number.isSafeInteger(configuredCount) && configuredCount > 0 ? configuredCount : 6;
    faker.seed(randomInt(0, 2 ** 32));
    const em = this.em.fork();
    const existingGeneratedMovies = await em.find(Movie, { seedKey: { $like: 'faker-generated-v1-%' } });
    const generatedMoviesByKey = new Map(existingGeneratedMovies.map((movie) => [movie.seedKey, movie]));
    const moviesToSeedRelatedData: Movie[] = [];
    const moviesToSeedScreenings: Movie[] = [];
    const generatedMovies = Array.from({ length: movieCount }, (_, index) => {
      const seedKey = `faker-generated-v1-${index + 1}`;
      return this.makeGeneratedMovie(seedKey, {}, generatedMoviesByKey.get(seedKey));
    });

    for (const data of generatedMovies) {
      const existingMovie = await em.findOne(Movie, { seedKey: data.seedKey });

      if (!existingMovie) {
        const movie = em.create(Movie, data);
        em.persist(movie);
        moviesToSeedRelatedData.push(movie);
      } else if (regenerate && existingMovie.active) {
        em.assign(existingMovie, data);
        moviesToSeedRelatedData.push(existingMovie);
      }
    }

    if (regenerate) {
      const generatedSeededMovies = await em.find(Movie, { seedKey: { $like: 'faker-generated-v1-%' } });
      const activeSeedKeys = new Set(generatedMovies.map(({ seedKey }) => seedKey));

      for (const movie of generatedSeededMovies) {
        if (!activeSeedKeys.has(movie.seedKey!)) movie.active = false;
      }

      const mainMovies = await em.find(Movie, { seedKey: { $like: 'builtin-%' }, active: true });
      moviesToSeedRelatedData.push(...mainMovies);
      moviesToSeedScreenings.push(...await em.find(Movie, {
        active: true,
        $or: [
          { seedKey: null },
          { seedKey: { $like: 'faker-custom-v1-%' } },
        ],
      }));
    }

    await em.flush();

    if (moviesToSeedRelatedData.length > 0) {
      await MovieSeedData.seedRelatedData(em, moviesToSeedRelatedData);
    }

    if (moviesToSeedScreenings.length > 0) {
      await MovieSeedData.seedScreenings(em, moviesToSeedScreenings);
    }

    const automaticMovies = await em.find(
      Movie,
      { seedKey: { $like: 'faker-generated-v1-%' }, active: true },
      { orderBy: { id: 'ASC' } },
    );

    this.logger.log(`Faker generated ${automaticMovies.length} movies:\n${automaticMovies
      .map((movie) => `- ${movie.title} | ${movie.posterUrl}`)
      .join('\n')}\nRefreshed ratings, creators, and duration-based screenings for ${moviesToSeedRelatedData.length} movies, including the built-in movies.`);

    return em.find(Movie, { seedKey: { $like: 'faker-%' }, active: true }, { orderBy: { id: 'ASC' } });
  }

  async findCinemas() {
    const buildings = await this.em.find(CinemaBuilding, {}, { orderBy: { id: 'ASC' } });

    return buildings.map(({ name, city, address, hallCount }) => ({
      name,
      city,
      address,
      hallCount,
    }));
  }

  async createGeneratedMovie(input: CreateMovieDto) {
    this.validateTrailerUrl(input.trailerUrl);
    faker.seed(Date.now());
    const data = this.makeGeneratedMovie(`faker-custom-v1-${randomUUID()}`, input);
    const em = this.em.fork();
    const movie = em.create(Movie, data);
    await em.persistAndFlush(movie);
    await MovieSeedData.seedScreenings(em, [movie]);
    return movie;
  }

  async createManualMovie(input: MovieUpdateDto) {
    this.validateTrailerUrl(input.trailerUrl);
    const changes = this.movieChanges(input);
    const { title, genre, duration, description, ...optionalFields } = changes.movieFields;

    if (title === undefined || genre === undefined || duration === undefined || description === undefined) {
      throw new BadRequestException('Title, genre, duration, and description are required');
    }

    const em = this.em.fork();
    const movie = em.create(Movie, { ...optionalFields, title, genre, duration, description, active: true });

    em.persist(movie);
    await this.applyMovieRelations(em, movie, changes, true);
    await em.flush();
    await MovieSeedData.seedScreenings(em, [movie]);

    const createdMovie = (await this.findAll()).find((entry) => entry.id === movie.id);

    if (!createdMovie) throw new NotFoundException('Movie not found');

    return createdMovie;
  }

  async updateMovie(id: number, input: MovieUpdateDto) {
    this.validateTrailerUrl(input.trailerUrl);
    const changes = this.movieChanges(input);
    const em = this.em.fork();
    const movie = await em.findOne(Movie, { id, active: true });

    if (!movie) throw new NotFoundException('Movie not found');

    em.assign(movie, changes.movieFields);
    await this.applyMovieRelations(em, movie, changes);
    await em.flush();

    const updatedMovie = (await this.findAll()).find((entry) => entry.id === id);

    if (!updatedMovie) throw new NotFoundException('Movie not found');

    return updatedMovie;
  }

  private movieChanges(input: MovieUpdateDto): ValidatedMovieChanges {
    const values = Object.fromEntries(
      Object.entries(input).filter(([, value]) => value !== undefined),
    ) as MovieUpdateDto;
    if (Object.keys(values).length === 0) throw new BadRequestException('At least one field is required');
    const { rating, creators, ...movieFields } = values;
    return {
      movieFields,
      hasRating: Object.hasOwn(values, 'rating'),
      rating,
      hasCreators: Object.hasOwn(values, 'creators'),
      creators,
    };
  }

  private async applyMovieRelations(em: EntityManager, movie: Movie, changes: ValidatedMovieChanges, isNew = false) {
    if (changes.hasRating) {
      const existingRating = isNew ? null : await em.findOne(MovieRating, { movie });

      if (changes.rating === null) {
        if (existingRating) em.remove(existingRating);
      } else {
        const rating = changes.rating;

        if (!rating) throw new BadRequestException('Rating must be an object or null');

        if (existingRating) {
          em.assign(existingRating, rating);
        } else {
          em.persist(em.create(MovieRating, { movie, ...rating }));
        }
      }
    }

    if (changes.hasCreators) {
      const existingCredits = isNew
        ? []
        : await em.find(MovieCreator, { movie }, { populate: ['creator'], orderBy: { id: 'ASC' } });

      const creatorList = changes.creators!;

      for (const [index, creatorData] of creatorList.entries()) {
        const existingCredit = existingCredits[index];

        if (existingCredit) {
          existingCredit.creator.name = creatorData.name.trim();
          existingCredit.role = creatorData.role.trim();
        } else {
          const creator = em.create(Creator, {
            seedKey: `manual-${randomUUID()}`,
            name: creatorData.name.trim(),
          });

          em.persist(creator);
          em.persist(em.create(MovieCreator, { movie, creator, role: creatorData.role.trim() }));
        }
      }

      for (const credit of existingCredits.slice(creatorList.length)) {
        em.remove(credit);
      }
    }
  }

  async deleteMovie(id: number) {
    const em = this.em.fork();
    const movie = await em.findOne(Movie, { id, active: true });

    if (!movie) throw new NotFoundException('Movie not found');

    movie.active = false;
    await em.flush();

    return movie;
  }

  private makeGeneratedMovie(seedKey: string, overrides: CreateMovieDto = {}, previous?: Movie) {
    const durations = Array.from({ length: 101 }, (_, index) => index + 80);

    let title = faker.lorem.words({ min: 2, max: 4 }).replace(/\b\w/g, (letter) => letter.toUpperCase());

    while (previous?.title === title) {
      title = `${faker.lorem.words({ min: 2, max: 4 })} ${faker.number.int({ min: 1, max: 999 })}`
        .replace(/\b\w/g, (letter) => letter.toUpperCase());
    }

    let description = faker.lorem.sentence();

    while (previous?.description === description) {
      description = faker.lorem.sentence();
    }

    return {
      seedKey,
      title: overrides.title ?? title,
      genre: overrides.genre ?? this.pickDifferent(movieGenres, previous?.genre),
      duration: overrides.duration ?? this.pickDifferent(durations, previous?.duration),
      description: overrides.description ?? description,
      posterUrl: overrides.posterUrl ?? `https://picsum.photos/seed/${randomUUID()}/600/900`,
      bannerUrl: overrides.bannerUrl ?? `https://picsum.photos/seed/${randomUUID()}/1600/600`,
      active: true,
    };
  }

  private pickDifferent<T>(values: T[], previous: T | undefined): T {
    const alternatives = values.filter((value) => value !== previous);
    return faker.helpers.arrayElement(alternatives.length > 0 ? alternatives : values);
  }

  private validateTrailerUrl(value?: string) {
    if (value && !this.isYouTubeTrailerUrl(value)) {
      throw new BadRequestException('Trailer URL must be a YouTube video link');
    }
  }

  private isYouTubeTrailerUrl(value: string) {
    try {
      const url = new URL(value);
      const allowedHosts = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be', 'www.youtube-nocookie.com', 'youtube-nocookie.com']);

      if (!['http:', 'https:'].includes(url.protocol) || !allowedHosts.has(url.hostname)) return false;

      const videoId = url.hostname === 'youtu.be'
        ? url.pathname.split('/').filter(Boolean)[0]
        : url.searchParams.get('v') ?? url.pathname.split('/').filter(Boolean).at(-1);

      return Boolean(videoId && /^[\w-]{11}$/.test(videoId));
    } catch {
      return false;
    }
  }

  private ensureScreeningIsFuture (screening: Screening) {
    if (screening.startsAt.getTime() <= Date.now()) {
      throw new BadRequestException('This screening is already started');
    }
  }

  async getScreeningSeats(id: number) {
    const em = this.em.fork();
    const screening = await em.findOne(Screening, { id });

    if (!screening) {
      throw new NotFoundException('Screening not found');
    
    }

    this.ensureScreeningIsFuture(screening);
    return {
      screeningId: screening.id,
      blockedSeats: screening.blockedSeats ?? null
    }
  }

  async setScreeningSeats(id: number, input: unknown) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      throw new BadRequestException('Invalid seat data');
    }

    const data = input as Record<string, unknown>;
    const seats = data.blockedSeats;

    if (Object.keys(data).some(key => key !== 'blockedSeats') || !Array.isArray(seats)) {
      throw new BadRequestException('Invalid seat data');
    }

    const validSeats = seats.every(seat => typeof seat === 'string' && /^[1-7]-(10|[1-9])$/.test(seat));

    if (!validSeats || seats.length > 70 || new Set(seats).size !== seats.length) {
      throw new BadRequestException('Invalid or duplicated seats');
    }

    const em = this.em.fork();
    const screening = await em.findOne(Screening, { id });

    if (!screening) {
      throw new NotFoundException('Screening not found');
    }

    this.ensureScreeningIsFuture(screening);
    screening.blockedSeats = seats;
    await em.flush();

    return {
      screeningId: id,
      blockedSeats: screening.blockedSeats
    }
  }

  async findAll() {
    const movies = await this.em.find(Movie, { active: true }, { orderBy: { id: 'ASC' } });
    return this.mapMovies(movies);
  }

  private async mapMovies(movies: Movie[]) {
    const movieIds = movies.map(({ id }) => id);
    const [ratings, credits] = movieIds.length === 0
      ? [[], []]
      : await Promise.all([
        this.em.find(MovieRating, { movie: { $in: movieIds } }),
        this.em.find(MovieCreator, { movie: { $in: movieIds } }, { populate: ['creator'] }),
      ]);
    const ratingsByMovie = new Map(ratings.map((rating) => [rating.movie.id, rating]));
    const creditsByMovie = new Map<number, { id: number; name: string; role: string }[]>();

    for (const credit of credits) {
      const movieCredits = creditsByMovie.get(credit.movie.id) ?? [];
      movieCredits.push({ id: credit.creator.id, name: credit.creator.name, role: credit.role });
      creditsByMovie.set(credit.movie.id, movieCredits);
    }

    return movies.map((movie) => {
      const rating = ratingsByMovie.get(movie.id);

      return {
        id: movie.id,
        title: movie.title,
        genre: movie.genre,
        duration: movie.duration,
        description: movie.description,
        posterUrl: movie.posterUrl,
        bannerUrl: movie.bannerUrl,
        trailerUrl: movie.trailerUrl,
        rating: rating ? { score: rating.score, voteCount: rating.voteCount } : null,
        creators: creditsByMovie.get(movie.id) ?? [],
      };
    });
  }

  async findMovieScreenings(id: number) {
    const movie = await this.em.findOne(Movie, { id, active: true });

    if (!movie) throw new NotFoundException('Movie not found');

    const screenings = await this.em.find(
      Screening,
      { movie, startsAt: { $gte: new Date() } },
      { populate: ['building'], orderBy: { startsAt: 'ASC' } },
    );

    return screenings.map((screening) => ({
      id: screening.id,
      building: screening.building.name,
      address: screening.building.address,
      city: screening.building.city,
      hallNumber: screening.hallNumber,
      startsAt: screening.startsAt,
      language: screening.language,
      ticketPrice: screening.ticketPrice,
    }));
  }

  async findOne(id: number) {
    const movie = await this.em.findOne(Movie, { id, active: true });
    if (!movie) return null;
    return (await this.mapMovies([movie]))[0];
  }
}