import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/mysql';
import { Banner } from './banner.entity';
import { BannerInputDto } from './dto/banner-input.dto';

@Injectable()
export class BannersService {
  constructor(private readonly em: EntityManager) {}

  async findAll() {
    return this.em.find(
        Banner,
        { active: true },
        { orderBy: { id: 'ASC' } }
    );
  }

  async findOne(id: number) {
    const banner = await this.em.findOne(
      Banner,
      { id, active: true }
    );

    if (!banner) throw new NotFoundException('Banner not found');
    return banner;
  }

  async createManualBanner(input: BannerInputDto) {
    if (input.title === undefined || input.image === undefined) {
      throw new BadRequestException('Title and image are required');
    }

    const em = this.em.fork();
    const banner = em.create(Banner, {
      title: input.title,
      subtitle: input.subtitle ?? '',
      image: input.image,
      active: true
    });

    await em.persistAndFlush(banner);
    return banner;
  }

  async updateBanner(id: number, input: BannerInputDto) {
    const changes = Object.fromEntries(
      Object.entries(input).filter(([, value]) => value !== undefined),
    ) as BannerInputDto;
    if (Object.keys(changes).length === 0) throw new BadRequestException('At least one field is required');

    const em = this.em.fork();
    const banner = await em.findOne(
      Banner,
      { id, active: true }
    );

    if (!banner) throw new NotFoundException('Banner not found');
    em.assign(banner, changes);
    await em.flush();
    return banner;
  }

  async deleteBanner(id: number) {
    const em = this.em.fork();
    const banner = await em.findOne(
      Banner,
      { id, active: true }
    );

    if (!banner) throw new NotFoundException('Banner not found');
    banner.active = false;
    await em.flush();
    return banner;
  }
}