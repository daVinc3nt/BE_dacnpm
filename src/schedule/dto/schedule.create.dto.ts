import { IsNotEmpty, IsString, IsOptional, IsUUID, IsNumber } from 'class-validator';

export class CreateScheduleDto {
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @IsNotEmpty()
  @IsUUID()
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
}
