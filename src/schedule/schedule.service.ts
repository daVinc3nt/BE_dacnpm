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
import { BaseService } from "src/common/service/base_service";
import { Logger } from '@nestjs/common';
import { interval } from "rxjs";
@Injectable()
export class ScheduleService extends BaseService<Schedule, Repository<Schedule>> {
    constructor(
        @InjectRepository(Schedule)
        private readonly scheduleRepository: Repository<Schedule>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Device)
        private readonly deviceRepository: Repository<Device>,
        private readonly deviceService: DeviceService,
        protected readonly logger: Logger
    ) {
        super(scheduleRepository, logger)
    }
    private delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    async handleScheduleCheck() {
        const now = new Date();
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

        const triggerTasks = lastArr.map((element) => {
            return (async () => {
                try {
                    console.log(`${element.action === "On" ? "Bật" : "Tắt"} thiết bị ${element.device.id}`);
                    await this.deviceService.triggerAction(
                        element.device.qrCode,
                        element.action === "On" ? "100" : "0"
                    );


                    if (element.actionTime && element.actionTime !== 0) {
                        await this.delay(element.actionTime * 1000);
                        console.log(`${element.action === "On" ? "Tắt" : "Bật"} thiết bị ${element.device.id}`);
                        await this.deviceService.triggerAction(
                            element.device.qrCode,
                            element.action === "On" ? "0" : "100"
                        );
                    }

                    element.lastActive = new Date();
                    return element;
                } catch (error) {
                    console.error(`Lỗi thiết bị ${element.device.id}:`, error);
                    return null;
                }
            })();
        });

        Promise.allSettled(triggerTasks).then((results) => {
            const success = results
                .filter(r => r.status === "fulfilled" && r.value)
                .map(r => (r as PromiseFulfilledResult<any>).value);

            if (success.length > 0) {
                this.scheduleRepository.save(success)
                    .then(() => console.log("Lưu trạng thái thiết bị thành công"))
                    .catch(err => console.error("Lỗi khi lưu trạng thái:", err));
            }
        });
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

        let errors: string[] = [];

        const userEnt = await this.userRepository.findOne({ where: { id: userId } })
        if (!userEnt)
            errors.push(`Not found user with id ${userId}`)

        const deviceEnt = await this.deviceRepository.findOne({ where: { id: deviceId } })
        if (!deviceEnt)
            errors.push(`Not found device with id ${deviceId}`)

        if (!data.action || !validAction.includes(data.action)) {
            errors.push(`Invalid status. Allowed values: ${validAction.join(', ')}`);
        }

        if (!data.conditon) {
            errors.push('Condition is required.');
        }

        const nowVN = super.getNowVnDate();

        if (!data.time)
            errors.push('Time is required.');
        else if (data.repeat) {
            if (!validRepeat.includes(data.repeat))
                errors.push(`Invalid repeat. Allowed values: ${validRepeat.join(', ')}`)
            else
                switch (data.repeat) {
                    case "daily":
                        if (!isValidTimeOfDaily(data.time))
                            errors.push(`Invalid time. Allowed values: hh:mm`)
                        break;
                    case "weekly":
                        if (!isValidTimeOfWeekly(data.time))
                            errors.push(`Invalid time. Allowed values: (day in week) hh:mm`)
                        break;
                    case "monthly":
                        if (!isValidTimeOfMonthly(data.time))
                            errors.push(`Invalid time. Allowed values: (number) hh:mm`)
                        break;
                    case "x days":
                        if (!isValidXDaysFormat(data.time))
                            errors.push(`Invalid time. Allowed values: (number) hh:mm with number in range(1-99) is days to repeat`)
                        else {
                            data.lastActive = nowVN
                        }
                        break;
                }
        }

        if (errors.length > 0) {
            throw new BadRequestException(errors);
        }

        let createDate = nowVN;
        let updateDate = nowVN;

        const newDevice = this.scheduleRepository.create({
            ...data,
            device: { id: deviceId },
            user: { id: userId },
            createDate,
            updateDate,
        });
        const savedDevice = await this.scheduleRepository.save(newDevice);

        return savedDevice;
    }

    async updateSchedule(id: string, updateScheduleDto: UpdateScheduleDto): Promise<Schedule> {
        if (!isValidUUID(id)) {
            throw new BadRequestException("Id not in UUID format");
        }

        const schedule = await super.findById(id);

        Object.assign(schedule, updateScheduleDto);
        schedule.updateDate = new Date();

        return this.scheduleRepository.save(schedule);
    }

    async deleteSchedule(id: string): Promise<void> {
        if (!isValidUUID(id)) {
            throw new BadRequestException("Id not in UUID format");
        }

        await super.findById(id);

        await super.delete(id);
    }
}