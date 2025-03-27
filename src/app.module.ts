import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TransformResponseInterceptor } from './common/response';
import { systemDataSource } from 'ormconfig';
import { AuthModule } from './auth/auth.module';
import { DeviceModule } from './device/device.module';
import { ScheduleModule } from './schedule/schedule.module';
@Module({
  imports: [
    TypeOrmModule.forRoot(systemDataSource.options),
    UserModule,
    AuthModule,
    DeviceModule,
    ScheduleModule],
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
