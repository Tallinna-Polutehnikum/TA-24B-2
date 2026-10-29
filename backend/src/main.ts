import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import { mkdirSync } from 'node:fs';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({ origin: true });
  const uploadDirectory = join(process.cwd(), 'uploads');
  mkdirSync(uploadDirectory, { recursive: true });
  app.useStaticAssets(uploadDirectory, { prefix: '/uploads/' });
  await app.listen(Number(process.env.PORT ?? 3000));
  console.log(`Bradar Cinema API: http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();
