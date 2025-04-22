import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schedule } from './schedule.entity';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { User } from 'src/user/user.entity';
import { Device } from 'src/device/device.entity';
import { DeviceModule } from 'src/device/device.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Schedule, User, Device]),
        DeviceModule],
    providers: [ScheduleService, Logger],
    controllers: [ScheduleController],
    exports: [ScheduleService],
})
export class ScheduleModule { }
