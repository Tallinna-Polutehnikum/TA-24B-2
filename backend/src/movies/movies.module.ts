import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Movie } from './movie.entity';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';

@Module({
  imports: [MikroOrmModule.forFeature([Movie])],
  controllers: [MoviesController],
  providers: [MoviesService],
})
export class MoviesModule {}
