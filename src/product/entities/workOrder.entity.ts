import { join } from 'path';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Product } from './product.entity';

@Entity('WorkOrder', { schema: 'Production' })
export class WorkOrder {
  @PrimaryColumn('int')
  WorkOrderID: number;

  @JoinColumn({ name: 'ProductID' })
  @ManyToOne((type) => Product, (product) => product.workOrders)
  ProductID: number;

  @Column('int')
  OrderQty: number;

  @Column('int')
  StockedQty: number;

  @Column('int')
  ScrappedQty: number;

  @Column('datetime')
  StartDate: Date;

  @Column('datetime', { nullable: true })
  EndDate: Date;

  @Column('datetime')
  DueDate: Date;

  @Column('tinyint', { nullable: true })
  ScrapReasonID: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  ModifiedDate: Date;
}
