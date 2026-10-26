import { Entity, ManyToOne, PrimaryKey, Property, Unique } from '@mikro-orm/core';
import { CinemaBuilding } from './cinema-building.entity';
import { Movie } from './movie.entity';

@Entity()
@Unique({ properties: ['building', 'hallNumber', 'startsAt'] })
export class Screening {
  @PrimaryKey()
  id!: number;

  @Property({ unique: true, length: 100 })
  seedKey!: string;

  @ManyToOne(() => Movie, { deleteRule: 'cascade' })
  movie!: Movie;

  @ManyToOne(() => CinemaBuilding, { deleteRule: 'cascade' })
  building!: CinemaBuilding;

  @Property()
  hallNumber!: number;

  @Property({ type: 'datetime' })
  startsAt!: Date;

  @Property({ length: 12 })
  language!: string;

  @Property({ type: 'double' })
  ticketPrice!: number;

  @Property({ type: 'json', nullable: true})
  blockedSeats: string[] | null = null;
}
