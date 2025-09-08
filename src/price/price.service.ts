import { Injectable, OnModuleInit } from '@nestjs/common';
import axios from 'axios';

export interface PriceData {
  symbol: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
  timestamp: number;
  bidPriceWithFee: string;
  askPriceWithFee: string;
  midPrice: string;
}

@Injectable()
export class PriceService implements OnModuleInit {
  private currentPrice: PriceData | null = null;
  private updateInterval: number;
  private serviceFee: number;

  constructor() {
    this.updateInterval = parseInt(process.env.UPDATE_INTERVAL_MS || '10000');
    this.serviceFee = parseFloat(process.env.SERVICE_FEE_PERCENT || '0.01');
  }

  onModuleInit() {
    this.startPriceUpdates();
  }

  private async fetchPriceFromBinance(): Promise<any> {
    try {
      const response = await axios.get('https://api.binance.com/api/v3/ticker/bookTicker', {
        params: { symbol: 'BTCUSDT' }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching price from Binance:', error.message);
      return null;
    }
  }

  private applyFee(price: string, isBid: boolean): string {
    const numericPrice = parseFloat(price);
    const feeMultiplier = this.serviceFee / 100;
    
    if (isBid) {
      return (numericPrice * (1 + feeMultiplier)).toFixed(2);
    } else {
      return (numericPrice * (1 - feeMultiplier)).toFixed(2);
    }
  }

  private calculateMidPrice(bid: string, ask: string): string {
    return ((parseFloat(bid) + parseFloat(ask)) / 2).toFixed(2);
  }

  private async updatePrice(): Promise<void> {
    const binanceData = await this.fetchPriceFromBinance();
    
    if (binanceData) {
      this.currentPrice = {
        symbol: binanceData.symbol,
        bidPrice: binanceData.bidPrice,
        bidQty: binanceData.bidQty,
        askPrice: binanceData.askPrice,
        askQty: binanceData.askQty,
        timestamp: Date.now(),
        bidPriceWithFee: this.applyFee(binanceData.bidPrice, true),
        askPriceWithFee: this.applyFee(binanceData.askPrice, false),
        midPrice: this.calculateMidPrice(
          this.applyFee(binanceData.bidPrice, true),
          this.applyFee(binanceData.askPrice, false)
        )
      };
    }
  }

  private startPriceUpdates(): void {
    this.updatePrice();

    setInterval(() => {
      this.updatePrice();
    }, this.updateInterval);
  }

  getCurrentPrice(): PriceData | null {
    return this.currentPrice;
  }

  getServiceConfig(): { updateInterval: number; serviceFee: number } {
    return {
      updateInterval: this.updateInterval,
      serviceFee: this.serviceFee
    };
  }
}