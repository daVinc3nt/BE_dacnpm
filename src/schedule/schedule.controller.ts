import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { Schedule } from './schedule.entity';
import { isValidUUID } from 'src/common/helper';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) { }
  // get all, get schedule by id, get by user id, get by device id
  // get by start date , end date
  @Get()
  async getSchedules(
    @Query('id') id: string,
    @Query('userId') userId: string,
    @Query('deviceId') deviceId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    if (id) {
      if (!isValidUUID(id))
        throw new BadRequestException("Id not in UUID format")
      return this.scheduleService.getScheduleById(id);
    }

    const whereCondition: any = {};

    if (userId) {
      if (!isValidUUID(userId))
        throw new BadRequestException("UserId not in UUID format")
      whereCondition.user = { id: userId }
    }
    if (deviceId) {
      if (!isValidUUID(deviceId))
        throw new BadRequestException("DeviceId not in UUID format")
      whereCondition.device = { id: deviceId }
    }

    return this.scheduleService.getScheduleByConditions(startDate, endDate, whereCondition);

  }

  // Example: {"userId":"", "deviceId":"", "action": "On", "actionTime": "124" (in sec), "conditon": "> 30" (depend on device), "repeat": "daily", "time": "06:00"}
  @Post()
  async addSchedule(
    @Body("userId") userId: string,
    @Body("deviceId") deviceId: string,
    @Body() data: Schedule
  ): Promise<Schedule> {
    if (!userId && !deviceId)
      throw new BadRequestException("Need user id and device id")

    if (!userId)
      throw new BadRequestException("Need user id")
    else if (!isValidUUID(userId))
      throw new BadRequestException("userId not in UUID format")

    if (!deviceId)
      throw new BadRequestException("Need device id")
    else if (!isValidUUID(deviceId))
      throw new BadRequestException("deviceId not in UUID format")

    return this.scheduleService.addSchedule(userId, deviceId, data);
  }

  // Example: {"action": "On", "actionTime": "124" (in sec), "conditon": "> 30" (depend on device), "repeat": "daily", "time": "06:00"}
  @Put()
  async updateSchedule(
    @Query('id') id: string,
    @Body() data: Schedule
  ): Promise<String> {
    return this.scheduleService.updateSchedule(id, data);
  }

  // Example: header:{"id":""}
  @Delete()
  async deleteSchedule(
    @Query('id') id: string
  ): Promise<String> {
    return this.scheduleService.deleteSchedule(id);
  }
}
