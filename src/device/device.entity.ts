import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne, ManyToOne, JoinColumn } from 'typeorm';
import { SensorData } from 'src/sensordata/sensordata.entity';
import { Alert } from 'src/alert/alert.entity';
import { User } from 'src/user/user.entity';
import { Schedule } from 'src/schedule/schedule.entity';

@Entity()
export class Device{
    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column()
    action:string

    @Column()
    deviceName:string

    @Column({nullable:true})
    qrCode:string

    @Column()
    status:string

    @UpdateDateColumn()
    updateDate: Date

    @CreateDateColumn()
    createDate: Date

    @OneToMany(() => SensorData,data => data.id,{onDelete:'CASCADE', nullable: true})
    datalist : SensorData[]

    @OneToMany(() => Alert,alert => alert.id,{onDelete:'CASCADE', nullable: true})
    alerts : Alert[]

    @OneToMany(() => Schedule,schedule => schedule.id,{onDelete:'CASCADE', nullable: true})
    schedules : Schedule[]

    @ManyToOne(()=> User)
    user: User
}