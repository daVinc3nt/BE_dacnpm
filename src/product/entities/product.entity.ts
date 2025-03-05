import { BaseEntity, Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";
import { ProductInventory } from "./productInventory.entity";
import { ProductCostHistory } from "./productCostHistory.entity";
import { ProductListPriceHistory } from "./productListPriceHistory.entity";
import { PurchaseOrderDetail } from "./purchaseOrderDetail.entity";
import { WorkOrder } from "./workOrder.entity";

@Entity('Product', { schema: 'Production' })
export class Product {
    @PrimaryGeneratedColumn()
    ProductID: number;

    @Column({length: 50})
    Name: string;

    @Column({ length: 25, unique: true })
    ProductNumber: string;

    @Column()
    MakeFlag: boolean;

    @Column()
    FinishedGoodsFlag: boolean;

    @Column({ length: 15 })
    Color: string;

    @Column('decimal')
    SafetyStockLevel: number;

    @Column('decimal')
    ReorderPoint: number;

    @Column('decimal')
    StandardCost: number;

    @Column('decimal')
    ListPrice: number;

    @Column({ length: 5 })
    Size: string;

    @Column({ length: 3 })
    SizeUnitMeasureCode: string;

    @Column({ length: 3 })
    WeightUnitMeasureCode: string;

    @Column('decimal')
    Weight: number;

    @Column()
    DaysToManufacture: number;

    @Column({ length: 2 })
    ProductLine: string;

    @Column({ length: 2 })
    Class: string;

    @Column({ length: 2 })
    Style: string;

    @Column()
    ProductSubcategoryID: number;

    @Column()
    ProductModelID: number;

    @Column({type: 'datetime'})
    SellStartDate: Date;

    @Column({type: 'datetime'})
    SellEndDate: Date;

    @Column({type: 'datetime'})
    DiscontinuedDate: Date;

    @Column({type: 'uuid', unique: true})
    rowguid: string;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    ModifiedDate: Date;

    @OneToMany((type) => ProductInventory, (productInventory) => productInventory.ProductID)
    productInventory: ProductInventory[];

    @OneToMany(() => ProductCostHistory, (productCostHistory) => productCostHistory.product)
    costHistories: ProductCostHistory[];

    @OneToMany(() => ProductListPriceHistory, (productListPriceHistory) => productListPriceHistory.product)
    productListPriceHistory: ProductListPriceHistory[];

    @OneToMany(() => WorkOrder, (workOrder) => workOrder.ProductID)
    workOrders: WorkOrder[];

    @OneToMany(() => PurchaseOrderDetail, (purchaseOrderDetail) => purchaseOrderDetail.ProductID)
    purchaseOrderDetail: PurchaseOrderDetail[];
}
