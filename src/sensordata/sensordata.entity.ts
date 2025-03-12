import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne, ManyToOne } from 'typeorm';
import { Device } from 'src/device/device.entity';

@Entity()
export class SensorData {
    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column()
    data: string

    @Column()
    type: string

    @Column()
    time: string

    @ManyToOne(() => Device,deviceId=> deviceId.id)
    device: Device
}