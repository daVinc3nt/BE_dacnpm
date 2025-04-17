import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { validStatus } from 'src/common/helper';

export class CreateDeviceDto {
    @IsNotEmpty()
    @IsString()
    deviceName: string;

    @IsNotEmpty()
    @IsEnum(["view", "trigger"], { message: `Action must be either "view" or "trigger"` })
    action: string;

    @IsOptional()
    @IsString()
    qrCode?: string;

    @IsNotEmpty()
    @IsEnum(validStatus, { message: `Status must be one of the following: ${validStatus.join(', ')}` })
    status: string;

    @IsNotEmpty()
    @IsString()
    userId: string;

    @IsNotEmpty()
    @IsEnum(["light", "soil", "air", "pump"], { message: `Type must be one of the following: light, soil, air, pump` })
    type: string;
}
