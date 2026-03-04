import { NextResponse } from 'next/server';
import { generateShippingData } from '@/app/lib/mockData';
import { ApiResponse } from '@/app/types';

export async function GET() {
  try {
    const zones = generateShippingData();
    
    const response: ApiResponse<typeof zones> = {
      success: true,
      data: zones,
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      timestamp: new Date().toISOString(),
      error: 'Failed to fetch shipping data'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
