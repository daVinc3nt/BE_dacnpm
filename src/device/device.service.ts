import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, LessThan, MoreThan, Repository } from "typeorm";

import { Device } from "./device.entity";
import { User } from "src/user/user.entity";
import { validStatus } from "src/common/helper";
import { Schedule } from "src/schedule/schedule.entity";
import { SensorData } from "src/sensordata/sensordata.entity";
import { Alert } from "src/alert/alert.entity";

@Injectable()
export class DeviceService {
    constructor(
        @InjectRepository(Device)
        private readonly deviceRepository: Repository<Device>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Schedule)
        private readonly scheduleRepository: Repository<Schedule>,
        @InjectRepository(SensorData)
        private readonly sendorDataRepository: Repository<SensorData>,
        @InjectRepository(Alert)
        private readonly alertRepository: Repository<Alert>
    ) { }

    async getDeviceById(id: string): Promise<Device> {
        const device = await this.deviceRepository.findOne({ where: { id: id } });
        if (!device) {
            throw new NotFoundException(`Device with ID ${id} not found`);
        }
        return device;
    }

    async getDevicesByConditions(startDate: string, endDate: string, whereCondition: any): Promise<Device[]> {
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

        const list = await this.deviceRepository.find({ where: whereCondition });
        if (!list)
            throw new ConflictException("Error")

        return list;
    }

    async addDevice(userId: string, data: Device): Promise<Device> {
        const errors: string[] = [];

        const userEnt = await this.userRepository.findOne({ where: { id: userId } })
        if (!userEnt) {
            errors.push(`User not found with id ${userId}`)
        }

        if (!data.deviceName) {
            errors.push('Device name is required.');
        } else {
            const existingDevice = await this.deviceRepository.findOne({
                where: { deviceName: data.deviceName },
            });
            if (existingDevice) {
                errors.push('Device name already exists.');
            }
        }

        if (!data.status || !validStatus.includes(data.status)) {
            errors.push(`Invalid status. Allowed values: ${validStatus.join(', ')}`);
        }

        if (!data.action) {
            errors.push('Action is required.');
        }

        if (errors.length > 0) {
            throw new BadRequestException(errors);
        }

        const nowUTC = new Date();
        data.createDate = data.updateDate = new Date(nowUTC.getTime() + 7 * 60 * 60 * 1000);

        const newDevice = this.deviceRepository.create({
            ...data,
            user: { id: userId }
        });
        return await this.deviceRepository.save(newDevice);
    }

    async updateDevice(id: string, data: Device): Promise<string> {
        const errors: string[] = [];

        if (!id) {
            errors.push('Device ID is required.');
        }
        const idDevice = await this.deviceRepository.findOne({ where: { id: id } })
        if (!idDevice) {
            throw new NotFoundException(`Device with ID ${id} not found`);
        }

        if (data.deviceName) {
            const existingDevice = await this.deviceRepository.findOne({
                where: { deviceName: data.deviceName },
            });
            if (existingDevice) {
                errors.push('Device name already exists.');
            }
        }

        if (data.status && !validStatus.includes(data.status)) {
            errors.push(`Invalid status. Allowed values: ${validStatus.join(', ')}`);
        }

        if (errors.length > 0) {
            throw new BadRequestException(errors);
        }

        const nowUTC = new Date();
        data.updateDate = new Date(nowUTC.getTime() + 7 * 60 * 60 * 1000);

        const updateResult = await this.deviceRepository.update({ id: id }, data);
        if (updateResult.affected === 0) {
            throw new BadRequestException(`Failed to update device with ID ${id}.`);
        }
        return 'Update successfully';
    }


    async deleteDevice(id: string): Promise<String> {
        const resultFind = await this.deviceRepository.findOne({
            where: { id: id },
        })

        if (!resultFind)
            throw new ConflictException(`The device with id ${id} isn't exist`)

        const schedules = await this.scheduleRepository.find({where:{ device: {id: id}}})
        await Promise.all(schedules.map(schedule => 
            this.scheduleRepository.delete({ id: schedule.id })
        ));

        const alerts = await this.alertRepository.find({where:{ device: {id: id}}})
        await Promise.all(alerts.map(alert => 
            this.alertRepository.delete({ id: alert.id })
        ));

        const sensorDatas = await this.sendorDataRepository.find({where:{ device: {id: id}}})
        await Promise.all(sensorDatas.map(sensorData => 
            this.sendorDataRepository.delete({ id: sensorData.id })
        ));

        const deleteDevice = await this.deviceRepository.delete({ id: id })
        if (deleteDevice.affected === 0) {
            throw new BadRequestException(`Failed to delete device with id ${id}.`);
        }

        return "Delete device successfully";
    }
}