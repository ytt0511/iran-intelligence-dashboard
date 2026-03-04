import { NextResponse } from 'next/server';
import { ApiResponse, AssetPrice } from '@/app/types';

// Cache configuration
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for market data
let cachedData: AssetPrice[] | null = null;
let lastFetchTime = 0;

// Asset configurations
const ASSETS = [
  { symbol: 'CL=F', name: 'WTI原油', displaySymbol: 'WTI', currency: 'USD' },
  { symbol: 'BZ=F', name: '布伦特原油', displaySymbol: 'BRENT', currency: 'USD' },
  { symbol: 'GC=F', name: '黄金现货', displaySymbol: 'GOLD', currency: 'USD' },
  { symbol: 'DX-Y.NYB', name: '美元指数', displaySymbol: 'DXY', currency: 'USD' },
  { symbol: '^GSPC', name: '标普500', displaySymbol: 'SPX', currency: 'USD' },
  { symbol: 'SI=F', name: '白银期货', displaySymbol: 'SILVER', currency: 'USD' },
];

// Generate mini chart data based on current price and change
function generateMiniChart(currentPrice: number, changePercent: number, points: number = 20): { time: string; value: number }[] {
  const data = [];
  const now = new Date();
  const volatility = Math.abs(changePercent) / 100 + 0.005;
  let price = currentPrice / (1 + changePercent / 100); // Start from previous price
  
  for (let i = points; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 15 * 60 * 1000);
    // Add random walk towards current price
    const progress = (points - i) / points;
    const targetPrice = currentPrice;
    const randomWalk = (Math.random() - 0.5) * volatility * price;
    price = price * (1 - progress) + targetPrice * progress + randomWalk * (1 - progress);
    
    data.push({
      time: time.toISOString(),
      value: Number(price.toFixed(2))
    });
  }
  
  // Ensure last point matches current price
  data[data.length - 1].value = currentPrice;
  return data;
}

// Check if we're in build/static generation mode
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build' || 
                    (process.env.NODE_ENV === 'production' && typeof window === 'undefined');

// Fetch data from Yahoo Finance
async function fetchYahooFinanceData(symbol: string): Promise<any> {
  // During build time, immediately throw to use fallback
  if (isBuildTime) {
    throw new Error('Skipping API call during build');
  }
  
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 120 }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to fetch ${symbol}:`, error);
    throw error;
  }
}

// Parse Yahoo Finance response
function parseYahooData(data: any, assetConfig: any): AssetPrice | null {
  try {
    const result = data.chart?.result?.[0];
    if (!result) {
      console.warn(`No data available for ${assetConfig.symbol}`);
      return null;
    }

    const meta = result.meta;
    const timestamps = result.timestamp || [];
    const prices = result.indicators?.quote?.[0]?.close || [];
    
    if (prices.length === 0) {
      console.warn(`No price data for ${assetConfig.symbol}`);
      return null;
    }

    const currentPrice = meta.regularMarketPrice || prices[prices.length - 1];
    const previousClose = meta.previousClose || meta.chartPreviousClose || prices[0];
    
    const change = currentPrice - previousClose;
    const changePercent = (change / previousClose) * 100;

    // Generate mini chart from historical data
    const miniChart = prices.slice(-21).map((price: number, index: number) => {
      const time = new Date((timestamps[timestamps.length - 21 + index] || Date.now() / 1000) * 1000);
      return {
        time: time.toISOString(),
        value: Number(price.toFixed(2))
      };
    });

    return {
      symbol: assetConfig.displaySymbol,
      name: assetConfig.name,
      price: Number(currentPrice.toFixed(2)),
      change: Number(change.toFixed(2)),
      changePercent: Number(changePercent.toFixed(2)),
      currency: assetConfig.currency,
      lastUpdate: new Date().toISOString(),
      miniChart: miniChart.length > 0 ? miniChart : generateMiniChart(currentPrice, changePercent)
    };
  } catch (error) {
    console.error(`Error parsing data for ${assetConfig.symbol}:`, error);
    return null;
  }
}

// Fetch all market data
async function fetchAllMarketData(): Promise<AssetPrice[]> {
  const results: AssetPrice[] = [];
  
  // Fetch data for each asset with delay to avoid rate limiting
  for (const asset of ASSETS) {
    try {
      const data = await fetchYahooFinanceData(asset.symbol);
      const parsed = parseYahooData(data, asset);
      if (parsed) {
        results.push(parsed);
      }
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Failed to fetch ${asset.symbol}:`, error);
    }
  }

  return results;
}

