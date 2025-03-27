import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { DeviceService } from './device.service';
import { Device } from './device.entity';
import { isUUID } from 'class-validator';
@Controller('device')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) { }
  // getall
  @Get()
  async getDevices(): Promise<Device[]> {
    return this.deviceService.getAllDevices();
  }
  // get by id ex:  params : "BB35CE55-EF0A-F011-887C-34F39AF2D0E0"
  @Get("id")
  async getDeviceById(@Query('id') id: string): Promise<Device> {
    if(!id)
      throw new BadRequestException("Need id")
    return this.deviceService.getDeviceById(id);
  }

  // get by actione ex: Params {"action":"Motor"}, {"action":"Humidity"}
  // get by status ex : Params {"status":"active"}
  // date format : Params {startDate: "2025-03-26 00:00"}
  @Get("condition")
  async getDevicesByConditions(
    @Query("action") action?: string,
    @Query("status") status?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string
  ): Promise<Device[]>  {
    return this.deviceService.getDevicesByConditions(action, status,startDate, endDate);
  }

  // Example: {"deviceName":"Motor 001","action":"Motor","qrCode":"123456789","status":"active"}
  @Post()
  async addDevice(@Body() data: Device): Promise<Device> {
    return this.deviceService.addDevice(data);
  }

  // Example: params:{"id":""} {"deviceName":"Motor 001","action":"Motor","qrCode":"123456789","status":"active"}
  @Put()
  async updateDevice(@Query('id') id: string, @Body() data: Device): Promise<String> {
    return this.deviceService.updateDevice(id, data);
  }

  // Example: params:{"id":""}
  @Delete()
  async deleteDevice(@Query('id') id: string): Promise<String> {
    return this.deviceService.deleteDevice(id);
  }
}
