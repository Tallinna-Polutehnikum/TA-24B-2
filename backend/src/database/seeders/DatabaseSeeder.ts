import { EntityManager } from '@mikro-orm/mysql';
import { Seeder } from '@mikro-orm/seeder';
import { Banner } from '../../banners/banner.entity';
import { Movie } from '../../movies/movie.entity';
import { Screening } from '../../movies/screening.entity';
import { MovieSeedData } from './movie-seed-data';

export class DatabaseSeeder extends Seeder {
  async run(em: EntityManager): Promise<void> {
    const movies = [
      { seedKey: 'builtin-1', title: 'Crime Patrol', genre: 'Action', duration: 90, description: 'A FMV action movie about a cop that goes high to Delta Force rank and save the country from terrorists.', posterUrl: '/poster1.jpg', bannerUrl: '/banner1.jpg', active: true },
      { seedKey: 'builtin-2', title: 'Crime Patrol 2: Drug Wars', genre: 'Action', duration: 90, description: 'The cartel is spreading drugs across the whole country, but only you know how to stop them.', posterUrl: '/poster2.jpg', trailerUrl: 'https://www.youtube.com/watch?v=qZ5h9foGi24', active: true },
      { seedKey: 'builtin-3', title: 'Rain Man', genre: 'Drama', duration: 134, description: 'A story about two brothers, one is a selfish car dealer and another with autistic abilities to calculate, but with father"s inherited money.', posterUrl: '/poster3.jpg', trailerUrl: 'https://www.youtube.com/watch?v=rrTQEP41NL4', active: true },
      { seedKey: 'builtin-4', title: 'Pokémon: the First Movie', genre: 'Adventure', duration: 96, description: 'Witness the legendary battle of Mewtwo and mythical 151st Pokemon Mew. Who will prevail?', posterUrl: '/poster4.jpg', trailerUrl: 'https://www.youtube.com/watch?v=hX-NHafvY5I', active: true },
      { seedKey: 'builtin-5', title: '1917', genre: 'Drama/War Action', duration: 119, description: 'A quiet tense history about two men, who is going to the long trip among bombs and artillery to save people in No man"s land from imminent death.', posterUrl: '/poster5.jpg', trailerUrl: 'https://www.youtube.com/watch?v=UcmZN0Mbl04', active: true },
      { seedKey: 'builtin-6', title: 'Re:Zero Tallinn Edition', genre: 'Anime', duration: 67, description: 'DID YOU SAY STAIRS?! *feels the aura*.', posterUrl: '/poster6.jpg', active: true },
    ];
    const banners = [
      { seedKey: 'default-banner-v1-1', image: '/banner1.jpg', title: 'Crime Patrol: The Amazing full FMV-movie', subtitle: 'For only 9.99€' },
      { seedKey: 'default-banner-v1-2', image: '/poster4.jpg', title: 'Experience movies on the big screen', subtitle: 'Explore what is playing now' },
      { seedKey: 'default-banner-v1-3', image: '/poster5.jpg', title: 'Your next movie night starts here', subtitle: 'Discover your new favorite film' },
    ];

    for (const data of movies) {
      const existingMovie = await em.findOne(Movie, { seedKey: data.seedKey });
      if (!existingMovie) {
        em.persist(em.create(Movie, data));
      } else if (existingMovie.trailerUrl == null && data.trailerUrl) {
        existingMovie.trailerUrl = data.trailerUrl;
      }
    }

    for (const data of banners) {
      const existingBanner = await em.findOne(Banner, { seedKey: data.seedKey });
      if (!existingBanner) em.persist(em.create(Banner, { ...data, active: true }));
    }

    await em.flush();
    const mainMovies = await em.find(Movie, { seedKey: { $like: 'builtin-%' }, active: true }, { orderBy: { id: 'ASC' } });
    const moviesToUpdate = new Map(mainMovies.map((movie) => [movie.id, movie]));
    const existingSeededScreenings = await em.find(
      Screening,
      { seedKey: { $like: 'faker-screening-%' } },
      { populate: ['movie'] },
    );

    for (const screening of existingSeededScreenings) {
      if (screening.movie.active) moviesToUpdate.set(screening.movie.id, screening.movie);
    }

    await MovieSeedData.seedRelatedData(em, [...moviesToUpdate.values()], false);
  }
}