"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeOrmConfig = void 0;
const user_entity_1 = require("../auth/entities/user.entity");
const service_entity_1 = require("../services/entities/service.entity");
const booking_entity_1 = require("../bookings/entities/booking.entity");
const isSqlite = process.env.DB_TYPE === 'sqlite';
const sqliteOptions = {
    type: 'better-sqlite3',
    database: process.env.SQLITE_DB_PATH || 'database.sqlite',
    entities: [user_entity_1.User, service_entity_1.Service, booking_entity_1.Booking],
    synchronize: true,
    logging: process.env.DB_LOGGING === 'true',
};
const postgresOptions = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'booking_platform',
    entities: [user_entity_1.User, service_entity_1.Service, booking_entity_1.Booking],
    migrations: ['dist/database/migrations/*.js'],
    synchronize: false,
    logging: process.env.DB_LOGGING === 'true',
};
exports.typeOrmConfig = isSqlite
    ? sqliteOptions
    : postgresOptions;
//# sourceMappingURL=typeorm.config.js.map