import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { VoucherOffer } from './voucher-offer.entity';
import { VouchersController } from './vouchers.controller';
import { VouchersService } from './vouchers.service';

@Module({
  imports: [MikroOrmModule.forFeature([VoucherOffer])],
  controllers: [VouchersController],
  providers: [VouchersService],
})
export class VouchersModule {}
