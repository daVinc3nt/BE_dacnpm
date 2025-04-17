import { IsOptional, IsBoolean, IsPositive } from 'class-validator';

export class UpdateNotificationConfigDto {
  @IsOptional()
  @IsPositive()
  frequencyMinutes?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
