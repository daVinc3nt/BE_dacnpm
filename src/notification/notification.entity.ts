import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from 'src/user/user.entity';
import { Device } from 'src/device/device.entity';

@Entity()
export class NotificationConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  frequencyMinutes: number;

  @Column({ type: 'datetime', nullable: true })
  lastSentAt: Date | null;

  @Column({ default: true })
  active: boolean;

  @ManyToOne(() => User, (user) => user.notificationConfigs, { eager: true, onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Device, (device) => device.notificationConfigs, { eager: true, onDelete: 'CASCADE' })
  device: Device;
}
