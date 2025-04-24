import { Injectable } from '@nestjs/common';

@Injectable()
export class PlantService {

  checkSoilMoisture(soilMoisture: number): string {
    console.log(soilMoisture)
    const soilMoistureThresholdLow = 30;  // Minimum soil moisture for healthy growth (%)
    const soilMoistureThresholdHigh = 70; // Maximum soil moisture before waterlogging (%)

    if (soilMoisture < soilMoistureThresholdLow) {
      return 'Soil moisture is too low. Immediate watering is required.';
    }

    if (soilMoisture > soilMoistureThresholdHigh) {
      return 'Soil moisture is too high. Avoid watering and improve soil drainage.';
    }
    return '1'
    // return 'Soil moisture is within the ideal range. No action is needed.';
  }

  checkAirHumidity(airHumidity: number): string {
    const airHumidityThresholdLow = 40;   // Minimum air humidity for plant health (%)
    const airHumidityThresholdHigh = 80; // Maximum air humidity before risk of mold (%)

    if (airHumidity < airHumidityThresholdLow) {
      return 'Air humidity is too low. Consider increasing humidity levels.';
    }

    if (airHumidity > airHumidityThresholdHigh) {
      return 'Air humidity is too high. Monitor for potential mold growth.';
    }
    return '1'
    // return 'Air humidity is within the ideal range. No action is needed.';
  }
}
