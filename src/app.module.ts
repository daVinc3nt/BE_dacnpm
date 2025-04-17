import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from './schedule/schedule.module';
import { systemDataSource } from 'ormconfig';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TransformResponseInterceptor } from './common/response';
import { AuthModule } from './auth/auth.module';
import { DeviceModule } from './device/device.module';
import { NotificationModule } from './notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(systemDataSource.options),
    UserModule,
    AuthModule,
    DeviceModule,
    ScheduleModule,
    NotificationModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformResponseInterceptor,
    },
  ],
})
export class AppModule {}
