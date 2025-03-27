import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne, ManyToOne } from 'typeorm';
import { User } from 'src/user/user.entity';
import { Device } from 'src/device/device.entity';

@Entity()
export class Schedule {
    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column()
    action: string

    @Column({ nullable: true })
    actionTime: number

    @Column()
    conditon: string

    @Column({ nullable: true })
    repeat: string

    @Column({ nullable: true })
    lastActive: Date

    @Column()
    time: string

    @UpdateDateColumn()
    updateDate: Date

    @CreateDateColumn()
    createDate: Date

    @ManyToOne(() => User)
    user: User

    @ManyToOne(() => Device)
    device: Device
}