import { NextResponse } from 'next/server';
import { generateNewsData, generateHourlySummary } from '@/app/lib/mockData';
import { ApiResponse } from '@/app/types';

export async function GET() {
  try {
    const items = generateNewsData();
    const summary = generateHourlySummary();
    
    const response: ApiResponse<{ items: typeof items; summary: typeof summary }> = {
      success: true,
      data: { items, summary },
      timestamp: new Date().toISOString()
    };
    
    return NextResponse.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      timestamp: new Date().toISOString(),
      error: 'Failed to fetch news data'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}
