import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { ApiResponse, PolymarketEvent } from '@/app/types';

export async function GET() {
  try {
    // 读取本地 Polymarket 数据文件
    const dataPath = path.join(process.cwd(), 'data', 'polymarket.json');
    
    if (fs.existsSync(dataPath)) {
      const fileContent = fs.readFileSync(dataPath, 'utf-8');
      const rawData = JSON.parse(fileContent);
      
      // 支持两种数据格式
      let markets: PolymarketEvent[];
      
      if (Array.isArray(rawData)) {
        // 新格式: 直接是数组
        markets = rawData.map((market: any) => ({
          id: market.id,
          title: market.title,
          probability: market.probability,
          change1h: market.change1h || 0,
          change24h: market.change24h || 0,
          volume: market.volume,
          category: market.category,
          trend: market.trend,
          history: market.history || []
        }));
      } else if (rawData.markets) {
        // 旧格式: { markets: [...], metadata: {...} }
        markets = rawData.markets.map((market: any) => ({
          id: market.id,
          title: market.title,
          probability: market.probability,
          change1h: market.change1h || 0,
          change24h: market.change24h || 0,
          volume: market.volume,
          category: market.category,
          trend: market.trend,
          history: market.history || []
        }));
      } else {
        throw new Error('Unknown data format');
      }
      
      const response: ApiResponse<PolymarketEvent[]> = {
        success: true,
        data: markets,
        timestamp: new Date().toISOString(),
        cached: false
      };
      
      return NextResponse.json(response);
    } else {
      throw new Error('Polymarket data file not found');
    }
  } catch (error) {
    console.error('Failed to read Polymarket data:', error);
    
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      timestamp: new Date().toISOString(),
      error: 'Failed to fetch Polymarket data'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
