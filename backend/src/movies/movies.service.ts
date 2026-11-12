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

const movieGenres = ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Sci-Fi', 'Thriller'];

export interface MovieInput {
  title?: string;
  genre?: string;
  duration?: number;
  description?: string;
  posterUrl?: string;
  bannerUrl?: string;
  trailerUrl?: string;
}

interface MovieRatingInput {
  score: number;
  voteCount: number;
}

interface MovieCreatorInput {
  name: string;
  role: string;
}

interface ValidatedMovieChanges {
  movieFields: MovieInput;
  hasRating: boolean;
  rating?: MovieRatingInput | null;
  hasCreators: boolean;
  creators?: MovieCreatorInput[];
}

export interface MovieUpdateInput extends MovieInput {
  rating?: MovieRatingInput | null;
  creators?: MovieCreatorInput[];
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

  async createGeneratedMovie(input: unknown) {
    const overrides = this.validateMovieInput(input, true);
    faker.seed(Date.now());
    const data = this.makeGeneratedMovie(`faker-custom-v1-${randomUUID()}`, overrides);
    const em = this.em.fork();
    const movie = em.create(Movie, data);
    await em.persistAndFlush(movie);
    await MovieSeedData.seedScreenings(em, [movie]);
    return movie;
  }

  async createManualMovie(input: unknown) {
    const changes = this.validateMovieChanges(input, ['title', 'genre', 'duration', 'description']);
    const { title, genre, duration, description, ...optionalFields } = changes.movieFields;

    if (
      typeof title !== 'string' ||
      typeof genre !== 'string' ||
      typeof duration !== 'number' ||
      typeof description !== 'string'
    ) {
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

  async updateMovie(id: number, input: unknown) {
    const changes = this.validateMovieChanges(input);
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

  private validateMovieChanges(input: unknown, requiredFields: string[] = []): ValidatedMovieChanges {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      throw new BadRequestException('Movie data must be a JSON object');
    }

    const values = input as Record<string, unknown>;
    const allowedFields = new Set(['title', 'genre', 'duration', 'description', 'posterUrl', 'bannerUrl', 'trailerUrl', 'rating', 'creators']);

    for (const field of Object.keys(values)) {
      if (!allowedFields.has(field)) throw new BadRequestException(`Field '${field}' cannot be changed`);
    }

    if (Object.keys(values).length === 0) throw new BadRequestException('At least one field is required');

    const { rating, creators, ...movieFields } = values;
    const validatedMovieFields = this.validateMovieInput(movieFields, true);

    for (const field of requiredFields) {
      if (!Object.hasOwn(movieFields, field)) throw new BadRequestException(`Field '${field}' is required`);
    }

    if (Object.hasOwn(values, 'rating') && rating !== null) {
      if (!rating || typeof rating !== 'object' || Array.isArray(rating)) {
        throw new BadRequestException('Rating must be an object or null');
      }

      const ratingValues = rating as Record<string, unknown>;

      if (
        typeof ratingValues.score !== 'number' ||
        !Number.isFinite(ratingValues.score) ||
        ratingValues.score < 0 ||
        ratingValues.score > 10 ||
        typeof ratingValues.voteCount !== 'number' ||
        !Number.isSafeInteger(ratingValues.voteCount) ||
        ratingValues.voteCount < 0
      ) {
        throw new BadRequestException('Rating score must be between 0 and 10 and vote count must be a non-negative integer');
      }
    }

    if (Object.hasOwn(values, 'creators')) {
      if (!Array.isArray(creators) || creators.length > 20) {
        throw new BadRequestException('Creators must be an array containing at most 20 entries');
      }

      for (const creator of creators) {
        if (!creator || typeof creator !== 'object' || Array.isArray(creator)) {
          throw new BadRequestException('Each creator must include a name and role');
        }

        const creatorValues = creator as Record<string, unknown>;

        if (
          typeof creatorValues.name !== 'string' ||
          creatorValues.name.trim().length === 0 ||
          creatorValues.name.length > 160 ||
          typeof creatorValues.role !== 'string' ||
          creatorValues.role.trim().length === 0 ||
          creatorValues.role.length > 80
        ) {
          throw new BadRequestException('Creator names and roles must be non-empty and within their length limits');
        }
      }
    }

    return {
      movieFields: validatedMovieFields,
      hasRating: Object.hasOwn(values, 'rating'),
      rating: rating as MovieRatingInput | null | undefined,
      hasCreators: Object.hasOwn(values, 'creators'),
      creators: creators as MovieCreatorInput[] | undefined,
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

  private makeGeneratedMovie(seedKey: string, overrides: MovieInput = {}, previous?: Movie) {
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

  private validateMovieInput(input: unknown, allowEmpty = false): MovieInput {
    if (input === undefined && allowEmpty) input = {};

    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      throw new BadRequestException('Movie data must be a JSON object');
    }

    const values = input as Record<string, unknown>;
    const entries = Object.entries(values);
    const allowedFields = new Set(['title', 'genre', 'duration', 'description', 'posterUrl', 'bannerUrl', 'trailerUrl']);

    if (!allowEmpty && entries.length === 0) throw new BadRequestException('At least one field is required');

    for (const [field, value] of entries) {
      if (!allowedFields.has(field)) throw new BadRequestException(`Field '${field}' cannot be changed`);

      if (field === 'duration') {
        if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
          throw new BadRequestException('Duration must be a positive integer');
        }

        continue;
      }

      if (field === 'posterUrl' || field === 'bannerUrl' || field === 'trailerUrl') {
        if (typeof value !== 'string' || value.length > 500) {
          throw new BadRequestException(`Invalid value for '${field}'`);
        }

        if (field === 'trailerUrl' && value !== '' && !this.isYouTubeTrailerUrl(value)) {
          throw new BadRequestException('Trailer URL must be a YouTube video link');
        }

        continue;
      }

      const maxLength = field === 'title' ? 160 : field === 'genre' ? 80 : 5000;

      if (typeof value !== 'string' || value.trim().length === 0 || value.length > maxLength) {
        throw new BadRequestException(`Invalid value for '${field}'`);
      }
    }

    return values as MovieInput;
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
    const [ratings, credits, screenings] = await Promise.all([
      this.em.find(MovieRating, {}, { populate: ['movie'] }),
      this.em.find(MovieCreator, {}, { populate: ['movie', 'creator'] }),
      this.em.find(Screening, { startsAt: { $gte: new Date() }}, { populate: ['movie', 'building'], orderBy: { startsAt: 'ASC' } }),
    ]);
    const ratingsByMovie = new Map(ratings.map((rating) => [rating.movie.id, rating]));
    const creditsByMovie = new Map<number, { id: number; name: string; role: string }[]>();
    const screeningsByMovie = new Map<number, {
      id: number;
      building: string;
      address: string;
      city: string;
      hallNumber: number;
      startsAt: Date;
      language: string;
      ticketPrice: number;
    }[]>();

    for (const credit of credits) {
      const movieCredits = creditsByMovie.get(credit.movie.id) ?? [];
      movieCredits.push({ id: credit.creator.id, name: credit.creator.name, role: credit.role });
      creditsByMovie.set(credit.movie.id, movieCredits);
    }

    for (const screening of screenings) {
      const movieScreenings = screeningsByMovie.get(screening.movie.id) ?? [];

      movieScreenings.push({
        id: screening.id,
        building: screening.building.name,
        address: screening.building.address,
        city: screening.building.city,
        hallNumber: screening.hallNumber,
        startsAt: screening.startsAt,
        language: screening.language,
        ticketPrice: screening.ticketPrice,
      });

      screeningsByMovie.set(screening.movie.id, movieScreenings);
    }

    return movies.map((movie) => {
      const rating = ratingsByMovie.get(movie.id);
      const movieScreenings = screeningsByMovie.get(movie.id) ?? [];
      const screeningDates = movieScreenings.map((screening) => new Date(screening.startsAt)).sort((a, b) => a.getTime() - b.getTime());

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
        rentalStart: screeningDates[0] ?? null,
        rentalEnd: screeningDates.at(-1) ?? null,
        screenings: movieScreenings,
      };
    });
  }

  findOne(id: number) {
    return this.em.findOne(Movie, { id, active: true });
  }
}