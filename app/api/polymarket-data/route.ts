import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const JSON_FILE = path.join(process.cwd(), 'data', 'polymarket_data.json');

export async function GET() {
  try {
    // 检查文件是否存在
    if (!fs.existsSync(JSON_FILE)) {
      return NextResponse.json({
        success: false,
        error: 'Data file not found. Please run: node scripts/process-polymarket-csv.js',
        data: null
      }, { status: 404 });
    }

    // 读取 JSON 文件
    const fileContent = fs.readFileSync(JSON_FILE, 'utf-8');
    const jsonData = JSON.parse(fileContent);

    // 返回数据
    return NextResponse.json({
      success: true,
      ...jsonData
    });
  } catch (error) {
    console.error('Error reading polymarket data:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    }, { status: 500 });
  }
}
