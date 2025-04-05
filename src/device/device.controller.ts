import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { DeviceService } from './device.service';
import { Device } from './device.entity';
import { isValidUUID, validAction, validStatus } from 'src/common/helper';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/auth/guard/jwt-auth.guard';

@ApiTags("device")
@UseGuards(JwtAuthGuard)
@Controller('device')
export class DeviceController {
  constructor(
    private readonly deviceService: DeviceService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) { }

  @ApiOperation({ summary: 'Lấy danh sách thiết bị với nhiều điều kiện lọc. Nếu không có điều kiện thì lấy tất cả' })
  @ApiQuery({ name: 'id', required: false, description: 'Lọc theo ID thiết bị' })
  @ApiQuery({ name: 'userId', required: false, description: 'Lọc theo userId' })
  @ApiQuery({ name: 'action', required: false, description: 'Lọc theo loại thiết bị' })
  @ApiQuery({ name: 'status', required: false, enum: validAction, description: 'Lọc theo trạng thái' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: 'Lọc theo ngày bắt đầu (định dạng: YYYY-MM-DD HH:mm)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: 'Lọc theo ngày kết thúc (định dạng: YYYY-MM-DD HH:mm)' })
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

  @ApiOperation({ summary: "Thêm thiết bị vào hệ thống" })
  @ApiBody({
    schema: {
      example: {
        userId: 'userid123',
        deviceName: 'Motor 001',
        action: 'Motor',
        qrCode: '123456789',
        status: 'active'
      }
    }
  })
  @Post()
  async addDevice(@Body("userId") userId: string, @Body() data: Device): Promise<Device> {
    if (!userId)
      throw new BadRequestException("User id require")
    if (!isValidUUID(userId))
      throw new BadRequestException("User id not in format UUID")
    return this.deviceService.addDevice(userId, data);
  }

  @ApiOperation({ summary: "Cập nhập thiết bị" })
  @ApiQuery({ name: 'id', required: true, description: 'ID của thiết bị cần cập nhật' })
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
  @Put()
  async updateDevice(@Query('id') id: string, @Body() data: Device): Promise<String> {
    return this.deviceService.updateDevice(id, data);
  }

  @ApiOperation({ summary: "Xóa thiết bị" })
  @ApiQuery({ name: 'id', required: true, description: 'ID của thiết bị cần xóa' })
  @Delete()
  async deleteDevice(@Query('id') id: string): Promise<String> {
    return this.deviceService.deleteDevice(id);
  }
}
