import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { Schedule } from './schedule.entity';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) { }
  // getall
  @Get()
  async getSchedules() {
    return this.scheduleService.getAllSchedule();
  }
  // get by id
  @Get(":id")
  async getScheduleById(@Param('id') id: string) {
    return this.scheduleService.getScheduleById(id);
  }

  // get header: {startDate: "", endDate: ""}
  @Get("get-condition")
  async getSchedulesByConditions(
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string
  ) {
    return this.scheduleService.getScheduleByConditions(startDate, endDate);
  }

  // Example: {"action": "Turn On", "conditon": "Temperature > 30°C", "repeat": "daily", "time": "2025-03-30 06:00"}
  @Post()
  async addSchedule(@Body() data: Schedule): Promise<Schedule> {
    return this.scheduleService.addSchedule(data);
  }

  // Example: {"action": "Turn On", "conditon": "Temperature > 30°C", "repeat": "daily", "time": "2025-03-30 06:00"}
  @Put()
  async updateSchedule(@Query('id') id: string, @Body() data: Schedule): Promise<String> {
    return this.scheduleService.updateSchedule(id, data);
  }

  // Example: header:{"id":""}
  @Delete()
  async deleteSchedule(@Query('id') id: string): Promise<String> {
    return this.scheduleService.deleteSchedule(id);
  }
}
