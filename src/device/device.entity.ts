import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne } from 'typeorm';
import { User } from 'src/user/user.entity';
import { Schedule } from 'src/schedule/schedule.entity';
import { NotificationConfig } from 'src/notification/notification.entity';

@Entity()
export class Device {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    action: string;

    @Column()
    deviceName: string;

    @Column({ nullable: true })
    qrCode: string;

    @Column()
    status: string;

    @Column({ type: 'varchar', length: 50 })
    type: string; // Use string for type validation

    @UpdateDateColumn()
    updateDate: Date;

    @CreateDateColumn()
    createDate: Date;

    @OneToMany(() => Schedule, schedule => schedule.device, { cascade: true })
    schedules: Schedule[];

    @OneToMany(() => NotificationConfig, notificationConfig => notificationConfig.device, { cascade: true })
    notificationConfigs: NotificationConfig[];

    @ManyToOne(() => User)
    user: User;
}