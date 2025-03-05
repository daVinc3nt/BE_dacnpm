import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { ProductUtilsService } from './productUtils.service';
import { Product } from './entities/product.entity';
import { ProductInventory } from './entities/productInventory.entity';
import { ProductSearch } from './entities/searchEntities/productSearch.entity';
import { dataSource, searchDB } from 'ormconfig'; // Main database config

@Module({
  imports: [
    // Connect to the main data source
    TypeOrmModule.forRoot({
      ...dataSource.options,
      name: 'defaultConnection',
    }),
    TypeOrmModule.forFeature([Product, ProductInventory], 'defaultConnection'),

    // Connect to the MongoDB data source
    TypeOrmModule.forRoot({
      ...searchDB.options,
      name: 'searchConnection', // Naming the MongoDB connection for reference
    }),
    TypeOrmModule.forFeature([ProductSearch], 'searchConnection'), // Specify connection for MongoDB
  ],
  controllers: [ProductController],
  providers: [
    ProductService,
    ProductUtilsService,
    // Uncomment to protect all APIs in this module with JWT
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },
  ],
  exports: [ProductService, ProductUtilsService], // Export if used in other modules
})
export class ProductModule {}
