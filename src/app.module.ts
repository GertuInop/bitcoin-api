import { Module } from '@nestjs/common';
import { PriceModule } from './price/price.module';

@Module({
  imports: [PriceModule],
})
export class AppModule {}
