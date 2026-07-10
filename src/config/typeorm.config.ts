import { DataSourceOptions } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { Service } from '../services/entities/service.entity';
import { Booking } from '../bookings/entities/booking.entity';

const isSqlite = process.env.DB_TYPE === 'sqlite';

const sqliteOptions: DataSourceOptions = {
  type: 'better-sqlite3',
  database: process.env.SQLITE_DB_PATH || 'database.sqlite',
  entities: [User, Service, Booking],
  // SQLite is intended for quick local trials only, so we let TypeORM
  // sync the schema directly instead of maintaining a second migration set.
  synchronize: true,
  logging: process.env.DB_LOGGING === 'true',
};

const postgresOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'booking_platform',
  entities: [User, Service, Booking],
  migrations: ['dist/database/migrations/*.js'],
  synchronize: false,
  logging: process.env.DB_LOGGING === 'true',
};

/**
 * The API can run against PostgreSQL (preferred, and what the committed
 * migrations target) or SQLite (zero-install option for a quick local trial).
 * Toggle with the DB_TYPE environment variable.
 */
export const typeOrmConfig: DataSourceOptions = isSqlite
  ? sqliteOptions
  : postgresOptions;
