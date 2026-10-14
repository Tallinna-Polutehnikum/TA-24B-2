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
const cinemaLocations = [
  { name: 'InterPlex Cinema', city: 'Tokmachka', address: 'Deckadensa 26' },
  { name: 'Shaffer Cinema', city: 'Tokmachka', address: 'Fletcher 14' },
  { name: 'In Cinematico', city: 'Tokmachka', address: 'Corvus 113' },
  { name: 'Apollyon Cinema', city: 'Tokmachka', address: 'Sabra-Barenza 11' },
  { name: 'CinemaCubed', city: 'Tokmachka', address: 'Great Cinderolla 57' },
  { name: 'HowToCinema', city: 'Tokmachka', address: 'Havarenko 88' },
];

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
      { title: 'Crime Patrol 2: Drug Wars', genre: 'Action', duration: 90, description: 'The cartel is spreading drugs across the whole country, but only you know how to stop them.', posterUrl: '/poster2.jpg', trailerUrl: 'https://www.youtube.com/watch?v=qZ5h9foGi24', active: true },
      { title: 'Rain Man', genre: 'Drama', duration: 134, description: 'A story about two brothers, one is a selfish car dealer and another with autistic abilities to calculate, but with father"s inherited money.', posterUrl: '/poster3.jpg', trailerUrl: 'https://www.youtube.com/watch?v=rrTQEP41NL4', active: true },
      { title: 'Pokémon: the First Movie', genre: 'Adventure', duration: 96, description: 'Witness the legendary battle of Mewtwo and mythical 151st Pokemon Mew. Who will prevail?', posterUrl: '/poster4.jpg', trailerUrl: 'https://www.youtube.com/watch?v=hX-NHafvY5I', active: true },
      { title: '1917', genre: 'Drama/War Action', duration: 119, description: 'A quiet tense history about two men, who is going to the long trip among bombs and artillery to save people in No man"s land from imminent death.', posterUrl: '/poster5.jpg', trailerUrl: 'https://www.youtube.com/watch?v=UcmZN0Mbl04', active: true },
      { title: 'Re:Zero Tallinn Edition', genre: 'Anime', duration: 1000, description: 'DID YOU SAY STAIRS?! *feels the aura*.', posterUrl: '/poster6.jpg', active: true }
    ];

    for (const data of movies) {
      const existingMovie = await em.findOne(Movie, { posterUrl: data.posterUrl });
      if (!existingMovie) {
        em.persist(em.create(Movie, data));
      } else if (existingMovie.trailerUrl == null && data.trailerUrl) {
        existingMovie.trailerUrl = data.trailerUrl;
      }
    }

    await em.flush();
    const mainMovies = await em.find(Movie, {
      posterUrl: { $in: movies.map(({ posterUrl }) => posterUrl) },
      active: true,
    }, { orderBy: { id: 'ASC' } });

    const moviesToUpdate = new Map(mainMovies.map((movie) => [movie.id, movie]));
    const existingSeededScreenings = await em.find(
      Screening,
      { seedKey: { $like: 'faker-screening-%' } },
      { populate: ['movie'] },
    );

    for (const screening of existingSeededScreenings) {
      if (screening.movie.active) moviesToUpdate.set(screening.movie.id, screening.movie);
    }

    await this.seedRelatedData(em, [...moviesToUpdate.values()], false);
  }

  async seedGeneratedMovies(regenerate: boolean) {
    const configuredCount = Number.parseInt(process.env.MOVIE_COUNT ?? '20', 10);
    const movieCount = Number.isSafeInteger(configuredCount) && configuredCount > 0 ? configuredCount : 6;
    faker.seed(randomInt(0, 2 ** 32));
    const em = this.em.fork();
    const existingGeneratedMovies = await em.find(Movie, { seedKey: { $like: 'faker-generated-v1-%' } });
    const generatedMoviesByKey = new Map(existingGeneratedMovies.map((movie) => [movie.seedKey, movie]));
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

      const mainMovies = await em.find(Movie, {
        posterUrl: { $in: ['/poster1.jpg', '/poster2.jpg', '/poster3.jpg', '/poster4.jpg', '/poster5.jpg', '/poster6.jpg'] },
        active: true,
      });

      moviesToSeedRelatedData.push(...mainMovies);
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
      .join('\n')}\nRefreshed ratings, creators, and duration-based screenings for ${moviesToSeedRelatedData.length} movies, including the built-in movies.`);

    return em.find(Movie, { seedKey: { $like: 'faker-%' }, active: true }, { orderBy: { id: 'ASC' } });
  }

  private async seedRelatedData(em: EntityManager, movies: Movie[], refreshExisting = true) {
    const buildings: CinemaBuilding[] = [];

    for (const [index, location] of cinemaLocations.entries()) {
      const seedKey = `kinoproject-cinema-v1-${index + 1}`;
      let building = await em.findOne(CinemaBuilding, { seedKey });

      if (!building) {
        building = await em.findOne(CinemaBuilding, { seedKey: `faker-building-v1-${index + 1}` });

        if (building) {
          em.assign(building, { ...location, hallCount: 6, seedKey });
        } else {
          building = em.create(CinemaBuilding, { ...location, hallCount: 6, seedKey });
          em.persist(building);
        }
      } else {
        building.hallCount = 6;
      }

      buildings.push(building);
    }

    await em.flush();

    const creatorRoles = ['Director', 'Screenwriter', 'Producer'];

    for (const movie of movies) {
      const existingRating = await em.findOne(MovieRating, { movie });

      const ratingData = {
        score: faker.number.float({ min: 1, max: 10, fractionDigits: 1 }),
        voteCount: faker.number.int({ min: 50, max: 50000 }),
      };

      if (existingRating && refreshExisting) {
        em.assign(existingRating, ratingData);
      } else if (!existingRating) {
        em.persist(em.create(MovieRating, { movie, ...ratingData }));
      }

      for (let creatorIndex = 0; creatorIndex < creatorRoles.length; creatorIndex += 1) {
        const seedKey = `faker-creator-movie-${movie.id}-${creatorIndex + 1}`;
        const existingCreator = await em.findOne(Creator, { seedKey });

        const creator = existingCreator
          ? refreshExisting
            ? em.assign(existingCreator, { name: faker.person.fullName() })
            : existingCreator
          : em.create(Creator, { seedKey, name: faker.person.fullName() });

        if (!existingCreator) em.persist(creator);

        const existingCredit = await em.findOne(MovieCreator, { movie, creator });

        if (existingCredit && refreshExisting) {
          existingCredit.role = creatorRoles[creatorIndex];
        } else if (!existingCredit) {
          em.persist(em.create(MovieCreator, { movie, creator, role: creatorRoles[creatorIndex] }));
        }
      }

      await this.replaceScreeningsForMovie(em, movie, buildings, refreshExisting);
    }

    await em.flush();
  }

  private hashString(value: string) {
    let hash = 0;

    for (let index = 0; index < value.length; index++) {
      hash = (hash * 31 + value.charCodeAt(index)) % 2147483647;
  }

  return hash;
  }

  private createSeededRandom(seed: number) {
    let state = seed || 1;

    return () => {
      state = (state * 16807) % 2147483647;
      return state / 2147483647;
    };
  }

  private seededInt(random: () => number, min: number, max: number) {
    return Math.floor(random() * (max - min + 1)) + min;
  }

  private addDays(date: Date, days: number) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  private startOfDay(date: Date) {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    return result;
  }

  private getRentalDates(movie: Movie) {
    const random = this.createSeededRandom(this.hashString(`rental-v2-${movie.id}-${movie.seedKey ?? movie.title}`));
    const today = this.startOfDay(new Date());
    const startOffsetDays = this.seededInt(random, -3, 3);
    const rentalLengthDays = this.seededInt(random, 7, 21);
    const rentalStart = this.addDays(today, startOffsetDays);
    const rentalEnd = this.addDays(rentalStart, rentalLengthDays - 1);
    const dates: Date[] = [];

    for (let date = new Date(rentalStart); date <= rentalEnd; date = this.addDays(date, 1)) {
      dates.push(new Date(date));
    }

    return { rentalStart, rentalEnd, dates };
  }

  private buildScreeningTimes(movie: Movie, building: CinemaBuilding) {
    const random = this.createSeededRandom(this.hashString(`times-v2-${movie.id}-${building.id}`));
    let currentMinutes = 10 * 60 + this.seededInt(random, 0, 3) * 10;
    const lastStartMinutes = 22 * 60 + 30;
    const breakMinutes = this.seededInt(random, 15, 30);
    const times: number[] = [];

    while (currentMinutes <= lastStartMinutes) {
      times.push(currentMinutes);
      currentMinutes += movie.duration + breakMinutes;
    }

    return times;
  }

  private async replaceScreeningsForMovie(em: EntityManager, movie: Movie, buildings: CinemaBuilding[], refreshExisting: boolean) {
    if (buildings.length === 0) return;

    const existingScreenings = await em.find(Screening, { movie });
    const generatedV5 = existingScreenings.filter((screening) => screening.seedKey?.startsWith(`faker-screening-v5-${movie.id}-`));

    for (const screening of existingScreenings) {
      if (
        screening.seedKey?.startsWith('faker-screening-v1-') ||
        screening.seedKey?.startsWith(`faker-screening-v2-${movie.id}-`) ||
        screening.seedKey?.startsWith(`faker-screening-v3-${movie.id}-`) ||
        screening.seedKey?.startsWith(`faker-screening-v4-${movie.id}-`) ||
        (refreshExisting && screening.seedKey?.startsWith(`faker-screening-v5-${movie.id}-`))
      ) {
        em.remove(screening);
      }
    }

    if (!refreshExisting && generatedV5.length > 0) return;

    const random = this.createSeededRandom(this.hashString(`cinemas-v4-${movie.id}-${movie.seedKey ?? movie.title}`));
    const cinemaCount = this.seededInt(random, 1, buildings.length);
    const shuffledBuildings = [...buildings];

    for (let index = shuffledBuildings.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(random() * (index + 1));
      [shuffledBuildings[index], shuffledBuildings[swapIndex]] = [shuffledBuildings[swapIndex], shuffledBuildings[index]];
    }

    const selectedBuildings = shuffledBuildings.slice(0, cinemaCount);
    const { dates } = this.getRentalDates(movie);

    for (const building of selectedBuildings) {
      const hallCount = Math.max(1, building.hallCount);
      let hallIndex = movie.id + building.id;
      const startTimes = this.buildScreeningTimes(movie, building);
      let previousScreeningCount: number | null = null;

      for (const date of dates) {
        const dateKey = [
          date.getFullYear(),
          String(date.getMonth() + 1).padStart(2, '0'),
          String(date.getDate()).padStart(2, '0'),
        ].join('-');
        const dailyRandom = this.createSeededRandom(this.hashString(`daily-screenings-v1-${movie.id}-${building.id}-${dateKey}`));
        const minDailyCount = Math.max(0, startTimes.length - 2);
        let dailyCount = this.seededInt(dailyRandom, minDailyCount, startTimes.length);

        if (previousScreeningCount === dailyCount && minDailyCount < startTimes.length) {
          dailyCount = minDailyCount + ((dailyCount - minDailyCount + 1) % (startTimes.length - minDailyCount + 1));
        }
        previousScreeningCount = dailyCount;

        const dailyStartTimes = [...startTimes];
        for (let index = dailyStartTimes.length - 1; index > 0; index -= 1) {
          const swapIndex = Math.floor(dailyRandom() * (index + 1));
          [dailyStartTimes[index], dailyStartTimes[swapIndex]] = [dailyStartTimes[swapIndex], dailyStartTimes[index]];
        }
        dailyStartTimes.length = dailyCount;

        for (const startMinutes of dailyStartTimes.sort((first, second) => first - second)) {
          const hallNumber = (hallIndex++ % hallCount) + 1;
          const startsAt = new Date(date);
          startsAt.setHours(Math.floor(startMinutes / 60), startMinutes % 60, 0, 0);

          const screeningDateKey = [
            startsAt.getFullYear(),
            String(startsAt.getMinutes()).padStart(2, '0'),
            String(startsAt.getHours()).padStart(2, '0'),
            String(startsAt.getDate()).padStart(2, '0'),
            String(startsAt.getMonth() + 1).padStart(2, '0'),
          ].join('');

          const seedKey = `faker-screening-v5-${movie.id}-${building.id}-${hallNumber}-${screeningDateKey}`;
          const screeningRandom = this.createSeededRandom(this.hashString(seedKey));
          const languages = ['English', 'Estonian', 'Russian'];
          const ticketPrice = (900 + this.seededInt(screeningRandom, 0, 200)) / 100;

          em.persist(em.create(Screening, {
            seedKey,
            movie,
            building,
            hallNumber,
            startsAt,
            language: languages[this.seededInt(screeningRandom, 0, languages.length - 1)],
            ticketPrice,
          }));
        }
      }
    }
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