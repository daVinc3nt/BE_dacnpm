import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { DeviceService } from './device.service';
import { Device } from './device.entity';
@Controller('device')
export class DeviceController {
  constructor(private readonly deviceService: DeviceService) { }

  @Get()
  async getDevices() {
    return this.deviceService.getAllDevices();
  }

  // Example: {"deviceName":"Motor 001","action":"Motor","qrCode":"123456789","status":"active"}
  @Post()
  async addDevice(@Body() data: Device): Promise<Device> {
    return this.deviceService.addDevice(data);
  }

  // Example: header:{"id":""} {"deviceName":"Motor 001","action":"Motor","qrCode":"123456789","status":"active"}
  @Put()
  async updateDevice(@Query('id') id: string, @Body() data: Device) : Promise<String>{
    return this.deviceService.updateDevice(id,data);
  }

  // Example: header:{"id":""}
  @Delete()
  async deleteDevice(@Query('id') id: string) : Promise<String>{
    return this.deviceService.deleteDevice(id);
  }
}
