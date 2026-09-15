import { OnModuleInit } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/mysql';
import { Movie } from './movie.entity';
export declare class MoviesService implements OnModuleInit {
    private readonly em;
    private readonly orm;
    constructor(em: EntityManager, orm: MikroORM);
    onModuleInit(): Promise<void>;
    findAll(): Promise<import("@mikro-orm/core").Loaded<Movie, never, import("@mikro-orm/core").PopulatePath.ALL, never>[]>;
    findOne(id: number): Promise<import("@mikro-orm/core").Loaded<Movie, never, "*", never> | null>;
}
