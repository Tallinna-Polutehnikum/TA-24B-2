import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class VoucherOffer {
  @PrimaryKey()
  id!: number;

  @Property({ length: 160 })
  label!: string;

  @Property({ length: 160 })
  title!: string;

  @Property({ type: 'text' })
  description!: string;

  @Property({ type: 'double' })
  price!: number;

  @Property({ nullable: true, length: 500 })
  image?: string | null;

  @Property({ default: true })
  active: boolean = true;
}
