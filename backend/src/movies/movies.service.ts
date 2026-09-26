import { Injectable, OnModuleInit } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/mysql';
import { Movie } from './movie.entity';

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
      if (existingMovie) {
        em.assign(existingMovie, data);
      } else {
        em.persist(em.create(Movie, data));
      }
    }
    await em.flush();
  }

  findAll() {
    return this.em.find(Movie, { active: true }, { orderBy: { id: 'ASC' } });
  }

  findOne(id: number) {
    return this.em.findOne(Movie, { id, active: true });
  }
}