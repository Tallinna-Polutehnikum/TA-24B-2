import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import mikroOrmConfig from './database/mikro-orm.config';
import { MoviesModule } from './movies/movies.module';

@Module({
  imports: [MikroOrmModule.forRoot(mikroOrmConfig), MoviesModule],
})
export class AppModule {}
