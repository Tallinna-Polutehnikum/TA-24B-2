import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { MoviesService } from './movies.service';

async function generateMovies() {
  const app = await NestFactory.createApplicationContext(AppModule);
  try {
    await app.get(MoviesService).seedGeneratedMovies(true);
  } finally {
    await app.close();
  }
}

void generateMovies().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});