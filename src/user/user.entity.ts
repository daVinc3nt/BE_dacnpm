import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Device } from 'src/device/device.entity';
import { Schedule } from 'src/schedule/schedule.entity';
import { NotificationConfig } from 'src/notification/notification.entity';

@Entity()
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

    @OneToMany(() => Device, (device) => device.user)
    devices: Device[];

    @OneToMany(() => Schedule, (schedule) => schedule.user)
    schedules: Schedule[];

    @OneToMany(() => NotificationConfig, (notificationConfig) => notificationConfig.user, { cascade: true })
    notificationConfigs: NotificationConfig[];
}