// Fallback data in case API fails
function getFallbackData(): AssetPrice[] {
  return [
    {
      symbol: 'WTI',
      name: 'WTI原油',
      price: 78.45,
      change: 2.34,
      changePercent: 3.07,
      currency: 'USD',
      lastUpdate: new Date().toISOString(),
      miniChart: generateMiniChart(78.45, 3.07)
    },
    {
      symbol: 'BRENT',
      name: '布伦特原油',
      price: 82.67,
      change: 2.89,
      changePercent: 3.62,
      currency: 'USD',
      lastUpdate: new Date().toISOString(),
      miniChart: generateMiniChart(82.67, 3.62)
    },
    {
      symbol: 'GOLD',
      name: '黄金现货',
      price: 2145.30,
      change: 18.50,
      changePercent: 0.87,
      currency: 'USD',
      lastUpdate: new Date().toISOString(),
      miniChart: generateMiniChart(2145.30, 0.87)
    },
    {
      symbol: 'DXY',
      name: '美元指数',
      price: 103.85,
      change: -0.42,
      changePercent: -0.40,
      currency: 'USD',
      lastUpdate: new Date().toISOString(),
      miniChart: generateMiniChart(103.85, -0.40)
    },
    {
      symbol: 'SPX',
      name: '标普500',
      price: 5123.45,
      change: 15.20,
      changePercent: 0.30,
      currency: 'USD',
      lastUpdate: new Date().toISOString(),
      miniChart: generateMiniChart(5123.45, 0.30)
    },
    {
      symbol: 'SILVER',
      name: '白银期货',
      price: 24.32,
      change: 0.45,
      changePercent: 1.88,
      currency: 'USD',
      lastUpdate: new Date().toISOString(),
      miniChart: generateMiniChart(24.32, 1.88)
    }
  ];
}

export async function GET() {
  try {
    const now = Date.now();
    
    // Check cache
    if (cachedData && (now - lastFetchTime) < CACHE_DURATION) {
      const response: ApiResponse<AssetPrice[]> = {
        success: true,
        data: cachedData,
        timestamp: new Date().toISOString(),
        cached: true
      };
      return NextResponse.json(response);
    }

    // Fetch fresh data
    const data = await fetchAllMarketData();
    
    // If we got no data, use fallback
    const finalData = data.length > 0 ? data : getFallbackData();
    
    // Update cache
    cachedData = finalData;
    lastFetchTime = now;

    const response: ApiResponse<AssetPrice[]> = {
      success: true,
      data: finalData,
      timestamp: new Date().toISOString(),
      cached: false,
      source: data.length > 0 ? 'yahoo-finance' : 'fallback'
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Market data API error:', error);
    
    // Return cached data if available
    if (cachedData) {
      const response: ApiResponse<AssetPrice[]> = {
        success: true,
        data: cachedData,
        timestamp: new Date().toISOString(),
        cached: true,
        warning: 'Using cached data due to API error'
      };
      return NextResponse.json(response);
    }

    // Return fallback data
    const fallbackData = getFallbackData();
    const response: ApiResponse<AssetPrice[]> = {
      success: true,
      data: fallbackData,
      timestamp: new Date().toISOString(),
      warning: 'Using fallback data'
    };
    
    return NextResponse.json(response);
  }
}
