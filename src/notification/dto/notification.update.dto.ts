import { IsOptional, IsBoolean, IsPositive, IsString, MaxLength } from 'class-validator';

export class UpdateNotificationConfigDto {
  @IsOptional()
  @IsPositive()
  frequencyMinutes?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string; // Optional title of the notification

  @IsOptional()
  @IsString()
  description?: string; // Optional description of the notification
}
