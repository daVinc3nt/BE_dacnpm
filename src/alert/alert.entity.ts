import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne, ManyToOne, JoinColumn } from 'typeorm';
import { Device } from 'src/device/device.entity';

@Entity()
export class Alert {
    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column()
    message: string

    @Column({ default: 1 })
    levelWarning: number

    @Column()
    condition: string

    @Column({nullable:true})
    repeat: string

    @Column()
    time: Date

    @ManyToOne(() => Device)
    deviceId: Device

}