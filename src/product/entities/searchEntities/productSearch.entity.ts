import { Column, Entity, ObjectIdColumn, Index } from 'typeorm';

@Entity('ProductSearch')
export class ProductSearch {
  @ObjectIdColumn() // Primary key for MongoDB
  _id: string;

  @Column()
  @Index({ unique: true }) // Ensures ProductID is unique within the collection
  ProductID: number;

  @Column({ length: 50 })
  ProductName: string;

  @Column('array') // MongoDB-compatible array type
  SearchKeys: string[];
}
