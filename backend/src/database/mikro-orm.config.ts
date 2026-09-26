import 'dotenv/config';
import { defineConfig } from '@mikro-orm/mysql';
import { Movie } from '../movies/movie.entity';

export default defineConfig({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 13306),
  user: process.env.DB_USER ?? 'bradar',
  password: process.env.DB_PASSWORD ?? 'bradar',
  dbName: process.env.DB_NAME ?? 'bradar_cinema',
  entities: [Movie],
  debug: process.env.NODE_ENV !== 'production',
  schemaGenerator: { disableForeignKeys: true },
});
