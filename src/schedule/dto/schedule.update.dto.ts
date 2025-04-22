import { IsOptional, IsString, IsUUID, IsNumber, IsIn } from 'class-validator';

export class UpdateScheduleDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  @IsString()
  deviceId?: string;

  @IsOptional()
  @IsString()
  action?: string;

  @IsOptional()
  @IsNumber()
  actionTime?: number;

  @IsOptional()
  @IsString()
  conditon?: string;

  @IsOptional()
  @IsIn(['x days', 'monthly', 'weekly','daily'], { message: 'Repeat must be one of the following: x days, monthly, weekly, daily' })
  repeat?: string;

  @IsOptional()
  @IsString()
  time?: string;
}
