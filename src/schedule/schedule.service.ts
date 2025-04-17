import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, LessThan, MoreThan, Raw, Repository } from "typeorm";

import { Schedule } from "./schedule.entity";
import { User } from "src/user/user.entity";
import { Device } from "src/device/device.entity";
import { isValidUUID, isValidDateFormat, validRepeat, validAction, isValidTimeOfDaily, isValidTimeOfMonthly, isValidTimeOfWeekly, isValidXDaysFormat } from "src/common/helper";
import { DeviceService } from "src/device/device.service";
import { CreateScheduleDto } from "./dto/schedule.create.dto";
import { UpdateScheduleDto } from "./dto/schedule.update.dto";

@Injectable()
export class ScheduleService {
    constructor(
        @InjectRepository(Schedule)
        private readonly scheduleRepository: Repository<Schedule>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Device)
        private readonly deviceRepository: Repository<Device>,
        private readonly deviceService: DeviceService,
    ) { }

    async handleScheduleCheck() {
        const now = new Date("2025-03-11T23:00Z");
        // daily
        const nowHour = now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
        const onDaily = await this.scheduleRepository.find({ where: { repeat: "daily", time: nowHour }, relations: ['device'] })
        // weekly
        const timeOfWeekly = ["sun", "mon", "tue", "wed", "thur", "fri", "sat"]
        const dateInWeek = timeOfWeekly[now.getDay()]
        const onWeekly = await this.scheduleRepository.find({
            where: {
                repeat: "weekly",
                time: Raw(alias => `LOWER(${alias}) = LOWER(:value)`, { value: `${dateInWeek} ${nowHour}` })
            },
            relations: ['device']
        })
        // monthly
        const dateInMonth = now.getDate()
        const onMonthly = await this.scheduleRepository.find({
            where: {
                repeat: "monthly",
                time: Raw(alias => `LOWER(${alias}) = LOWER(:value)`, { value: `${dateInMonth} ${nowHour}` })
            },
            relations: ['device']
        })
        // x days
        const xDays = await this.scheduleRepository.find({ where: { repeat: "x days", }, relations: ['device'] })
        let onXDays = []
        for (const schedule of xDays) {
            if (!schedule.lastActive) continue;
            const lastActive = schedule.lastActive

            const [daysStr, timeStr] = schedule.time.split(" ");
            const timeInDays = parseInt(daysStr, 10);

            const nextRunDate = new Date(lastActive);
            nextRunDate.setDate(nextRunDate.getDate() + timeInDays);
            const [hours, minutes] = timeStr.split(":").map(Number);
            nextRunDate.setHours(hours, minutes, 0, 0);

            if (now >= nextRunDate && nowHour === timeStr) {
                onXDays.push(schedule);
            }
        }
        const lastArr = [...onDaily, ...onWeekly, ...onMonthly, ...onXDays];
        if (lastArr) {
    for (const element of lastArr) { // Thay forEach() bằng for...of
        console.log(`Chạy thiết bị với id=${element.device.id}`);
        await this.deviceService.triggerAction(element.device.id, element.action); // Chờ hoàn thành
        element.lastActive = new Date();
    }
    await this.scheduleRepository.save(lastArr); // Sau khi tất cả đã hoàn thành
}
    }

    async getAllSchedule(): Promise<Schedule[]> {
        const list_schedule = await this.scheduleRepository.find();
        if (!list_schedule.length)
            return [];
        return list_schedule;
    }

    async getScheduleById(id: string): Promise<Schedule> {
        const schedule = await this.scheduleRepository.findOne({ where: { id } });
        if (!schedule) {
            throw new NotFoundException(`Schedule with ID ${id} not found`);
        }
        return schedule;
    }

    async getScheduleByConditions(startDate: string, endDate: string, whereCondition: any): Promise<Schedule[]> {

        let parsedStartDate: Date | undefined;
        let parsedEndDate: Date | undefined;

        if (startDate) {
            let formattedStartDate = startDate.replace(" ", "T") + "Z";
            parsedStartDate = new Date(formattedStartDate);
            if (isNaN(parsedStartDate.getTime())) {
                throw new BadRequestException(`Invalid startDate format: ${startDate}`);
            }
        }

        if (endDate) {
            let formattedEndDate = endDate.replace(" ", "T") + "Z";
            parsedEndDate = new Date(formattedEndDate);
            if (isNaN(parsedEndDate.getTime())) {
                throw new BadRequestException(`Invalid endDate format: ${endDate}`);
            }
        }

        if (startDate && endDate) {
            whereCondition.createDate = Between(parsedStartDate, parsedEndDate);
        }
        else if (startDate) {
            whereCondition.createDate = MoreThan(parsedStartDate);
        }
        else if (endDate) {
            whereCondition.createDate = LessThan(parsedEndDate);
        }

        const list = await this.scheduleRepository.find({ where: whereCondition });
        if (!list)
            throw new ConflictException("Error")

        return list;
    }


    async addSchedule(createScheduleDto: CreateScheduleDto): Promise<Schedule> {
        const { userId, deviceId, ...data } = createScheduleDto;

        const deviceEnt = await this.deviceRepository.findOne({ where: { id: deviceId } });
        if (!deviceEnt) {
            throw new BadRequestException(`Not found device with id ${deviceId}`);
        }

        const nowUTC = new Date();
        const schedule = this.scheduleRepository.create({
            ...data,
            createDate: new Date(nowUTC.getTime() + 7 * 60 * 60 * 1000),
            updateDate: new Date(nowUTC.getTime() + 7 * 60 * 60 * 1000),
            device: { id: deviceId },
        });

        return this.scheduleRepository.save(schedule);
    }

    async updateSchedule(id: string, updateScheduleDto: UpdateScheduleDto): Promise<Schedule> {
        if (!isValidUUID(id)) {
            throw new BadRequestException("Id not in UUID format");
        }

        const schedule = await this.scheduleRepository.findOne({ where: { id } });
        if (!schedule) {
            throw new NotFoundException(`Schedule with ID ${id} not found`);
        }

        Object.assign(schedule, updateScheduleDto);
        schedule.updateDate = new Date();

        return this.scheduleRepository.save(schedule);
    }

    async deleteSchedule(id: string): Promise<void> {
        if (!isValidUUID(id)) {
            throw new BadRequestException("Id not in UUID format");
        }

        const schedule = await this.scheduleRepository.findOne({ where: { id } });
        if (!schedule) {
            throw new NotFoundException(`Schedule with ID ${id} not found`);
        }

        const result = await this.scheduleRepository.delete(id);
        if (result.affected === 0) {
            throw new BadRequestException(`Failed to delete schedule with ID ${id}.`);
        }
    }
}