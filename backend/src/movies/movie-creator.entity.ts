import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Creator } from './creator.entity';
import { Movie } from './movie.entity';

@Entity()
export class MovieCreator {
  @PrimaryKey()
  id!: number;

  @ManyToOne(() => Movie, { deleteRule: 'cascade' })
  movie!: Movie;

  @ManyToOne(() => Creator, { deleteRule: 'cascade' })
  creator!: Creator;

  @Property({ length: 80 })
  role!: string;
}
