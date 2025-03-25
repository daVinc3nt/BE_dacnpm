import { DataSource } from 'typeorm';
import 'dotenv/config';
import { User } from 'src/user/user.entity';
// import { Product } from 'src/product/entities/product.entity';
// import { ProductInventory } from 'src/product/entities/productInventory.entity';
// import { ProductSearch } from 'src/product/entities/searchEntities/productSearch.entity';

export const systemDataSource = new DataSource({
  type: 'mssql',
  host: process.env.SYSDB_HOST,
  port: parseInt(process.env.SYSDB_PORT, 10) ?? 3306,
  username: process.env.SYSDB_USER,
  password: process.env.SYSDB_PASSWORD,
  database: process.env.SYSDB_NAME,
  entities: [__dirname + '/src/**/*.entity{.ts,.js}'],
  // entities: [User],
  migrations: [__dirname + '/dist/database/migrations/*{.ts,.js}'],
  synchronize: true,
  options: {
    encrypt: true, // Use this to enable SSL
    trustServerCertificate: true, // Use this to allow self-signed certificates
  },
  migrationsRun: true,
});
