import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { PlantService } from './plant.servive';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('plant')
@Controller('plant')
export class PlantController {
  constructor(private readonly plantService: PlantService) {}

  @ApiOperation({ summary: 'Check soil moisture status' })
  @ApiQuery({ name: 'soilMoisture', required: true, description: 'Soil moisture percentage (0-100)', example: 45 })
  @Get('check-soil-moisture')
  checkSoilMoisture(@Query('soilMoisture') soilMoisture: string): string {
    const moistureValue = parseFloat(soilMoisture);
    if (isNaN(moistureValue) || moistureValue < 0 || moistureValue > 100) {
      throw new BadRequestException('Invalid soil moisture value. It must be a number between 0 and 100.');
    }
    return this.plantService.checkSoilMoisture(moistureValue);
  }

  @ApiOperation({ summary: 'Check air humidity status' })
  @ApiQuery({ name: 'airHumidity', required: true, description: 'Air humidity percentage (0-100)', example: 60 })
  @Get('check-air-humidity')
  checkAirHumidity(@Query('airHumidity') airHumidity: string): string {
    const humidityValue = parseFloat(airHumidity);
    if (isNaN(humidityValue) || humidityValue < 0 || humidityValue > 100) {
      throw new BadRequestException('Invalid air humidity value. It must be a number between 0 and 100.');
    }
    return this.plantService.checkAirHumidity(humidityValue);
  }
}
