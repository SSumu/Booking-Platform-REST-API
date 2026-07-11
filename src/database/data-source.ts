import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import { config as loadEnv } from 'dotenv';
import { typeOrmConfig } from '../config/typeorm.config';

loadEnv();

/**
 * Standalone DataSource used only by the TypeORM CLI (migration:generate,
 * migration:run, migration:revert). Points at the .ts source files directly
 * so it can run via ts-node without a build step first.
 */
const cliDataSourceOptions: DataSourceOptions = {
  ...typeOrmConfig,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
}; /*as DataSourceOptions*/

const AppDataSource = new DataSource(cliDataSourceOptions);

export default AppDataSource;
