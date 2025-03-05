import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Product } from './product.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('ProductListPriceHistory', { schema: 'Production' })
export class ProductListPriceHistory {
  @JoinColumn({ name: 'ProductID' })
  @ManyToOne((type) => Product, (product) => product.productListPriceHistory)
  product: Product;

  @ApiProperty({
    description: 'Start date when the price is being applied',
    example: '2011-05-30T17:00:00.000Z',
  })
  @PrimaryColumn({ type: 'datetime' })
  StartDate: Date;

  @ApiProperty({
    description: 'End date when the price is being applied',
    example: '2011-05-30T17:00:00.000Z',
  })
  @Column({ type: 'datetime', nullable: true })
  EndDate: Date;

  @ApiProperty({
    description: 'The price is being applied in the given range of time',
    example: 12.3,
  })
  @Column({ type: 'decimal', precision: 19, scale: 4 })
  ListPrice: number;

  @ApiProperty({
    description: 'The modified date',
    example: '2011-05-30T17:00:00.000Z',
  })
  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  ModifiedDate: Date;
}
