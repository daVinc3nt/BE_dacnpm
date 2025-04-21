import { IsUUID, IsPositive, IsNotEmpty, IsString, IsOptional, MaxLength, IsBoolean } from 'class-validator';

export class CreateNotificationConfigDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsUUID()
  @IsNotEmpty()
  deviceId: string;

  @IsPositive()
  @IsNotEmpty()
  frequencyMinutes: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string; // Title of the notification

  @IsString()
  @IsOptional()
  description?: string; // Optional description of the notification
}
