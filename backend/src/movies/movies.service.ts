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
      { title: 'Apollo: The First Mission', genre: 'Sci-Fi', duration: 128, description: 'A school-project demo movie used to show the Apollo Kino flow.', posterUrl: '/poster1.jpg', bannerUrl: '/banner1.jpg', active: true },
      { title: 'Midnight Run', genre: 'Action', duration: 114, description: 'A fast-paced night adventure through the city.', posterUrl: '/poster2.jpg', active: true },
      { title: 'The Last Summer', genre: 'Drama', duration: 102, description: 'A story about friendship, choices and one unforgettable summer.', posterUrl: '/poster3.jpg', active: true },
      { title: 'Pixel World', genre: 'Adventure', duration: 109, description: 'A colorful journey into a world built from pixels.', posterUrl: '/poster4.jpg', active: true },
      { title: 'Northern Lights', genre: 'Drama', duration: 121, description: 'A quiet story set under the northern sky.', posterUrl: '/poster5.jpg', active: true },
      { title: 'Re:Zero Tallinn Edition', genre: 'Anime', duration: 153, description: 'DID YOU SAID STAIRS? *feels the aura*.', posterUrl: '/poster6.jpg', active: true },
      { title: 'The Holodylnik', genre: 'Discord Bullshit', duration: 67, description: 'Bradar please make me a logo...', posterUrl: '/poster7.jpg', active: true }
    ];
    for (const data of movies) {
      const existingMovie = await em.findOne(Movie, { posterUrl: data.posterUrl });
      if (!existingMovie) em.persist(em.create(Movie, data));
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
