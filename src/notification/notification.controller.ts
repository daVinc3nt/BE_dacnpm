import { Controller, Post, Get, Put, Delete, Param, Body } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { CreateNotificationConfigDto } from './dto/notification.create.dto';
import { UpdateNotificationConfigDto } from './dto/notification.update.dto';
import { ApiTags, ApiOperation, ApiParam, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('notifications')
@Controller('notifications/config')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // -------------------- CREATE OR UPDATE NOTIFICATION CONFIG --------------------
  @ApiOperation({ summary: 'Create  a notification configuration' })
  @ApiBody({
    description: 'Notification configuration data',
    schema: {
      example: {
        userId: '40C9423E-F36B-1410-81F1-005102F3C87D',
        deviceId: '44C9423E-F36B-1410-81F1-005102F3C87D',
        frequencyMinutes: 30,
        title: 'Notification Title',
        description: 'Notification Description',
      },
    },
  })
  @ApiResponse({ status: 201, description: 'Notification configuration created successfully' })
  @Post()
  createOrUpdate(@Body() createDto: CreateNotificationConfigDto) {
    return this.notificationService.createOrUpdate(createDto);
  }

  // -------------------- GET NOTIFICATION CONFIG --------------------
  @ApiOperation({ summary: 'Get a notification configuration by userId and deviceId' })
  @ApiParam({ name: 'userId', description: 'ID of the user', example: '40C9423E-F36B-1410-81F1-005102F3C87D' })
  @ApiParam({ name: 'deviceId', description: 'ID of the device', example: '44C9423E-F36B-1410-81F1-005102F3C87D' })
  @ApiResponse({ status: 200, description: 'Notification configuration retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Notification configuration not found' })
  @Get(':userId/:deviceId')
  findOne(@Param('userId') userId: string, @Param('deviceId') deviceId: string) {
    return this.notificationService.findOne(userId, deviceId);
  }

  // -------------------- UPDATE NOTIFICATION CONFIG --------------------
  @ApiOperation({ summary: 'Update a notification configuration' })
  @ApiParam({ name: 'userId', description: 'ID of the user', example: '40C9423E-F36B-1410-81F1-005102F3C87D' })
  @ApiParam({ name: 'deviceId', description: 'ID of the device', example: '44C9423E-F36B-1410-81F1-005102F3C87D' })
  @ApiBody({
    description: 'Updated notification configuration data',
    schema: {
      example: {
        frequencyMinutes: 45,
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Notification configuration updated successfully' })
  @ApiResponse({ status: 404, description: 'Notification configuration not found' })
  @Put(':userId/:deviceId')
  update(
    @Param('deviceId') deviceId: string,
    @Body() updateDto: UpdateNotificationConfigDto,
  ) {
    return this.notificationService.update(deviceId, updateDto);
  }

  // -------------------- DELETE NOTIFICATION CONFIG --------------------
  @ApiOperation({ summary: 'Delete a notification configuration' })
  @ApiParam({ name: 'userId', description: 'ID of the user', example: '40C9423E-F36B-1410-81F1-005102F3C87D' })
  @ApiParam({ name: 'deviceId', description: 'ID of the device', example: '44C9423E-F36B-1410-81F1-005102F3C87D' })
  @ApiResponse({ status: 200, description: 'Notification configuration deleted successfully' })
  @ApiResponse({ status: 404, description: 'Notification configuration not found' })
  @Delete(':userId/:deviceId')
  remove(@Param('deviceId') deviceId: string) {
    return this.notificationService.remove(deviceId);
  }
}
