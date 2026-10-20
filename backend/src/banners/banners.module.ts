import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { Banner } from './banner.entity';
import { BannersController } from './banners.controller';
import { BannersService } from './banners.service';

@Module({
  imports: [MikroOrmModule.forFeature([Banner])],
  controllers: [BannersController],
  providers: [BannersService]
})
export class BannersModule {}