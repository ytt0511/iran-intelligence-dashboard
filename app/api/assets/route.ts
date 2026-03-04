import { NextResponse } from 'next/server';
import { generateAssetData } from '@/app/lib/mockData';
import { ApiResponse } from '@/app/types';

export async function GET() {
  try {
    const data = generateAssetData();
    
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
      error: 'Failed to fetch asset data'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
