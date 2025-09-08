import { Controller, Get } from '@nestjs/common';
import { PriceService, PriceData } from './price.service';

@Controller('price')
export class PriceController {
  constructor(private readonly priceService: PriceService) {}

  @Get()
  getPrice(): PriceData | { error: string } {
    const price = this.priceService.getCurrentPrice();
    
    if (!price) {
      return { error: 'Price data not available yet' };
    }

    return price;
  }

  @Get('config')
  getConfig() {
    return this.priceService.getServiceConfig();
  }
}