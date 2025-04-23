import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { MailerModule } from '@nestjs-modules/mailer';
import { NotificationConfig } from './notification.entity';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { DeviceModule } from '../device/device.module'; // Import DeviceModule
import { PlantService } from '../plant/plant.servive'; // Import PlantService
import { UserModule } from 'src/user/user.module';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationConfig]),
    ScheduleModule.forRoot(),
    MailerModule.forRootAsync({
      useFactory: () => ({
        transport: {
          host: 'smtp.gmail.com',
          port: 587,
          auth: {
            user: process.env.MAIL_USER || 'noreply.smartfarmalert@gmail.com',
            pass: process.env.MAIL_PASS || 'roaz gyjk krft irmu',
          },
        },
        defaults: {
          from: '"Smart Farm Alert" <noreply.smartfarmalert@gmail.com>',
        },
        template: {
          dir: join(process.cwd(), 'src/notification/templates'), // Ensure the path points to the correct directory
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
    }),
    UserModule,
    DeviceModule, // Add DeviceModule to imports
  ],
  controllers: [NotificationController],
  providers: [NotificationService, PlantService, Logger], // Ensure PlantService is included
})
export class NotificationModule {}
