import { BadRequestException, Body, Controller, Delete, Get, Logger, Param, Post, Put, Query } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { Schedule } from './schedule.entity';
import { isValidUUID } from 'src/common/helper';
import { Interval } from '@nestjs/schedule';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags("Schedule")
@Controller('schedule')
export class ScheduleController {
  private readonly logger = new Logger(ScheduleController.name)

  constructor(
    private readonly scheduleService: ScheduleService,
  ) { }

  @Interval("Đang kiểm tra lịch trình...",60000)
  async handleScheduleCheck() {
    this.scheduleService.handleSchuduleCheck()
  }

  @ApiOperation({ summary: "Lấy các lịch được duyệt theo các kiều kiện. Nếu không truyền thì sẽ lấy hết" })
  @ApiQuery({ name: "id", required: false, description: "Lấy theo ID của lịch trình cầu lấy" })
  @ApiQuery({ name: "userId", required: false, description: "Lấy theo userId" })
  @ApiQuery({ name: "deviceId", required: false, description: "Lấy theo deviceId" })
  @ApiQuery({ name: "startDate", required: false, description: 'Lọc theo ngày bắt đầu (định dạng: YYYY-MM-DD HH:mm)' })
  @ApiQuery({ name: "endDate", required: false, description: 'Lọc theo ngày kết thúc (định dạng: YYYY-MM-DD HH:mm)' })
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

  // Example: 
  @ApiOperation({ summary: "Tạo lịch mới" })
  @ApiBody({
    schema: {
      examples: {
        userId: "userid123",
        deviceId: "deviceid123",
        action: "On",
        actionTime: "124",
        conditon: "> 30",
        repeat: "daily",
        time: "06:00"
      }
    }
  })
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

  @ApiOperation({ summary: "Tạo lịch mới" })
  @ApiQuery({ name: 'id', required: true, description: 'ID của schedule cần cập nhật' })
  @ApiBody({
    schema: {
      examples: {
        deviceId: "deviceid123",
        action: "On",
        actionTime: "124",
        conditon: "> 30",
        repeat: "daily",
        time: "06:00"
      }
    }
  })
  @Put()
  async updateSchedule(
    @Query('id') id: string,
    @Body() data: Schedule
  ): Promise<String> {
    return this.scheduleService.updateSchedule(id, data);
  }

  @ApiOperation({ summary: "Xóa schudule" })
  @ApiQuery({ name: 'id', required: true, description: 'ID của schudule cần xóa' })
  @Delete()
  async deleteSchedule(
    @Query('id') id: string
  ): Promise<String> {
    return this.scheduleService.deleteSchedule(id);
  }
}
