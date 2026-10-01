import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class CinemaBuilding {
  @PrimaryKey()
  id!: number;

  @Property({ unique: true, length: 64 })
  seedKey!: string;

  @Property({ length: 160 })
  name!: string;

  @Property({ length: 255 })
  address!: string;

  @Property({ length: 120 })
  city!: string;

  @Property()
  hallCount!: number;
}
