import { Module } from '@nestjs/common';
import { DeviceController } from './device.controller';
import { DeviceService } from './device.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Device } from './device.entity';
import { User } from 'src/user/user.entity';
import { Schedule } from 'src/schedule/schedule.entity';
import { Alert } from 'src/alert/alert.entity';
import { SensorData } from 'src/sensordata/sensordata.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Device, User, Schedule, Alert, SensorData])],
    providers: [DeviceService],
    controllers: [DeviceController],
    exports: [DeviceService],
})
export class DeviceModule { }
