import { IsOptional, IsString, IsEnum,IsNotEmpty } from 'class-validator';
import { validStatus } from 'src/common/helper';

export class UpdateDeviceDto {
    @IsOptional()
    @IsString()
    deviceName?: string;

    @IsOptional()
    @IsEnum(["view", "trigger"], { message: `Action must be either "view" or "trigger"` })
    action?: string;

    @IsOptional()
    @IsEnum(validStatus, { message: `Status must be one of the following: ${validStatus.join(', ')}` })
    status?: string;

    @IsOptional()
    @IsString()
    qrCode?: string;

    @IsNotEmpty()
    @IsEnum(["light", "soil", "air", "pump"], { message: `Type must be one of the following: light, soil, air, pump` })
    type: string;
}
