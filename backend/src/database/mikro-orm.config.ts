import 'dotenv/config';
import { defineConfig } from '@mikro-orm/mysql';
import { CinemaBuilding } from '../movies/cinema-building.entity';
import { Creator } from '../movies/creator.entity';
import { MovieCreator } from '../movies/movie-creator.entity';
import { Movie } from '../movies/movie.entity';
import { MovieRating } from '../movies/movie-rating.entity';
import { Screening } from '../movies/screening.entity';

export default defineConfig({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 13306),
  user: process.env.DB_USER ?? 'apollo',
  password: process.env.DB_PASSWORD ?? 'apollo',
  dbName: process.env.DB_NAME ?? 'apollo_kino',
  entities: [Movie, MovieRating, Creator, MovieCreator, CinemaBuilding, Screening],
  debug: process.env.NODE_ENV !== 'production',
  schemaGenerator: { disableForeignKeys: true },
});
