import { BadRequestException, Body, Controller, Delete, Get, Logger, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { CreateScheduleDto } from './dto/schedule.create.dto';
import { UpdateScheduleDto } from './dto/schedule.update.dto';
import { isValidUUID } from 'src/common/helper';
import { Interval } from '@nestjs/schedule';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@ApiTags("Schedule") // Swagger tag for grouping APIs
@UseGuards(JwtAuthGuard) // Protect routes with JWT authentication
@Controller('schedule')
export class ScheduleController {
  private readonly logger = new Logger(ScheduleController.name);

  constructor(
    private readonly scheduleService: ScheduleService,
  ) { }

  // Periodically check schedules every 60 seconds
  @Interval(60000)
  async handleScheduleCheck() {
    const nowHour = new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Asia/Ho_Chi_Minh"
    });

    console.log(`${nowHour} Đang kiểm tra lịch trình...`);
    await this.scheduleService.handleScheduleCheck()
  }

  // Get schedules based on query parameters or fetch all schedules
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
        throw new BadRequestException("Id not in UUID format");
      return this.scheduleService.findById(id);
    }

    const whereCondition: any = {};

    if (userId) {
      if (!isValidUUID(userId))
        throw new BadRequestException("UserId not in UUID format");
      whereCondition.user = { id: userId };
    }
    if (deviceId) {
      if (!isValidUUID(deviceId))
        throw new BadRequestException("DeviceId not in UUID format");
      whereCondition.device = { id: deviceId };
    }

    return this.scheduleService.getScheduleByConditions(startDate, endDate, whereCondition);
  }

  // Create a new schedule
  @ApiOperation({ summary: "Tạo lịch mới" })
  @ApiBody({ type: CreateScheduleDto })
  @Post()
  async addSchedule(
    @Body() createScheduleDto: CreateScheduleDto
  ) {
    return this.scheduleService.addSchedule(createScheduleDto);
  }

  // Update an existing schedule
  @ApiOperation({ summary: "Cập nhập lịch" })
  @ApiQuery({ name: 'id', required: true, description: 'ID của schedule cần cập nhật' })
  @ApiBody({ type: UpdateScheduleDto })
  @Put()
  async updateSchedule(
    @Query('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto
  ) {
    return this.scheduleService.updateSchedule(id, updateScheduleDto);
  }

  // Delete a schedule by ID
  @ApiOperation({ summary: "Xóa Schedule" })
  @ApiQuery({ name: 'id', required: true, description: 'ID của Schedule cần xóa' })
  @Delete("delete")
  async deleteSchedule(
    @Query('id') id: string
  ) {
    return await this.scheduleService.deleteSchedule(id);
  }

}
