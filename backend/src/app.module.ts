import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import mikroOrmConfig from './database/mikro-orm.config';
import { MoviesModule } from './movies/movies.module';
import { BannersModule } from './banners/banners.module';
import { VouchersModule } from './vouchers/vouchers.module';

@Module({
  imports: [MikroOrmModule.forRoot(mikroOrmConfig), MoviesModule, BannersModule, VouchersModule]
})
export class AppModule {}
