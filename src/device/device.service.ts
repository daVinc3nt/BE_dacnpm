import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Device } from "./device.entity";

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

    async addDevice(data: Device): Promise<Device> {
        if (!data.deviceName) {
            throw new BadRequestException('Device name is required.');
        }
        const existingDevice = await this.deviceRepository.findOne({
            where: { deviceName: data.deviceName },
        });
        if (existingDevice) {
            throw new BadRequestException('Device name already exists.');
        }

        const validStatuses = ['active', 'inactive', 'maintenance'];
        if (!data.status || !validStatuses.includes(data.status)) {
            throw new BadRequestException(
                `Invalid status. Allowed values: ${validStatuses.join(', ')}`,
            );
        }

        if (!data.action) {
            throw new BadRequestException('Action is required.');
        }

        data.createDate = data.updateDate = new Date();

        const newDevice = this.deviceRepository.create(data);
        const savedDevice = await this.deviceRepository.save(newDevice);

        return savedDevice;
    }

    async updateDevice(id: string, data: Device): Promise<String> {
        if (!id) {
            throw new BadRequestException('Device ID is required');
        }

        if (data.deviceName) {
            const existingDevice = await this.deviceRepository.findOne({
                where: { deviceName: data.deviceName },
            });
            if (existingDevice) {
                throw new BadRequestException('Device name already exists.');
            }
        }

        const validStatuses = ['active', 'inactive', 'maintenance'];
        if (data.status && !validStatuses.includes(data.status)) {
            throw new BadRequestException(
                `Invalid status. Allowed values: ${validStatuses.join(', ')}`,
            );
        }

        const nowUTC = new Date();
        data.updateDate = new Date(nowUTC.getTime() + 7 * 60 * 60 * 1000);

        const updateResult = await this.deviceRepository.update({ id: id }, data);
        if (updateResult.affected === 0) {
            throw new BadRequestException(`Failed to update device with ID ${id}.`);
        }
        return "Update successfully";
    }

    async deleteDevice(id : string) : Promise<String>{
        const resultFind = await this.deviceRepository.findOne({
            where:{id : id},
        })

        if(!resultFind)
            throw new ConflictException(`The device with id ${id} isn't exist`)

        const deleteDevice = await this.deviceRepository.delete({id:id})
        if (deleteDevice.affected === 0) {
            throw new BadRequestException(`Failed to delete device with id ${id}.`);
        }
        
        return "Delete device successfully";
    }
}