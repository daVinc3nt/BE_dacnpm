import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  getMongoRepository,
  In,
  ObjectId,
  Repository,
} from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductSearch } from './entities/searchEntities/productSearch.entity';
import { v4 } from 'uuid';

@Injectable()
export class ProductUtilsService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(Product, 'defaultConnection') // Specify SQL Server connection for Product
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductSearch, 'searchConnection') // MongoDB data source with specified connection name
    private readonly productSearchRepository: Repository<ProductSearch>,
  ) {}
  async onApplicationBootstrap() {
    await this.etlAllProductSeach();
    console.log('The Product Search Database is initialized successfully.');
  }

  transfromProductToProductSearch(product: Product): ProductSearch {
    // Helper function to safely extract search keys
    const getSearchKeysFromProduct = (product: Product): string[] => {
      const keys: (keyof Product)[] = [
        'Name',
        'ProductLine',
        'Class',
        'Color',
        'Style',
      ];
      return keys
        .map((key) => (product[key] != null ? String(product[key]) : undefined)) // Ensure product[key] is not null or undefined
        .filter((value) => value !== undefined) as string[]; // Filter out undefined values and cast to string[]
    };

    // Return a ProductSearch object with additional safety checks
    return {
      _id: v4(),
      ProductID: product.ProductID,
      ProductName: product.Name,
      SearchKeys: getSearchKeysFromProduct(product), // Extract and filter search keys
    };
  }

  async extractProductById(id: number) {
    return await this.productRepository.findOneBy({ ProductID: id });
  }

  async extractAllProducts() {
    const data = await this.productRepository.find({
      order: { ModifiedDate: 'DESC' },
    });
    return data;
  }

  async saveProductSearch(productSearch: ProductSearch) {
    try {
      // Check if a document with the same ProductID already exists
      const existingProductSearch = await this.productSearchRepository.findOne({
        where: { ProductID: productSearch.ProductID },
      });

      if (existingProductSearch) {
        // Only update non-id fields
        const isChanged =
          existingProductSearch.ProductName !== productSearch.ProductName ||
          JSON.stringify(existingProductSearch.SearchKeys) !==
            JSON.stringify(productSearch.SearchKeys);

        if (isChanged) {
          // Update the document without modifying the _id
          await this.productSearchRepository.update(
            { ProductID: productSearch.ProductID },
            {
              ProductName: productSearch.ProductName,
              SearchKeys: productSearch.SearchKeys,
            },
          );
        }
        return { message: 'ProductSearch updated', productSearch };
      } else {
        // Create a new entry if it does not exist
        const newProductSearch =
          await this.productSearchRepository.save(productSearch);
        return {
          message: 'ProductSearch created',
          productSearch: newProductSearch,
        };
      }
    } catch (error) {
      console.error('Error saving productSearch:', error);
      throw new Error('Failed to save product search');
    }
  }

  async saveProductSearchList(productSearchList: ProductSearch[]) {
    return productSearchList.forEach(
      async (product) => await this.saveProductSearch(product),
    );
  }

  async etlSingleProductSearch(productId: number) {
    const product = await this.extractProductById(productId);
    if (!product) {
      throw new Error(`Product with ID ${productId} not found.`);
    }

    try {
      const productSearch = this.transfromProductToProductSearch(product);
      return await this.saveProductSearch(productSearch);
    } catch (error) {
      console.error('Error transforming product to productSearch:', error);
      throw new Error('Failed to transform and save product search data.');
    }
  }

  async etlAllProductSeach() {
    const productList = await this.extractAllProducts();
    const productSearchList = productList.map((product) =>
      this.transfromProductToProductSearch(product),
    );
    return this.saveProductSearchList(productSearchList);
  }

  async searchProducts(keyword?: string): Promise<Product[]> {
    if (!keyword) {
      // If keyword is undefined, fetch all products
      return await this.productRepository.find();
    }

    const regex = new RegExp(keyword, 'i'); // Case-insensitive regex for MongoDB

    // Fetch productSearch records matching the keyword
    const productSearchList = await this.productSearchRepository.find({
      where: {
        SearchKeys: { $regex: regex }, // MongoDB $regex for searching
      } as any, // TypeScript workaround for TypeORM's limitations
    });

    // Extract ProductIDs from the productSearch records
    const productIds = productSearchList.map((search) => search.ProductID);

    if (productIds.length === 0) {
      return []; // Return empty array if no matching productSearch records
    }

    // Fetch products from productRepository using the In operator
    return await this.productRepository.findBy({
      ProductID: In(productIds),
    });
  }

  async updateProductSearch(product: Product) {
    try {
      // Check if a document with the same ProductID already exists
      const existingProductSearch = await this.productSearchRepository.findOne({
        where: { ProductID: product.ProductID },
      });

      // Transform Product to ProductSearch format
      const productSearch = this.transfromProductToProductSearch(product);

      if (existingProductSearch) {
        // Only update fields other than _id
        const isChanged =
          existingProductSearch.ProductName !== productSearch.ProductName ||
          JSON.stringify(existingProductSearch.SearchKeys) !==
            JSON.stringify(productSearch.SearchKeys);

        if (isChanged) {
          // Update without modifying the _id
          await this.productSearchRepository.update(
            { ProductID: product.ProductID },
            {
              ProductName: productSearch.ProductName,
              SearchKeys: productSearch.SearchKeys,
            },
          );
        }
        return { message: 'ProductSearch updated', product };
      } else {
        // Create a new entry if it does not exist
        const newProductSearch =
          await this.productSearchRepository.save(productSearch);
        return {
          message: 'ProductSearch created',
          productSearch: newProductSearch,
        };
      }
    } catch (error) {
      console.error('Error saving productSearch:', error);
      throw new Error('Failed to save product search');
    }
  }

  async removeProductSearch(productId: number) {
    try {
      // Find the ProductSearch entry by ProductID
      const existingProductSearch = await this.productSearchRepository.findOne({
        where: { ProductID: productId },
      });

      if (!existingProductSearch) {
        throw new Error(`ProductSearch with ProductID ${productId} not found.`);
      }

      // Remove the entry from the database
      await this.productSearchRepository.delete({ ProductID: productId });

      return { message: 'ProductSearch deleted successfully', productId };
    } catch (error) {
      console.error('Error deleting productSearch:', error);
      throw new Error('Failed to delete product search');
    }
  }
}
