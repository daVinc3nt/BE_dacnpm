import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Location } from './location.entity';

@Entity('ProductInventory', { schema: 'Production' })
export class ProductInventory {
  @PrimaryColumn()
  ProductID: number;

  @PrimaryColumn()
  LocationID: number;

  @ManyToOne(() => Location)
  @JoinColumn({ name: 'LocationID' })
  location: Location; // Relationship with Location entity

  @Column()
  Shelf: string;

  @Column()
  Bin: number;

  @Column()
  Quantity: number;

  @Column('uuid')
  rowguid: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  ModifiedDate: Date;
}
