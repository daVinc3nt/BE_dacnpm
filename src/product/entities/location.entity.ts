import { ColdObservable } from "rxjs/internal/testing/ColdObservable";
import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity('Location', { schema: 'Production' })
export class Location {
    @PrimaryColumn('int')
    LocationID: number;

    @Column({ length: 50 })
    Name: string;

    @Column()
    CostRate: number;

    @Column('decimal')
    Availability: number;

    @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
    ModifiedDate: Date;
}