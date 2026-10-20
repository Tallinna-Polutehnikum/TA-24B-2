import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/mysql';
import { Banner } from './banner.entity';

export interface BannerInput {
  title?: string;
  subtitle?: string;
  image?: string;
}

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

  async createManualBanner(input: unknown) {
    const data = this.validateBannerInput(input, true);
    const em = this.em.fork();
    const banner = em.create(Banner, {
      title: data.title!,
      subtitle: data.subtitle ?? '',
      image: data.image!,
      active: true
    });

    await em.persistAndFlush(banner);
    return banner;
  }

  async updateBanner(id: number, input: unknown) {
    const changes = this.validateBannerInput(input);
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

  private validateBannerInput(input: unknown, isNew = false): BannerInput {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      throw new BadRequestException('Banner data must be a JSON object');
    }

    const values = input as Record<string, unknown>;
    const allowedFields = new Set([
      'title',
      'subtitle',
      'image'
    ]);

    if (Object.keys(values).length === 0) {
      throw new BadRequestException('At least one field is required');
    }

    for (const [field, value] of Object.entries(values)) {
      if (!allowedFields.has(field)) {
        throw new BadRequestException(`Field '${field}' cannot be changed`);
      }

      if (typeof value !== 'string') {
        throw new BadRequestException(`Invalid value for '${field}'`);
      }

      const maxLength = field === 'title' ? 160 : field === 'subtitle' ? 300 : 500;

      if (value.length > maxLength) {
        throw new BadRequestException(`Value for '${field}' is too long`);
      }

      if (field !== 'subtitle' && !value.trim()) {
        throw new BadRequestException(`Field '${field}' cannot be empty`);
      }
    }

    if (isNew && (typeof values.title !== 'string' || typeof values.image !== 'string')) {
      throw new BadRequestException('Title and image are required');
    }

    return values as BannerInput;
  }
}