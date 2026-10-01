import { Entity, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Movie } from './movie.entity';

@Entity()
export class MovieRating {
  @PrimaryKey()
  id!: number;

  @OneToOne(() => Movie, { deleteRule: 'cascade' })
  movie!: Movie;

  @Property({ type: 'double' })
  score!: number;

  @Property()
  voteCount!: number;
}
