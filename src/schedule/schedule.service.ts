import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, LessThan, MoreThan, Raw, Repository } from "typeorm";

import { Schedule } from "./schedule.entity";
import { User } from "src/user/user.entity";
import { Device } from "src/device/device.entity";
import { isValidUUID, isValidDateFormat, validRepeat, validAction, isValidTimeOfDaily, isValidTimeOfMonthly, isValidTimeOfWeekly, isValidXDaysFormat } from "src/common/helper";
@Injectable()
export class ScheduleService {
    constructor(
        @InjectRepository(Schedule)
        private readonly scheduleRepository: Repository<Schedule>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Device)
        private readonly deviceRepository: Repository<Device>
    ) { }

    async handleSchuduleCheck() {
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
            lastArr.forEach(element => {
                console.log(`Chạy thiết bị với id=${element.device.id}`)
                element.lastActive = new Date()
            });
            await this.scheduleRepository.save(lastArr)
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


    async addSchedule(userId: string, deviceId: string, data: Schedule): Promise<Schedule> {
        let errors: string[] = [];

        // const userEnt = await this.userRepository.findOne({ where: { id: userId } })
        // if (!userEnt)
        //     errors.push(`Not found user with id ${userId}`)

        const deviceEnt = await this.deviceRepository.findOne({ where: { id: deviceId } })
        if (!deviceEnt)
            errors.push(`Not found device with id ${deviceId}`)

        if (!data.action || !validAction.includes(data.action)) {
            errors.push(`Invalid status. Allowed values: ${validAction.join(', ')}`);
        }

        if (!data.conditon) {
            errors.push('Condition is required.');
        }

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
                            errors.push(`Invalid time. Allowed is a number in range(1-99) `)
                        else
                            data.lastActive = new Date()
                        break;
                }
        }

        if (errors.length > 0) {
            throw new BadRequestException(errors);
        }

        const nowUTC = new Date();
        data.createDate = data.updateDate = new Date(nowUTC.getTime() + 7 * 60 * 60 * 1000);

        const newDevice = this.scheduleRepository.create({
            ...data,
            // user: { id: userId },
            device: { id: deviceId }
        });
        const savedDevice = await this.scheduleRepository.save(newDevice);

        return savedDevice;
    }

    async updateSchedule(id: string, data: Schedule): Promise<String> {
        const errors: string[] = [];

        if (!id) {
            errors.push('Shedule ID is required.');
        }
        if (!isValidUUID(id))
            throw new BadRequestException("Id not in UUID format")

        const idSchedule = await this.scheduleRepository.findOne({ where: { id: id } })
        if (!idSchedule) {
            throw new NotFoundException(`Shedule with ID ${id} not found`);
        }

        if (data.action && !validAction.includes(data.action)) {
            errors.push(`Invalid status. Allowed values: ${validAction.join(', ')}`);
        }

        if (data.repeat || data.time)
            if (!data.time)
                errors.push('Time is required.');
        if (!data.repeat)
            errors.push('Repeat is required.');
        else if (data.repeat) {
            if (!validRepeat.includes(data.repeat) && !isValidXDaysFormat(data.repeat))
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
                }
        }


        if (errors.length > 0) {
            throw new BadRequestException(errors);
        }

        const nowUTC = new Date();
        data.updateDate = new Date(nowUTC.getTime() + 7 * 60 * 60 * 1000);

        const updateResult = await this.scheduleRepository.update({ id: id }, data);
        if (updateResult.affected === 0) {
            throw new BadRequestException(`Failed to update schedule with ID ${id}.`);
        }
        return 'Update successfully';
    }

    async deleteSchedule(id: string): Promise<String> {
        if (!isValidUUID(id))
            throw new BadRequestException("Id not in UUID format")

        const resultFind = await this.scheduleRepository.findOne({
            where: { id: id },
        })

        if (!resultFind)
            throw new NotFoundException(`The schedule with id ${id} isn't exist`)

        const deleteDevice = await this.scheduleRepository.delete({ id: id })
        if (deleteDevice.affected === 0) {
            throw new BadRequestException(`Failed to delete schedule with id ${id}.`);
        }

        return "Delete schedule successfully";
    }
}