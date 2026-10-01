import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Creator {
  @PrimaryKey()
  id!: number;

  @Property({ length: 160 })
  name!: string;

  @Property({ unique: true, length: 64 })
  seedKey!: string;
}
