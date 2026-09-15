import { MoviesService } from './movies.service';
export declare class MoviesController {
    private readonly movies;
    constructor(movies: MoviesService);
    findAll(): Promise<import("@mikro-orm/core").Loaded<import("./movie.entity").Movie, never, import("@mikro-orm/core").PopulatePath.ALL, never>[]>;
    findOne(id: number): Promise<import("@mikro-orm/core").Loaded<import("./movie.entity").Movie, never, "*", never>>;
}
