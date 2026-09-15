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
exports.Movie = void 0;
const core_1 = require("@mikro-orm/core");
let Movie = class Movie {
    id;
    title;
    genre;
    description;
    duration;
    posterUrl;
    bannerUrl;
    active = true;
};
exports.Movie = Movie;
__decorate([
    (0, core_1.PrimaryKey)(),
    __metadata("design:type", Number)
], Movie.prototype, "id", void 0);
__decorate([
    (0, core_1.Property)({ length: 160 }),
    __metadata("design:type", String)
], Movie.prototype, "title", void 0);
__decorate([
    (0, core_1.Property)({ length: 80 }),
    __metadata("design:type", String)
], Movie.prototype, "genre", void 0);
__decorate([
    (0, core_1.Property)({ type: 'text' }),
    __metadata("design:type", String)
], Movie.prototype, "description", void 0);
__decorate([
    (0, core_1.Property)(),
    __metadata("design:type", Number)
], Movie.prototype, "duration", void 0);
__decorate([
    (0, core_1.Property)({ nullable: true, length: 500 }),
    __metadata("design:type", String)
], Movie.prototype, "posterUrl", void 0);
__decorate([
    (0, core_1.Property)({ nullable: true, length: 500 }),
    __metadata("design:type", String)
], Movie.prototype, "bannerUrl", void 0);
__decorate([
    (0, core_1.Property)({ default: true }),
    __metadata("design:type", Object)
], Movie.prototype, "active", void 0);
exports.Movie = Movie = __decorate([
    (0, core_1.Entity)()
], Movie);
//# sourceMappingURL=movie.entity.js.map