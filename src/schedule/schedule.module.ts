import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schedule } from './schedule.entity';
import { ScheduleController } from './schedule.controller';
import { ScheduleService } from './schedule.service';
import { User } from 'src/user/user.entity';
import { Device } from 'src/device/device.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Schedule, User, Device])],
    providers: [ScheduleService],
    controllers: [ScheduleController],
    exports: [ScheduleService],
})
export class ScheduleModule { }
