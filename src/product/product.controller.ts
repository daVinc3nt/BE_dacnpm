import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
  NotFoundException,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { get } from 'http';
import { json } from 'stream/consumers';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiProperty,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Product } from './entities/product.entity';
import { ProductCostHistory } from './entities/productCostHistory.entity';
import { ProductListPriceHistory } from './entities/productListPriceHistory.entity';
import { ProductInventory } from './entities/productInventory.entity';
import { Location } from './entities/location.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProductUtilsService } from './productUtils.service';

@ApiTags('product')
@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly productUtilsService: ProductUtilsService,
  ) {}

  @ApiOperation({
    summary:
      'Get products by filters (ProductSubCategoryID, ProductModelID, active status), or sorted (total quantity, modified date DESC)',
  })
  @ApiResponse({
    status: 200,
    description:
      'Return an array of products filtered/sorted by the given parameters',
    type: [Product],
  })
  @ApiQuery({
    name: 'by',
    description: 'Filter/sort products by',
    enum: ['subcat', 'model', 'active', 'quantity'],
    required: false,
  })
  @ApiQuery({
    name: 'id',
    description: 'ID of subcategory or model',
    required: false,
  })
  @Get()
  async findProducts(@Query('by') by: string, @Query('id') id?: number) {
    switch (by) {
      case 'subcat':
        return this.productService.findBySubCatID(id);
      case 'model':
        return this.productService.findByModelID(id);
      case 'active':
        return this.productService.findActiveProducts();
      case 'quantity':
        return this.productService.findSortedByQuantity();
      default:
        return this.productService.findAll();
    }
  }

  @ApiOperation({ summary: 'Get cost history of product' })
  @ApiResponse({
    status: 200,
    description: 'Return an array of cost history',
    type: [ProductCostHistory],
  })
  @Get(':id/cost-history')
  async listCostHistoryOfProduct(@Param('id') productId: number) {
    return await this.productService.listCostHistoryOfProduct(productId);
  }

  @ApiOperation({ summary: 'Get price history of product' })
  @ApiResponse({
    status: 200,
    description: 'Return an array of price history',
    type: [ProductListPriceHistory],
  })
  @Get(':id/price-history')
  async listPriceHistoryOfProduct(@Param('id') productId: number) {
    return await this.productService.listPriceHistoryOfProduct(productId);
  }

  @ApiOperation({ summary: 'Get the list of inventories of product' })
  @ApiResponse({
    status: 200,
    description:
      "Return an array of inventory objects including 'location' and 'quantity'",
    example: [
      {
        location: {
          Name: 'Frame Forming',
          CostRate: 22.5,
          Availability: 96,
          ModifiedDate: new Date(),
        } as Location,
        quantity: 2000,
      },
    ],
  })
  @Get(':id/inventory')
  async listProductInventories(@Param('id') productId: number) {
    return await this.productService.listInventoriesByProductId(productId);
  }

  @ApiOperation({ summary: 'Get stats of product' })
  @ApiResponse({
    status: 200,
    description:
      "Return the sums of 'order quantity', 'stocked quantity', 'scrapped quantity'",

    example: {
      orderQuantitySum: 1000,
      stockedQuantitySum: 2000,
      scrappedQuantitySum: 100,
    },
  })
  @Get(':id/stats')
  async getProductStats(@Param('id') productId: number) {
    return await this.productService.getProductStats(productId);
  }

  @ApiOperation({ summary: 'Get purchase stats of product' })
  @ApiResponse({
    status: 200,
    description:
      "Return the sums of 'received quantity', 'rejected quantity', 'stocked quantity' of purchases got from product",
    example: {
      receivedQuantitySum: 1000,
      rejectedQuantitySum: 2000,
      stockedQuantitySum: 100,
    },
  })
  @Get(':id/purchase-stats')
  async getProductPurchaseStats(@Param('id') productId: number) {
    return await this.productService.getProductPurchaseStats(productId);
  }

  @ApiOperation({ summary: 'Create a new product' })
  @ApiBody({
    description: 'Data for creating a new product',
    type: CreateProductDto,
    examples: {
      example1: {
        summary: 'Typical Product Creation Request',
        value: {
          Name: 'Sample Product',
          MakeFlag: true,
          FinishedGoodsFlag: true,
          Color: 'Red',
          SafetyStockLevel: 100.0, // > 0
          ReorderPoint: 50.0, // > 0
          StandardCost: 20.0, // >= 0
          ListPrice: 40.0, // >= 0
          Size: 'M',
          SizeUnitMeasureCode: 'CM',
          WeightUnitMeasureCode: 'KG',
          Weight: 1.5, // > 0
          DaysToManufacture: 5, // >= 0
          ProductLine: 'R', // 'R', 'M', 'T', 'S' hoặc NULL
          Class: 'H', // 'H', 'M', 'L' hoặc NULL
          Style: 'U', // 'U', 'M', 'W' hoặc NULL
          ProductSubcategoryID: 1,
          ProductModelID: 2,
          SellStartDate: '2024-01-01T00:00:00.000Z',
          SellEndDate: '2024-12-31T23:59:59.000Z', // >= SellStartDate hoặc NULL
          DiscontinuedDate: null, // có thể là NULL
          ModifiedDate: '2024-01-01T00:00:00.000Z',
        },
      },
    },
  })
  @Post('create')
  async createProduct(
    @Body() createProductDto: CreateProductDto,
  ): Promise<{ message: string; product: Product }> {
    console.log(createProductDto);
    const newProduct =
      await this.productService.createProduct(createProductDto);

    return newProduct;
  }

  @Put('update/:id')
  async updateProduct(
    @Param('id') productId: number,
    @Body() updateProductDto: CreateProductDto,
  ): Promise<{ message: string; product: Product }> {
    try {
      const updatedProduct = await this.productService.updateProduct(
        productId,
        updateProductDto,
      );
      return {
        message: 'Product updated successfully',
        product: updatedProduct,
      };
    } catch (error) {
      throw new NotFoundException(error.message || 'Product update failed');
    }
  }

  @Delete('delete/:id')
  async deleteProduct(@Param('id') id: number) {
    await this.productService.deleteProduct(id);
    return { message: 'Product deleted successfully' };
  }

  @ApiOperation({ summary: 'ETL a Product Search by id' })
  @Post('etl-product-search/:id')
  async etlSingleProductSearch(@Param('id') productId: number) {
    return await this.productUtilsService.etlSingleProductSearch(productId);
  }

  @ApiOperation({ summary: 'ETL all Product Search from Product' })
  @Post('etl-product-search')
  async etlAllProductSearch() {
    return await this.productUtilsService.etlAllProductSeach();
  }

  @ApiOperation({ summary: 'Search Products using Search Database' })
  @Get('etl-product-search')
  async searchProducts(@Query('keyword') keyword?: string) {
    return this.productUtilsService.searchProducts(keyword);
  }
}
