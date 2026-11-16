import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { EntityManager } from '@mikro-orm/mysql';
import { VoucherOffer } from './voucher-offer.entity';

interface VoucherOfferInput {
  label?: string;
  title?: string;
  description?: string;
  price?: number;
  image?: string;
}

@Injectable()
export class VouchersService {
  constructor(private readonly em: EntityManager) {}

  async findAll() {
    return this.em.find(VoucherOffer, { active: true }, { orderBy: { id: 'ASC' } });
  }

  async create(input: unknown) {
    const data = this.validateInput(input, true);
    const em = this.em.fork();
    const offer = em.create(VoucherOffer, {
      label: data.label!,
      title: data.title!,
      description: data.description!,
      price: data.price!,
      image: data.image || null,
      active: true,
    });

    await em.persistAndFlush(offer);
    return offer;
  }

  async update(id: number, input: unknown) {
    const changes = this.validateInput(input);
    const em = this.em.fork();
    const offer = await em.findOne(VoucherOffer, { id, active: true });

    if (!offer) throw new NotFoundException('Voucher offer not found');
    em.assign(offer, { ...changes, image: changes.image || null });
    await em.flush();
    return offer;
  }

  async delete(id: number) {
    const em = this.em.fork();
    const offer = await em.findOne(VoucherOffer, { id, active: true });

    if (!offer) throw new NotFoundException('Voucher offer not found');
    offer.active = false;
    await em.flush();
    return offer;
  }

  private validateInput(input: unknown, isNew = false): VoucherOfferInput {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      throw new BadRequestException('Voucher offer data must be a JSON object');
    }

    const values = input as Record<string, unknown>;
    const allowedFields = new Set(['label', 'title', 'description', 'price', 'image']);
    if (Object.keys(values).length === 0) {
      throw new BadRequestException('At least one field is required');
    }

    for (const [field, value] of Object.entries(values)) {
      if (!allowedFields.has(field)) {
        throw new BadRequestException(`Field '${field}' cannot be changed`);
      }

      if (field === 'price') {
        if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
          throw new BadRequestException('Price must be a positive number');
        }
        continue;
      }

      if (typeof value !== 'string') {
        throw new BadRequestException(`Invalid value for '${field}'`);
      }

      const maxLength = field === 'description' ? 5000 : field === 'image' ? 500 : 160;
      if (value.length > maxLength) {
        throw new BadRequestException(`Value for '${field}' is too long`);
      }
      if (field !== 'image' && !value.trim()) {
        throw new BadRequestException(`Field '${field}' cannot be empty`);
      }
    }

    if (isNew && ['label', 'title', 'description', 'price'].some(field => values[field] === undefined)) {
      throw new BadRequestException('Label, title, description, and price are required');
    }

    return values as VoucherOfferInput;
  }
}
