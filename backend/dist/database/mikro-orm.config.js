"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const mysql_1 = require("@mikro-orm/mysql");
const movie_entity_1 = require("../movies/movie.entity");
exports.default = (0, mysql_1.defineConfig)({
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 13306),
    user: process.env.DB_USER ?? 'apollo',
    password: process.env.DB_PASSWORD ?? 'apollo',
    dbName: process.env.DB_NAME ?? 'apollo_kino',
    entities: [movie_entity_1.Movie],
    debug: process.env.NODE_ENV !== 'production',
    schemaGenerator: { disableForeignKeys: true },
});
//# sourceMappingURL=mikro-orm.config.js.map