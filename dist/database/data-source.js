"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const dotenv_1 = require("dotenv");
const typeorm_config_1 = require("../config/typeorm.config");
(0, dotenv_1.config)();
const cliDataSourceOptions = {
    ...typeorm_config_1.typeOrmConfig,
    entities: ['src/**/*.entity.ts'],
    migrations: ['src/database/migrations/*.ts'],
};
const AppDataSource = new typeorm_1.DataSource(cliDataSourceOptions);
exports.default = AppDataSource;
//# sourceMappingURL=data-source.js.map