import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne } from 'typeorm';
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

  @Column({ type: 'varchar', length: 255 })
  title: string; // Title of the notification

  @Column({ type: 'text', nullable: true })
  description: string; // Description of the notification

  @ManyToOne(() => User, (user) => user.notificationConfigs, { eager: true, onDelete: 'CASCADE' })
  user: User;

  @OneToOne(() => Device, { eager: true, onDelete: 'CASCADE' }) // Ensure one-to-one relationship
  @JoinColumn() // Add JoinColumn to specify ownership
  device: Device;
}
