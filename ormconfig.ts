import { DataSource } from 'typeorm';
import 'dotenv/config';
import { User } from 'src/user/user.entity';
import { Product } from 'src/product/entities/product.entity';
import { ProductInventory } from 'src/product/entities/productInventory.entity';
import { ProductSearch } from 'src/product/entities/searchEntities/productSearch.entity';

export const systemDataSource = new DataSource({
  type: 'mssql',
  host: process.env.SYSDB_HOST,
  port: parseInt(process.env.SYSDB_PORT, 10) ?? 3306,
  username: process.env.SYSDB_USER,
  password: process.env.SYSDB_PASSWORD,
  database: process.env.SYSDB_NAME,
  // entities: [__dirname + '/src/**/*.entity{.ts,.js}'],
  entities: [User],
  migrations: [__dirname + '/dist/database/migrations/*{.ts,.js}'],
  synchronize: true,
  // logging: true,
  options: {
    encrypt: true, // Use this to enable SSL
    trustServerCertificate: true, // Use this to allow self-signed certificates
  },
  // ssl: {
  //   rejectUnauthorized: false,
  // },
  migrationsRun: true,
});

export const dataSource = new DataSource({
  name: 'data',
  type: 'mssql',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10) ?? 3306,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [__dirname + '/src/product/entities/*.entity{.ts,.js}'],
  // logging: true,
  options: {
    encrypt: true, // Use this to enable SSL
    trustServerCertificate: true, // Use this to allow self-signed certificates
  },
});

export const searchDB = new DataSource({
  type: 'mongodb',
  host: process.env.SEARCH_DB_HOST,
  port: parseInt(process.env.SEARCH_DB_PORT, 10) ?? 3306,
  database: process.env.SEARCH_DB_NAME,
  entities: [ProductSearch],
  useUnifiedTopology: true,
});
