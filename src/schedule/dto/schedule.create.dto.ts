import { IsNotEmpty, IsString, IsOptional, IsUUID, IsNumber, IsDate } from 'class-validator';

export class CreateScheduleDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  deviceId: string;

  @IsNotEmpty()
  @IsString()
  action: string;

  @IsOptional()
  @IsNumber()
  actionTime?: number;

  @IsNotEmpty()
  @IsString()
  conditon: string;

  @IsOptional()
  @IsString()
  repeat?: string;

  @IsNotEmpty()
  @IsString()
  time: string;

  @IsOptional()
  @IsDate()
  lastActive: Date 
}
