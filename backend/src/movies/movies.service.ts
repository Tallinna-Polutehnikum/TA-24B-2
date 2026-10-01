import { BadRequestException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/mysql';
import { randomUUID } from 'node:crypto';
import { faker } from '@faker-js/faker';
import { Movie } from './movie.entity';

const movieGenres = ['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Sci-Fi', 'Thriller'];

export interface MovieInput {
  title?: string;
  genre?: string;
  duration?: number;
  description?: string;
  posterUrl?: string;
  bannerUrl?: string;
}

@Injectable()
export class MoviesService implements OnModuleInit {
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
    await this.seedGeneratedMovies(false);
  }

  async seedGeneratedMovies(regenerate: boolean) {
    const configuredCount = Number.parseInt(process.env.MOVIE_COUNT ?? '6', 10);
    const movieCount = Number.isSafeInteger(configuredCount) && configuredCount > 0 ? configuredCount : 6;
    const configuredSeed = Number.parseInt(process.env.MOVIE_SEED ?? '42', 10);
    faker.seed(Number.isSafeInteger(configuredSeed) ? configuredSeed : 42);

    const generatedMovies = Array.from({ length: movieCount }, (_, index) =>
      this.makeGeneratedMovie(`faker-generated-v1-${index + 1}`, (index % 6) + 1),
    );
    const em = this.em.fork();

    for (const data of generatedMovies) {
      const existingMovie = await em.findOne(Movie, { seedKey: data.seedKey });
      if (!existingMovie) {
        em.persist(em.create(Movie, data));
      } else if (regenerate) {
        em.assign(existingMovie, data);
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
    return em.find(Movie, { seedKey: { $like: 'faker-%' }, active: true }, { orderBy: { id: 'ASC' } });
  }

  async createGeneratedMovie(input: unknown) {
    const overrides = this.validateMovieInput(input, true);
    faker.seed(Date.now());
    const data = this.makeGeneratedMovie(`faker-custom-v1-${randomUUID()}`, undefined, overrides);
    const em = this.em.fork();
    const movie = em.create(Movie, data);
    await em.persistAndFlush(movie);
    return movie;
  }

  async updateGeneratedMovie(id: number, input: unknown) {
    const changes = this.validateMovieInput(input);
    const em = this.em.fork();
    const movie = await em.findOne(Movie, { id, active: true, seedKey: { $like: 'faker-%' } });
    if (!movie) throw new NotFoundException('Faker movie not found');
    em.assign(movie, changes);
    await em.flush();
    return movie;
  }

  async deleteGeneratedMovie(id: number) {
    const em = this.em.fork();
    const movie = await em.findOne(Movie, { id, active: true, seedKey: { $like: 'faker-%' } });
    if (!movie) throw new NotFoundException('Faker movie not found');
    movie.active = false;
    await em.flush();
    return movie;
  }

  private makeGeneratedMovie(seedKey: string, posterNumber?: number, overrides: MovieInput = {}) {
    const imageNumber = posterNumber ?? faker.number.int({ min: 1, max: 6 });
    return {
      seedKey,
      title: overrides.title ?? faker.lorem.words({ min: 2, max: 4 }).replace(/\b\w/g, (letter) => letter.toUpperCase()),
      genre: overrides.genre ?? faker.helpers.arrayElement(movieGenres),
      duration: overrides.duration ?? faker.number.int({ min: 80, max: 180 }),
      description: overrides.description ?? faker.lorem.sentence(),
      posterUrl: overrides.posterUrl ?? `/poster${imageNumber}.jpg`,
      bannerUrl: overrides.bannerUrl ?? `/banner${imageNumber}.jpg`,
      active: true,
    };
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

  findAll() {
    return this.em.find(Movie, { active: true }, { orderBy: { id: 'ASC' } });
  }

  findOne(id: number) {
    return this.em.findOne(Movie, { id, active: true });
  }
}