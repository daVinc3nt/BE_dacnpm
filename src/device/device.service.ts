import { BadRequestException, ConflictException, Injectable, Logger, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Between, LessThan, MoreThan, Repository } from "typeorm";
import axios from "axios"; // Add this import for making HTTP requests

import { Device } from "./device.entity";
import { User } from "src/user/user.entity";
import { validStatus } from "src/common/helper";
import { Schedule } from "src/schedule/schedule.entity";
import { CreateDeviceDto } from './dtos/device.create.dto'; // Import the DTO
import { UpdateDeviceDto } from './dtos/device.update.dto'; // Import the DTO
import { BaseService } from "src/common/service/base_service";

@Injectable()
export class DeviceService extends BaseService<Device, Repository<Device>> {
    private readonly validDeviceTypes = ['light', 'soil', 'air', 'pump']; // Updated valid types

    constructor(
        @InjectRepository(Device)
        private readonly deviceRepository: Repository<Device>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Schedule)
        private readonly scheduleRepository: Repository<Schedule>,
        protected readonly logger: Logger
    ) {
        super(deviceRepository, logger)
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
        const userEnt = await this.userRepository.findOne({ where: { id: data.userId } });
        if (!userEnt) {
            throw new BadRequestException(`User not found with id ${data.userId}`);
        }

        const existingDevice = await this.deviceRepository.findOne({
            where: { deviceName: data.deviceName, user: { id: userEnt.id } }, // Ensure the device belongs to the user
        });
        if (existingDevice) {
            throw new BadRequestException('Device name already exists for this user.');
        }

        const nowUTC = new Date();
        const newDevice = this.deviceRepository.create({
            ...data,
            createDate: new Date(nowUTC.getTime() + 7 * 60 * 60 * 1000),
            updateDate: new Date(nowUTC.getTime() + 7 * 60 * 60 * 1000),
            user: { id: userEnt.id }
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

        if (existingDevice.status === 'Manual Only') {
            throw new BadRequestException('Cannot update a device with status "Manual Only".');
        }

        if (existingDevice.type === 'view' && (data.status === 'Manual' || data.status === 'Manual Only')) {
            throw new BadRequestException('Cannot update a device of type "view" to status "Manual" or "Manual Only".');
        }
        if (data.type === 'pump') {
            const url = `https://io.adafruit.com/api/v2/hoahaoce/feeds/${data.qrCode}-state/data`;
            if (!data.qrCode) {
                throw new BadRequestException('QR code is required.');
            }
            const headers = {
                "X-AIO-Key": process.env.ADAFRUIT_IO_KEY || "123456",
                "Content-Type": "application/json",
            };
    
            let value;
            if (data.status) {
                if (data.status === 'Manual') {
                    value = "1";
                } else if (data.status === 'Auto') {
                    value = "0";
                } else {
                    throw new BadRequestException('Invalid status value. Allowed values: Manual, Auto.');
                }
            }
    
            const body = { value };
    
            console.log("Sending to:", url);
            console.log("Body:", body);
    
            const response = await axios.post(url, body, { headers });
    
            if (response.status !== 200 && response.status !== 201) {
                throw new Error(`Unexpected response status: ${response.status}`);
            }
        }


        if (data.deviceName) {
            const duplicateDevice = await this.deviceRepository.findOne({
                where: { deviceName: data.deviceName },
            });
            if (duplicateDevice && duplicateDevice.id !== id) {
                throw new BadRequestException('Device name already exists.');
            }
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

        const schedules = await this.scheduleRepository.find({ where: { device: { id: id } } })
        await Promise.all(schedules.map(schedule =>
            this.scheduleRepository.delete({ id: schedule.id })
        ));

        const deleteDevice = await this.deviceRepository.delete({ id: id })
        if (deleteDevice.affected === 0) {
            throw new BadRequestException(`Failed to delete device with id ${id}.`);
        }

        return "Delete device successfully";
    }

    async triggerAction(qrCode: string, value: string): Promise<string> {
        const url = `https://io.adafruit.com/api/v2/hoahaoce/feeds/${qrCode}/data`;
        const headers = {
            "X-AIO-Key": process.env.ADAFRUIT_IO_KEY || 123456,
            "Content-Type": "application/json",
        };
        const body = { value };
        console.log(url, body, { headers })
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

    async getFirstDataPointsForUser(userId: string): Promise<{ label: string; value: any }[]> {
        // Fetch all devices for the user with action 'trigger'
        const devices = await this.deviceRepository.find({
            where: { user: { id: userId }, action: 'view' },
            relations: ['user'],
        });

        if (!devices.length) {
            throw new NotFoundException(`No devices with action 'trigger' found for user with ID ${userId}`);
        }

        const firstDataPoints = await Promise.all(
            devices.map(async (device) => {
                const deviceData = await this.getDeviceData(device.id); // Fetch data for the device
                if (deviceData.length > 0) {
                    return { label: device.deviceName, value: deviceData[0].value }; // Return object with label and value
                }
                return null; // If no data, return null
            })
        );

        // Filter out null values (devices with no data)
        return firstDataPoints.filter((dataPoint) => dataPoint !== null);
    }
}