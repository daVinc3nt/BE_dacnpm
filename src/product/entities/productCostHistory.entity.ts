import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('ProductCostHistory', { schema: 'Production' })
export class ProductCostHistory {
  @JoinColumn({ name: 'ProductID' })
  @ManyToOne(() => Product, (product) => product.costHistories)
  product: Product;

  @ApiProperty({
    description: 'Start date when the cost is being applied',
    example: '2011-05-30T17:00:00.000Z',
  })
  @PrimaryColumn({ type: 'datetime' })
  StartDate: Date;

  @ApiProperty({
    description: 'End date when the cost is being applied',
    example: '2011-05-30T17:00:00.000Z',
  })
  @Column({ type: 'datetime', nullable: true })
  EndDate: Date;

  @ApiProperty({
    description: 'The cost is being applied in the given range of time',
    example: 12.3,
  })
  @Column({ type: 'decimal', precision: 19, scale: 4 })
  StandardCost: number;

  @ApiProperty({
    description: 'The modified date',
    example: '2011-05-30T17:00:00.000Z',
  })
  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  ModifiedDate: Date;
}
