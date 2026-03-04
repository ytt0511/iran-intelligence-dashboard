import { NextResponse } from 'next/server';
import { generatePolymarketData } from '@/app/lib/mockData';
import { ApiResponse } from '@/app/types';

export async function GET() {
  try {
    const data = generatePolymarketData();
    
    const response: ApiResponse<typeof data> = {
      success: true,
      data,
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      timestamp: new Date().toISOString(),
      error: 'Failed to fetch Polymarket data'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
