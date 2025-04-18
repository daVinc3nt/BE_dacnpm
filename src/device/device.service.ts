import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, LessThan, MoreThan, Repository } from "typeorm";
import axios from "axios"; // Add this import for making HTTP requests

import { Device } from "./device.entity";
import { User } from "src/user/user.entity";
import { validStatus } from "src/common/helper";
import { Schedule } from "src/schedule/schedule.entity";
import { CreateDeviceDto } from './dtos/device.create.dto'; // Import the DTO
import { UpdateDeviceDto } from './dtos/device.update.dto'; // Import the DTO

@Injectable()
export class DeviceService {
    private readonly validDeviceTypes = ['light', 'soil', 'air', 'pump']; // Updated valid types

    constructor(
        @InjectRepository(Device)
        private readonly deviceRepository: Repository<Device>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Schedule)
        private readonly scheduleRepository: Repository<Schedule>,
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

    async addDevice(data: CreateDeviceDto): Promise<Device> {
        // if (!this.validDeviceTypes.includes(data.type)) {
        //     throw new BadRequestException(`Invalid device type. Allowed values: ${this.validDeviceTypes.join(', ')}`);
        // }

        const userEnt = await this.userRepository.findOne({ where: { id: data.userId } });
        if (!userEnt) {
            throw new BadRequestException(`User not found with id ${data.userId}`);
        }

        const existingDevice = await this.deviceRepository.findOne({
            where: { deviceName: data.deviceName },
        });
        if (existingDevice) {
            throw new BadRequestException('Device name already exists.');
        }

        const nowUTC = new Date();
        const newDevice = this.deviceRepository.create({
            ...data,
            createDate: new Date(nowUTC.getTime() + 7 * 60 * 60 * 1000),
            updateDate: new Date(nowUTC.getTime() + 7 * 60 * 60 * 1000),
            // user: { id: userId },
        });

        return await this.deviceRepository.save(newDevice);
    }

    async updateDevice(id: string, data: UpdateDeviceDto): Promise<string> {
        if (!id) {
            throw new BadRequestException('Device ID is required.');
        }

        const existingDevice = await this.deviceRepository.findOne({ where: { id } });
        if (!existingDevice) {
            throw new NotFoundException(`Device with ID ${id} not found`);
        }

        if (data.deviceName) {
            const duplicateDevice = await this.deviceRepository.findOne({
                where: { deviceName: data.deviceName },
            });
            if (duplicateDevice && duplicateDevice.id !== id) {
                throw new BadRequestException('Device name already exists.');
            }
        }

        if (data.status && !validStatus.includes(data.status)) {
            throw new BadRequestException(`Invalid status. Allowed values: ${validStatus.join(', ')}`);
        }

        if (data.type && !this.validDeviceTypes.includes(data.type)) {
            throw new BadRequestException(`Invalid device type. Allowed values: ${this.validDeviceTypes.join(', ')}`);
        }

        const nowUTC = new Date();
        const updatedData = {
            ...data,
            updateDate: new Date(nowUTC.getTime() + 7 * 60 * 60 * 1000),
        };

        const updateResult = await this.deviceRepository.update({ id }, updatedData);
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

        const deleteDevice = await this.deviceRepository.delete({ id: id })
        if (deleteDevice.affected === 0) {
            throw new BadRequestException(`Failed to delete device with id ${id}.`);
        }

        return "Delete device successfully";
    }

    async triggerAction( qrCode: string, value: string): Promise<string> {
        const url = `https://io.adafruit.com/api/v2/hoahaoce/feeds/${qrCode}/data`;
        const headers = {
            "X-AIO-Key": process.env.ADAFRUIT_IO_KEY || 123456,
            "Content-Type": "application/json",
        };
        const body = { value };

        try {
            const response = await axios.post(url, body, { headers });
            if (response.status === 200 || response.status === 201) {
                return "Action triggered successfully.";
            } else {
                throw new Error(`Unexpected response status: ${response.status}`);
            }
        } catch (error) {
            throw new BadRequestException(`Failed to trigger action: ${error.message}`);
        }
    }

    async getDeviceData(deviceId: string): Promise<any> {
        const device = await this.deviceRepository.findOne({ where: { id: deviceId } });
        if (!device) {
            throw new NotFoundException(`Device with ID ${deviceId} not found`);
        }

        const url = `https://io.adafruit.com/api/v2/hoahaoce/feeds/${device.qrCode}/data`;
        const headers = {
            "X-AIO-Key": process.env.ADAFRUIT_IO_KEY || "123456",
            "Content-Type": "application/json",
        };
        console.log(url)
        try {
            const response = await axios.get(url, { headers });
            if (response.status === 200) {
                return response.data; // Return the actual data from the response
            } else {
                throw new Error(`Unexpected response status: ${response.status}`);
            }
        } catch (error) {
            throw new BadRequestException(`Failed to get data: ${error.message}`);
        }
    }
}