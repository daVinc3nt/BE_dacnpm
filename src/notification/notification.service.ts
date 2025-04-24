import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationConfig } from './notification.entity';
import { CreateNotificationConfigDto } from './dto/notification.create.dto';
import { UpdateNotificationConfigDto } from './dto/notification.update.dto';
import { Cron } from '@nestjs/schedule';
import { MailerService } from '@nestjs-modules/mailer';
import { DeviceService } from '../device/device.service'; // Import DeviceService
import { PlantService } from '../plant/plant.servive'; // Import PlantService
import { BaseService } from 'src/common/service/base_service';

@Injectable()
export class NotificationService extends BaseService<NotificationConfig, Repository<NotificationConfig>> {
  constructor(
    @InjectRepository(NotificationConfig)
    private readonly configRepository: Repository<NotificationConfig>,
    private readonly mailerService: MailerService,
    private readonly deviceService: DeviceService, // Inject DeviceService
    private readonly plantService: PlantService, // Inject PlantService
    protected readonly logger : Logger
  ) {
    super(configRepository, logger)
  }

  async createOrUpdate(createDto: CreateNotificationConfigDto) {
    const { userId, deviceId, frequencyMinutes, title, description, active } = createDto;

    // Ensure the user and device exist
    const user = await this.configRepository.manager.findOne('User', { where: { id: userId } });
    if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
    }

    const device = await this.configRepository.manager.findOne('Device', { where: { id: deviceId } });
    if (!device) {
        throw new NotFoundException(`Device with ID ${deviceId} not found`);
    }

    // Check if a notification config already exists for the device
    let config = await this.configRepository.findOne({
        where: { device: { id: deviceId } },
        relations: ['device', 'user'], // Load necessary relations
    });

    if (config) {
        // Update existing config
        config.frequencyMinutes = frequencyMinutes;
        config.title = title;
        config.description = description;
        config.active =active;
    } else {
        // Create a new config
        config = this.configRepository.create({
            active,
            frequencyMinutes,
            title,
            description,
            user, // Assign the user relationship
            device, // Assign the device relationship
        });
    }
    console.log(config)
    return this.configRepository.save(config);
  }

  async findOne(userId: string, deviceId: string): Promise<NotificationConfig> {
    const config = await this.configRepository.findOne({
        where: {
            user: { id: userId },
            device: { id: deviceId },
        },
        relations: ['user', 'device'], // Ensure relationships are loaded
    });

    if (!config) {
        throw new NotFoundException(`NotificationConfig not found for userId: ${userId} and deviceId: ${deviceId}`);
    }

    return config;
  }

  async update(userDeviceId: string, updateDto: UpdateNotificationConfigDto) {
    const config = await this.configRepository.findOne({
      where: { device: { id: userDeviceId } },
      relations: ['device', 'device.user']
    });

    if (!config) {
      throw new Error('NotificationConfig not found');
    }
    await this.configRepository.update(userDeviceId, updateDto);
    Object.assign(config, updateDto); // Cập nhật các trường từ DTO
    return this.configRepository.save(config); // Lưu lại thay đổi
  }

  async remove(userDeviceId: string) {
    const config = await this.configRepository.findOne({
      where: { device: { id: userDeviceId } },
      relations: ['device', 'device.user'], // Load các mối quan hệ cần thiết
    });

    if (!config) {
      throw new Error('NotificationConfig not found');
    }

    await this.configRepository.remove(config); // Xóa NotificationConfig
  }

  @Cron('*/5 * * * * *')
  async handleCron() {
    
    const configs = await this.configRepository.find({ where: { active: true }});
    const now = new Date();
    // 
    for (const config of configs) {
      
      const nextSendTime = new Date(config.lastSentAt || 0);
      nextSendTime.setMinutes(nextSendTime.getMinutes() + config.frequencyMinutes);

      if (!config.lastSentAt || now >= nextSendTime) {
        
        await this.sendNotification(config.user.id, config.device.id);
        
        config.lastSentAt = now;
        await this.configRepository.save(config);
      }
    }
  }

  private async sendNotification(userId: string, deviceId: string) {

    const config = await this.configRepository.findOne({
      where: {
        user: { id: userId },
        device: { id: deviceId },
      },
      relations: ['device', 'user'], // Ensure relations are loaded
    });

    if (!config || !config.device || !config.user) {
      throw new Error('NotificationConfig, User, or Device not found');
    }

    const email = config.user.email; // Use email from related User entity

    // Fetch device data using DeviceService
    const deviceData = await this.deviceService.getDeviceData(config.device.id);

    // Check device status based on type using PlantService
    let statusMessage = '';
    if (config.device.type === 'soil') {
      statusMessage = this.plantService.checkSoilMoisture(deviceData[0].value);
      if (statusMessage === '1')
        return;
    } else if (config.device.type === 'air') {
      statusMessage = this.plantService.checkAirHumidity(deviceData[0].value);
      if (statusMessage === '1')
        return;
    }

    // Send email notification
    console.log(`Sending email to ${email} with status: ${statusMessage}`);
    await this.mailerService.sendMail({
      to: email,
      template: './notification.hbs',
      subject: `Notification for Device ${config.device.deviceName}`,
      context: {
        username: config.user.fullName,
        deviceName: config.device.deviceName,
        time: new Date().toLocaleString(),
        message: statusMessage, // Include status message in the email
      },
    });
  }
}