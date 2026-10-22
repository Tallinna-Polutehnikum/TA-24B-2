import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { EditingEnabledGuard } from '../common/guards/editing-enabled.guard';
import { Banner } from './banner.entity';
import { BannersController } from './banners.controller';
import { BannersService } from './banners.service';

@Module({
  imports: [MikroOrmModule.forFeature([Banner])],
  controllers: [BannersController],
  providers: [EditingEnabledGuard, BannersService]
})
export class BannersModule {}