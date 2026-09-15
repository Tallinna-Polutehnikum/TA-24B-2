import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Movie {
  @PrimaryKey()
  id!: number;

  @Property({ length: 160 })
  title!: string;

  @Property({ length: 80 })
  genre!: string;

  @Property({ type: 'text' })
  description!: string;

  @Property()
  duration!: number;

  @Property({ nullable: true, length: 500 })
  posterUrl?: string;

  @Property({ nullable: true, length: 500 })
  bannerUrl?: string;

  @Property({ default: true })
  active = true;
}
