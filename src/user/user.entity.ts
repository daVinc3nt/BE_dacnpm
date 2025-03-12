import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Device } from 'src/device/device.entity';
import { Schedule } from 'src/schedule/schedule.entity';

@Entity({name:"User"})
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    fullName: string;

    @Column({ unique: true })
    email: string;

    @Column()
    googleId: string;

    @Column({ nullable: true })
    avaUrl: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updateAt: Date;

    @OneToMany(() => Device, (device) => device.id)
    devices: Device[];

    @OneToMany(() => Schedule, (schedule) => schedule.id)
    schedules: Schedule[];
}
