import { IsUUID, IsPositive, IsNotEmpty } from 'class-validator';

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
}
