import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, LessThan, MoreThan, Repository } from "typeorm";

import { Device } from "./device.entity";
import { UUID } from "crypto";

@Injectable()
export class DeviceService {
    constructor(
        @InjectRepository(Device)
        private readonly deviceRepository: Repository<Device>
    ) { }

    async getAllDevices(): Promise<Device[]> {
        const list_device = await this.deviceRepository.find();
        if (!list_device.length)
            return [];
        return list_device;
    }

    async getDeviceById(id: string): Promise<Device> {
        const device = await this.deviceRepository.findOne({ where: { id: id } });
        if (!device) {
            throw new NotFoundException(`Device with ID ${id} not found`);
        }
        return device;
    }

    async getDevicesByConditions(action?: string, status?: string, startDate?: string, endDate?: string): Promise<Device[]> {
        const whereCondition: any = {};

        const validStatuses = ['active', 'inactive', 'maintenance'];
        if (status)
            if (validStatuses.includes(status))
                whereCondition.status = status;
            else
                throw new BadRequestException(`Invalid status. Allowed values: ${validStatuses.join(', ')}`)

        if (action)
            whereCondition.action = action;

        let parsedStartDate: Date | undefined;
        let parsedEndDate: Date | undefined;

        if (startDate) {
            let formattedStartDate = startDate.replace(" ", "T");
            parsedStartDate = new Date(formattedStartDate);
            if (isNaN(parsedStartDate.getTime())) {
                throw new BadRequestException(`Invalid startDate format: ${startDate}`);
            }
        }

        if (endDate) {
            let formattedEndDate = endDate.replace(" ", "T");
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

    async addDevice(data: Device): Promise<Device> {
        const errors: string[] = [];

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

        const validStatuses = ['active', 'inactive', 'maintenance'];
        if (!data.status || !validStatuses.includes(data.status)) {
            errors.push(`Invalid status. Allowed values: ${validStatuses.join(', ')}`);
        }

        if (!data.action) {
            errors.push('Action is required.');
        }

        if (errors.length > 0) {
            throw new BadRequestException(errors);
        }

        const nowUTC = new Date();
        data.createDate = data.updateDate = new Date(nowUTC.getTime() + 7 * 60 * 60 * 1000);

        const newDevice = this.deviceRepository.create(data);
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

        const validStatuses = ['active', 'inactive', 'maintenance'];
        if (data.status && !validStatuses.includes(data.status)) {
            errors.push(`Invalid status. Allowed values: ${validStatuses.join(', ')}`);
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

        const deleteDevice = await this.deviceRepository.delete({ id: id })
        if (deleteDevice.affected === 0) {
            throw new BadRequestException(`Failed to delete device with id ${id}.`);
        }

        return "Delete device successfully";
    }
}