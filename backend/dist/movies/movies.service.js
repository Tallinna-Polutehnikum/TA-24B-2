"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoviesService = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@mikro-orm/core");
const mysql_1 = require("@mikro-orm/mysql");
const movie_entity_1 = require("./movie.entity");
let MoviesService = class MoviesService {
    em;
    orm;
    constructor(em, orm) {
        this.em = em;
        this.orm = orm;
    }
    async onModuleInit() {
        await this.orm.getSchemaGenerator().updateSchema();
        const em = this.em.fork();
        const count = await em.count(movie_entity_1.Movie);
        if (count > 0)
            return;
        const movies = [
            { title: 'Apollo: The First Mission', genre: 'Sci-Fi', duration: 128, description: 'A school-project demo movie used to show the Apollo Kino flow.', posterUrl: '/poster1.jpg', bannerUrl: '/banner1.jpg', active: true },
            { title: 'Midnight Run', genre: 'Action', duration: 114, description: 'A fast-paced night adventure through the city.', posterUrl: '/poster2.jpg', active: true },
            { title: 'The Last Summer', genre: 'Drama', duration: 102, description: 'A story about friendship, choices and one unforgettable summer.', posterUrl: '/poster3.jpg', active: true },
            { title: 'Pixel World', genre: 'Adventure', duration: 109, description: 'A colorful journey into a world built from pixels.', posterUrl: '/poster4.jpg', active: true },
            { title: 'Northern Lights', genre: 'Drama', duration: 121, description: 'A quiet story set under the northern sky.', posterUrl: '/poster5.jpg', active: true }
        ];
        for (const data of movies)
            em.persist(em.create(movie_entity_1.Movie, data));
        await em.flush();
    }
    findAll() {
        return this.em.find(movie_entity_1.Movie, { active: true }, { orderBy: { id: 'ASC' } });
    }
    findOne(id) {
        return this.em.findOne(movie_entity_1.Movie, { id, active: true });
    }
};
exports.MoviesService = MoviesService;
exports.MoviesService = MoviesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [mysql_1.EntityManager,
        core_1.MikroORM])
], MoviesService);
//# sourceMappingURL=movies.service.js.map