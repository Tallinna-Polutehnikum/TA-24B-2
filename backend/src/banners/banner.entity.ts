import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Banner {
  @PrimaryKey()
  id!: number;

  @Property({ length: 160 })
  title!: string;

  @Property({ length: 300, default: '' })
  subtitle: string = '';

  @Property({ length: 500 })
  image!: string;

  @Property({ nullable: true, unique: true, length: 64 })
  seedKey?: string;

  @Property({ default: true })
  active: boolean = true;
}