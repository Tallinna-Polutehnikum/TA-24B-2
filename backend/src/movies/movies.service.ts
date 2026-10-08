import { BadRequestException, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/mysql';
import { randomInt, randomUUID } from 'node:crypto';
import { faker } from '@faker-js/faker';
import { CinemaBuilding } from './cinema-building.entity';
import { Creator } from './creator.entity';
import { MovieCreator } from './movie-creator.entity';
import { Movie } from './movie.entity';
import { MovieRating } from './movie-rating.entity';
import { Screening } from './screening.entity';

const movieGenres = ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Sci-Fi', 'Thriller'];

export interface MovieInput {
  title?: string;
  genre?: string;
  duration?: number;
  description?: string;
  posterUrl?: string;
  bannerUrl?: string;
}

interface MovieRatingInput {
  score: number;
  voteCount: number;
}

interface MovieCreatorInput {
  name: string;
  role: string;
}

export interface MovieUpdateInput extends MovieInput {
  rating?: MovieRatingInput | null;
  creators?: MovieCreatorInput[];
}

@Injectable()
export class MoviesService implements OnModuleInit {
  private readonly logger = new Logger(MoviesService.name);

  constructor(
    private readonly em: EntityManager,
    private readonly orm: MikroORM,
  ) {}

  async onModuleInit() {
    await this.orm.getSchemaGenerator().updateSchema();
    const em = this.em.fork();
    const movies = [
      { title: 'Crime Patrol', genre: 'Action', duration: 90, description: 'A FMV action movie about a cop that goes high to Delta Force rank and save the country from terrorists.', posterUrl: '/poster1.jpg', bannerUrl: '/banner1.jpg', active: true },
      { title: 'Crime Patrol 2: Drug Wars', genre: 'Action', duration: 90, description: 'The cartel is spreading drugs across the whole country, but only you know how to stop them.', posterUrl: '/poster2.jpg', active: true },
      { title: 'Rain Man', genre: 'Drama', duration: 134, description: 'A story about two brothers, one is a selfish car dealer and another with autistic abilities to calculate, but with father"s inherited money.', posterUrl: '/poster3.jpg', active: true },
      { title: 'Pokémon: the First Movie', genre: 'Adventure', duration: 96, description: 'Witness the legendary battle of Mewtwo and mythical 151st Pokemon Mew. Who will prevail?', posterUrl: '/poster4.jpg', active: true },
      { title: '1917', genre: 'Drama/War Action', duration: 119, description: 'A quiet tense history about two men, who is going to the long trip among bombs and artillery to save people in No man"s land from imminent death.', posterUrl: '/poster5.jpg', active: true },
      { title: 'Re:Zero Tallinn Edition', genre: 'Anime', duration: 1000, description: 'DID YOU SAY STAIRS?! *feels the aura*.', posterUrl: '/poster6.jpg', active: true }
    ];
    for (const data of movies) {
      const existingMovie = await em.findOne(Movie, { posterUrl: data.posterUrl });
      if (!existingMovie) {
        em.persist(em.create(Movie, data));
      }
    }

    await em.flush();
  }

  async seedGeneratedMovies(regenerate: boolean) {
    const configuredCount = Number.parseInt(process.env.MOVIE_COUNT ?? '6', 10);
    const movieCount = Number.isSafeInteger(configuredCount) && configuredCount > 0 ? configuredCount : 6;
    faker.seed(randomInt(0, 2 ** 32));
    const em = this.em.fork();
    const existingGeneratedMovies = await em.find(Movie, { seedKey: { $like: 'faker-generated-v1-%' } });
    const generatedMoviesByKey = new Map(existingGeneratedMovies.map((movie) => [movie.seedKey, movie]));
    const protectedMovies = await em.find(Movie, {}, { orderBy: { id: 'ASC' }, limit: 12 });
    const protectedMovieIds = new Set(protectedMovies.map((movie) => movie.id));
    const moviesToSeedRelatedData: Movie[] = [];
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
      } else if (regenerate && existingMovie.active && !protectedMovieIds.has(existingMovie.id)) {
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
    }

    await em.flush();
    if (moviesToSeedRelatedData.length > 0) {
      await this.seedRelatedData(em, moviesToSeedRelatedData);
    }
    const automaticMovies = await em.find(
      Movie,
      { seedKey: { $like: 'faker-generated-v1-%' }, active: true },
      { orderBy: { id: 'ASC' } },
    );
    this.logger.log(`Faker generated ${automaticMovies.length} movies:\n${automaticMovies
      .map((movie) => `- ${movie.title} | ${movie.posterUrl}`)
      .join('\n')}\nGenerated ratings and credits for ${moviesToSeedRelatedData.length} movies, 4 cinema buildings, and ${moviesToSeedRelatedData.length * 2} screenings.`);
    return em.find(Movie, { seedKey: { $like: 'faker-%' }, active: true }, { orderBy: { id: 'ASC' } });
  }

  private async seedRelatedData(em: EntityManager, movies: Movie[]) {
    const buildings: CinemaBuilding[] = [];
    for (let index = 0; index < 4; index += 1) {
      const seedKey = `faker-building-v1-${index + 1}`;
      const data = {
        name: `${faker.location.city()} Cinema ${index + 1}`,
        address: faker.location.streetAddress(),
        city: faker.location.city(),
        hallCount: faker.number.int({ min: 3, max: 12 }),
      };
      const existing = await em.findOne(CinemaBuilding, { seedKey });
      if (existing) {
        em.assign(existing, data);
        buildings.push(existing);
      } else {
        const building = em.create(CinemaBuilding, { seedKey, ...data });
        em.persist(building);
        buildings.push(building);
      }
    }

    await em.flush();

    const creatorRoles = ['Director', 'Screenwriter', 'Producer'];
    for (const [movieIndex, movie] of movies.entries()) {
      const existingRating = await em.findOne(MovieRating, { movie });
      const ratingData = {
        score: faker.number.float({ min: 1, max: 10, fractionDigits: 1 }),
        voteCount: faker.number.int({ min: 50, max: 50000 }),
      };
      if (existingRating) {
        em.assign(existingRating, ratingData);
      } else {
        em.persist(em.create(MovieRating, { movie, ...ratingData }));
      }

      for (let creatorIndex = 0; creatorIndex < creatorRoles.length; creatorIndex += 1) {
        const seedKey = `faker-creator-movie-${movie.id}-${creatorIndex + 1}`;
        const existingCreator = await em.findOne(Creator, { seedKey });
        const creator = existingCreator
          ? em.assign(existingCreator, { name: faker.person.fullName() })
          : em.create(Creator, { seedKey, name: faker.person.fullName() });
        if (!existingCreator) em.persist(creator);

        const existingCredit = await em.findOne(MovieCreator, { movie, creator });
        if (existingCredit) {
          existingCredit.role = creatorRoles[creatorIndex];
        } else {
          em.persist(em.create(MovieCreator, { movie, creator, role: creatorRoles[creatorIndex] }));
        }
      }

      for (let screeningIndex = 0; screeningIndex < 2; screeningIndex += 1) {
        const seedKey = `faker-screening-v1-${movie.id}-${screeningIndex + 1}`;
        const building = buildings[(movieIndex + screeningIndex) % buildings.length];
        const data = {
          movie,
          building,
          hallNumber: faker.number.int({ min: 1, max: building.hallCount }),
          startsAt: faker.date.soon({ days: 14 }),
          language: faker.helpers.arrayElement(['English', 'Estonian', 'Russian']),
          ticketPrice: faker.number.float({ min: 6, max: 18, fractionDigits: 2 }),
        };
        const existingScreening = await em.findOne(Screening, { seedKey });
        if (existingScreening) {
          em.assign(existingScreening, data);
        } else {
          em.persist(em.create(Screening, { seedKey, ...data }));
        }
      }
    }

    await em.flush();
  }

  async createGeneratedMovie(input: unknown) {
    const overrides = this.validateMovieInput(input, true);
    faker.seed(Date.now());
    const data = this.makeGeneratedMovie(`faker-custom-v1-${randomUUID()}`, overrides);
    const em = this.em.fork();
    const movie = em.create(Movie, data);
    await em.persistAndFlush(movie);
    return movie;
  }

  async updateMovie(id: number, input: unknown) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      throw new BadRequestException('Movie data must be a JSON object');
    }

    const values = input as Record<string, unknown>;
    const allowedFields = new Set(['title', 'genre', 'duration', 'description', 'posterUrl', 'bannerUrl', 'rating', 'creators']);
    for (const field of Object.keys(values)) {
      if (!allowedFields.has(field)) throw new BadRequestException(`Field '${field}' cannot be changed`);
    }
    if (Object.keys(values).length === 0) throw new BadRequestException('At least one field is required');

    const { rating, creators, ...movieFields } = values;
    const changes = this.validateMovieInput(movieFields, true);
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

    const em = this.em.fork();
    const movie = await em.findOne(Movie, { id, active: true });
    if (!movie) throw new NotFoundException('Movie not found');
    em.assign(movie, changes);

    if (Object.hasOwn(values, 'rating')) {
      const existingRating = await em.findOne(MovieRating, { movie });
      if (rating === null) {
        if (existingRating) em.remove(existingRating);
      } else if (existingRating) {
        em.assign(existingRating, rating as MovieRatingInput);
      } else {
        em.persist(em.create(MovieRating, { movie, ...(rating as MovieRatingInput) }));
      }
    }

    if (Object.hasOwn(values, 'creators')) {
      const existingCredits = await em.find(MovieCreator, { movie }, { populate: ['creator'], orderBy: { id: 'ASC' } });
      for (const [index, creatorData] of (creators as MovieCreatorInput[]).entries()) {
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
      for (const credit of existingCredits.slice((creators as MovieCreatorInput[]).length)) {
        em.remove(credit);
      }
    }

    await em.flush();
    const updatedMovies = await this.findAll();
    const updatedMovie = updatedMovies.find((entry) => entry.id === id);
    if (!updatedMovie) throw new NotFoundException('Movie not found');
    return updatedMovie;
  }

  async deleteGeneratedMovie(id: number) {
    const em = this.em.fork();
    const movie = await em.findOne(Movie, { id, active: true, seedKey: { $like: 'faker-%' } });
    if (!movie) throw new NotFoundException('Faker movie not found');
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
    while (previous?.description === description) description = faker.lorem.sentence();

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
    const allowedFields = new Set(['title', 'genre', 'duration', 'description', 'posterUrl', 'bannerUrl']);
    if (!allowEmpty && entries.length === 0) throw new BadRequestException('At least one field is required');

    for (const [field, value] of entries) {
      if (!allowedFields.has(field)) throw new BadRequestException(`Field '${field}' cannot be changed`);
      if (field === 'duration') {
        if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
          throw new BadRequestException('Duration must be a positive integer');
        }
        continue;
      }

      if (field === 'posterUrl' || field === 'bannerUrl') {
        if (typeof value !== 'string' || value.length > 500) throw new BadRequestException(`Invalid value for '${field}'`);
        continue;
      }

      const maxLength = field === 'title' ? 160 : field === 'genre' ? 80 : 5000;
      if (typeof value !== 'string' || value.trim().length === 0 || value.length > maxLength) {
        throw new BadRequestException(`Invalid value for '${field}'`);
      }
    }

    return values as MovieInput;
  }

  async findAll() {
    const movies = await this.em.find(Movie, { active: true }, { orderBy: { id: 'ASC' } });
    const [ratings, credits, screenings] = await Promise.all([
      this.em.find(MovieRating, {}, { populate: ['movie'] }),
      this.em.find(MovieCreator, {}, { populate: ['movie', 'creator'] }),
      this.em.find(Screening, {}, { populate: ['movie', 'building'], orderBy: { startsAt: 'ASC' } }),
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
      return {
        id: movie.id,
        title: movie.title,
        genre: movie.genre,
        duration: movie.duration,
        description: movie.description,
        posterUrl: movie.posterUrl,
        bannerUrl: movie.bannerUrl,
        rating: rating ? { score: rating.score, voteCount: rating.voteCount } : null,
        creators: creditsByMovie.get(movie.id) ?? [],
        screenings: screeningsByMovie.get(movie.id) ?? [],
      };
    });
  }

  findOne(id: number) {
    return this.em.findOne(Movie, { id, active: true });
  }
}