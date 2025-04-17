import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationConfig } from './notification.entity';
import { CreateNotificationConfigDto } from './dto/notification.create.dto';
import { UpdateNotificationConfigDto } from './dto/notification.update.dto';
import { Cron } from '@nestjs/schedule';
import { MailerService } from '@nestjs-modules/mailer';
import { DeviceService } from '../device/device.service'; // Import DeviceService
import { PlantService } from '../plant/plant.servive'; // Import PlantService

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(NotificationConfig)
    private readonly configRepository: Repository<NotificationConfig>,
    private readonly mailerService: MailerService,
    private readonly deviceService: DeviceService, // Inject DeviceService
    private readonly plantService: PlantService, // Inject PlantService
  ) {}

  async createOrUpdate(createDto: CreateNotificationConfigDto) {
    const { userId, frequencyMinutes, deviceId } = createDto;

    // Thêm relations để lấy đầy đủ thông tin liên quan
    let config = await this.configRepository.findOne({
      where: { device: { id: deviceId } },
      relations: ['device', 'device.user'], // Load các mối quan hệ cần thiết
    });

    if (config) {
      config.frequencyMinutes = frequencyMinutes;
    } else {
      config = this.configRepository.create({
        device: { id: deviceId },
        user: { id: userId },
        frequencyMinutes,
      });
    }

    return this.configRepository.save(config);
  }

  async findOne(userId: string, deviceId: string) {
    return this.configRepository.findOne({
      where: {
        device: {
          id: deviceId,
          user: { id: userId },
        },
      },
      relations: ['device', 'device.user'], // Không cần lặp lại 'device'
    });
  }

  async update(userDeviceId: string, updateDto: UpdateNotificationConfigDto) {
    const config = await this.configRepository.findOne({
      where: { device: { id: userDeviceId } },
      relations: ['device', 'device.user']
    });

    if (!config) {
      throw new Error('NotificationConfig not found');
    }

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
    } else if (config.device.type === 'air') {
      statusMessage = this.plantService.checkAirHumidity(deviceData[0].value);
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