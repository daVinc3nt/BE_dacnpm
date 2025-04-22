import { BadRequestException, Body, Controller, Delete, Get, Headers, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { DeviceService } from './device.service';
import { Device } from './device.entity';
import { isValidUUID, validAction, validStatus } from 'src/common/helper';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { ApiBody, ApiOperation, ApiQuery, ApiTags, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';
import { CreateDeviceDto } from './dtos/device.create.dto';
import * as jwt from 'jsonwebtoken';

@ApiTags("device")
@UseGuards(JwtAuthGuard)
@Controller('device')
export class DeviceController {
  constructor(
    private readonly deviceService: DeviceService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) { }

  // -------------------- GET DEVICES --------------------
  @ApiOperation({ summary: 'Get devices with optional filters or all devices if no filters are provided' })
  @ApiQuery({ name: 'id', required: false, description: 'Filter by device ID' })
  @ApiQuery({ name: 'action', required: false, description: 'Filter by action type' })
  @ApiQuery({ name: 'status', required: false, enum: validAction, description: 'Filter by status' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Filter by start date (format: YYYY-MM-DD HH:mm)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'Filter by end date (format: YYYY-MM-DD HH:mm)' })
  @Get()
  async getDevices(
    @Query("id") id: string,
    @Query("action") action: string,
    @Query("status") status: string,
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @Headers('Authorization') authorization: string // Extract user info from token
  ): Promise<Device[]> {
    if (!authorization) {
      throw new BadRequestException("Authorization header is missing");
    }

    const token = authorization.replace('Bearer ', '');
    const decoded: any = this.decodeToken(token); // Decode the token to get user info
    console.log("hello", decoded)
    const currentUserId = decoded.id;

    if (!currentUserId) {
      throw new BadRequestException("Invalid token or user ID");
    }

    if (id) {
      if (!isValidUUID(id)) {
        throw new BadRequestException("Id not in UUID format");
      }
      const device = await this.deviceService.findById(id, ['user']);
      if (device.user.id !== currentUserId) {
        throw new BadRequestException("You are not authorized to access this device");
      }
      return [device]; // Wrap the single device in an array
    }

    const whereCondition: any = { user: { id: currentUserId } }; // Restrict to devices owned by the current user

    if (action) {
      whereCondition.action = action;
    }

    if (status) {
      if (!validStatus.includes(status)) {
        throw new BadRequestException(`Invalid status. Allowed values: ${validStatus.join(', ')}`);
      }
      whereCondition.status = status;
    }

    return this.deviceService.getDevicesByConditions(startDate, endDate, whereCondition);
  }

  private decodeToken(token: string): any {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'defaultSecret');
    } catch (error) {
      throw new BadRequestException("Invalid token");
    }
  }

  // -------------------- ADD DEVICE --------------------
  @ApiOperation({ summary: "Add a new device to the system" })
  @ApiBody({
    description: 'Data required to create a new device',
    schema: {
      example: {
        deviceName: 'Motor 001',
        action: 'trigger',
        qrCode: 'smart-farm-project-pump',
        status: 'active',
        userId: '550e8400-e29b-41d4-a716-446655440000', // Updated to a valid UUID
        type: 'pump',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Device created successfully',
    schema: {
      example: {
        id: 'device-id-123',
        deviceName: 'Motor 001',
        action: 'trigger',
        qrCode: 'smart-farm-project-pump',
        status: 'active',
        userId: '550e8400-e29b-41d4-a716-446655440000', // Updated to a valid UUID
        type: 'pump',
        createDate: '2023-01-01T12:00:00Z',
        updateDate: '2023-01-01T12:00:00Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Invalid input data',
  })
  @Post("add")
  async addDevice(
    @Body("userId") userId: string,
    @Body() data: CreateDeviceDto
  ): Promise<Device> {
    if (!userId)
      throw new BadRequestException("User id require");
    if (!isValidUUID(userId))
      throw new BadRequestException("User id not in format UUID");
    return this.deviceService.addDevice(data);
  }

  // -------------------- UPDATE DEVICE --------------------
  @ApiOperation({ summary: "Update an existing device" })
  @ApiQuery({ name: 'id', required: true, description: 'ID of the device to update' })
  @ApiBody({
    schema: {
      example: {
        deviceName: 'Motor 001',
        action: 'Motor',
        qrCode: '123456789',
        status: 'active'
      }
    }
  })
  @Put("update")
  async updateDevice(
    @Query('id') id: string,
    @Body() data: Device
  ): Promise<String> {
    return this.deviceService.updateDevice(id, data);
  }

  // -------------------- DELETE DEVICE --------------------
  @ApiOperation({ summary: "Delete a device" })
  @ApiQuery({ name: 'id', required: true, description: 'ID of the device to delete' })
  @Delete("delete")
  async deleteDevice(@Query('id') id: string): Promise<String> {
    return this.deviceService.deleteDevice(id);
  }

  // -------------------- TRIGGER ACTION --------------------
  @ApiOperation({ summary: "Trigger an action on a device" })
  @ApiQuery({ name: 'value', required: true, description: 'Value to trigger the action (range: 0 - 100)' })
  @ApiQuery({ name: 'qrCode', required: true, description: 'QR Code of the device to trigger the action, name of repo' })
  @Post('triggeraction')
  async triggerAction(
    @Query('value') value: string,
    @Query('qrCode') qrCode: string
  ): Promise<string> {
    if (!value) {
      throw new BadRequestException("Value is required");
    }
    if (!qrCode) {
      throw new BadRequestException("Unknow qr code");
    }
    return this.deviceService.triggerAction(value, qrCode);
  }

  // -------------------- GET DATA --------------------
  @ApiOperation({ summary: "Get data of a device by ID" })
  @ApiQuery({
    name: 'deviceId',
    required: true,
    description: 'ID of the device to retrieve data',
    example: '44C9423E-F36B-1410-81F1-005102F3C87D' // Example device ID
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved device data',
    schema: {
      example: {
        id: 'data-id',
        value: '50',
        created_at: '2023-01-01T12:00:00Z',
        updated_at: '2023-01-01T12:00:00Z'
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Device ID is required or invalid'
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Failed to retrieve data'
  })
  @Get('getdata')
  async getData(@Query('deviceId') deviceId: string): Promise<string> {
    if (!deviceId) {
      throw new BadRequestException("Device ID is required");
    }
    return this.deviceService.getDeviceData(deviceId);
  }

  // -------------------- GET FIRST DATA POINTS FOR USER --------------------
  @ApiOperation({ summary: 'Get the first data points of all devices with action "view" for a specific user' })
  @ApiQuery({ name: 'userId', required: true, description: 'ID of the user to fetch data for' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved the first data points for all devices',
    schema: {
      example: [
        { id: 'data-id-1', value: '50', created_at: '2023-01-01T12:00:00Z' },
        { id: 'data-id-2', value: '60', created_at: '2023-01-02T12:00:00Z' },
      ],
    },
  })
  @ApiResponse({ status: 404, description: 'No devices with action "view" found for the user' })
  @Get('first-data-points')
  async getFirstDataPointsForUser(@Query('userId') userId: string): Promise<any[]> {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    return this.deviceService.getFirstDataPointsForUser(userId);
  }
}
