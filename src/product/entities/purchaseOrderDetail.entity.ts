import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Product } from "./product.entity";

@Entity('PurchaseOrderDetail', { schema: 'Purchasing' })
export class PurchaseOrderDetail {
    @PrimaryColumn('int')
    PurchaseOrderID: number;

    @PrimaryColumn('int')
    PurchaseOrderDetailID: number;

    @Column('datetime')
    DueDate: Date;

    @Column('int')
    OrderQty: number;

    @JoinColumn({ name: 'ProductID' })
    @ManyToOne((type) => Product, (product) => product.purchaseOrderDetail)
    ProductID: number;

    @Column('decimal')
    UnitPrice: number;

    @Column('int')
    LineTotal: number;

    @Column('int')
    ReceivedQty: number;

    @Column('int')
    RejectedQty: number;

    @Column('int')
    StockedQty: number;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    ModifiedDate: Date;
}