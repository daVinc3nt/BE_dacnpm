import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { DeviceService } from './device.service';
import { Device } from './device.entity';
import { isValidUUID, validAction, validStatus } from 'src/common/helper';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';

@Controller('device')
export class DeviceController {
  constructor(
    private readonly deviceService: DeviceService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) { }
  // get all
  // get device with id
  // get by userId ex: Params {"userId":"(id of user)"}
  // get by actione ex: Params {"action":"Motor"}, {"action":"Humidity"}
  // get by status ex : Params {"status":"active"}
  // date format : Params {startDate: "2025-03-26 00:00"}
  @Get()
  async getDevices(
    @Query("id") id: string,
    @Query("userId") userId: string,
    @Query("action") action: string,
    @Query("status") status: string,
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string
  ) {
    if (id) {
      if (!isValidUUID(id))
        throw new BadRequestException("Id not in UUID format")
      return this.deviceService.getDeviceById(id);
    }
    const whereCondition: any = {};
    
    if (userId) {
      if (!isValidUUID(userId))
        throw new BadRequestException("UserId not in UUID format")
      
      const userEnt = this.userRepository.findOne({ where: { id: userId } })
      if (!userEnt)
        throw new BadRequestException("Not found user");

      whereCondition.user = { id: userId }
    }

    if (action)
      whereCondition.action = action

    if (status) {
      if (!validStatus.includes(status))
        throw new BadRequestException(`Invalid status. Allowed values: ${validStatus.join(', ')}`)
      whereCondition.status = status
    }

    return this.deviceService.getDevicesByConditions(startDate, endDate, whereCondition)
  }

  // Example: {"userId": "userid", deviceName":"Motor 001","action":"Motor","qrCode":"123456789","status":"active"}
  @Post()
  async addDevice(@Body("userId") userId: string, @Body() data: Device): Promise<Device> {
    if (!userId)
      throw new BadRequestException("User id require")
    return this.deviceService.addDevice(userId, data);
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
