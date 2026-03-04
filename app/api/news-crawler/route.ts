import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { ApiResponse, NewsItem, NewsHourlySummary } from '@/app/types';

// Cache configuration
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes
let cachedData: { items: NewsItem[]; summary: NewsHourlySummary } | null = null;
let lastFetchTime = 0;

// Read local news data file
function readLocalNewsData(): { items: NewsItem[]; summary: NewsHourlySummary } | null {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'news.json');
    
    if (fs.existsSync(dataPath)) {
      const fileContent = fs.readFileSync(dataPath, 'utf-8');
      const rawData = JSON.parse(fileContent);
      
      return {
        items: rawData.news || [],
        summary: {
          hour: rawData.metadata?.generated_at || new Date().toISOString(),
          summary: rawData.summary?.overview || '',
          keyEvents: rawData.summary?.key_themes || [],
          riskLevel: rawData.summary?.risk_assessment?.level?.toLowerCase() || 'medium'
        }
      };
    }
    
    return null;
  } catch (error) {
    console.error('Failed to read local news data:', error);
    return null;
  }
}

// Fallback mock data
function getFallbackNews(): NewsItem[] {
  const now = new Date();
  return [
    {
      id: '1',
      title: '特朗普：对伊朗军事行动可能持续4至5周',
      summary: '特朗普表示对伊朗军事行动可能持续4至5周，要彻底摧毁伊朗海军，已击沉其10艘舰艇',
      source: '财联社',
      timestamp: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
      category: 'military',
      importance: 'critical',
      tags: ['特朗普', '美国', '伊朗', '军事']
    },
    {
      id: '2',
      title: '霍尔木兹海峡已被关闭',
      summary: '伊朗伊斯兰革命卫队司令顾问宣布，霍尔木兹海峡已被关闭，将打击所有试图通过的船只',
      source: '财联社',
      timestamp: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
      category: 'energy',
      importance: 'critical',
      tags: ['伊朗', '霍尔木兹海峡', '石油', '航运']
    },
    {
      id: '3',
      title: '王毅同伊朗外长通电话',
      summary: '王毅重申中方支持伊方捍卫主权安全，已敦促美国、以色列立即停止军事行动',
      source: '财联社',
      timestamp: new Date(now.getTime() - 90 * 60 * 1000).toISOString(),
      category: 'diplomacy',
      importance: 'high',
      tags: ['中国', '伊朗', '外交']
    }
  ];
}

export async function GET() {
  try {
    const now = Date.now();
    
    // Read local data file first
    const localData = readLocalNewsData();
    
    if (localData && localData.items.length > 0) {
      // Update cache with local data
      cachedData = localData;
      lastFetchTime = now;
      
      const response: ApiResponse<{ items: NewsItem[]; summary: NewsHourlySummary }> = {
        success: true,
        data: localData,
        timestamp: new Date().toISOString(),
        cached: false,
        source: 'local-data-file'
      };
      return NextResponse.json(response);
    }
    
    // Check cache if no local data
    if (cachedData && (now - lastFetchTime) < CACHE_DURATION) {
      const response: ApiResponse<{ items: NewsItem[]; summary: NewsHourlySummary }> = {
        success: true,
        data: cachedData,
        timestamp: new Date().toISOString(),
        cached: true
      };
      return NextResponse.json(response);
    }

    // Return fallback data
    const fallbackItems = getFallbackNews();
    const fallbackSummary: NewsHourlySummary = {
      hour: new Date().toISOString().slice(0, 13) + ':00',
      summary: '美伊冲突进入全面升级阶段，霍尔木兹海峡关闭，特朗普宣布长期军事行动',
      keyEvents: ['霍尔木兹海峡正式关闭', '特朗普宣布4-5周军事行动', '6名美军确认死亡'],
      riskLevel: 'critical'
    };
    
    const response: ApiResponse<{ items: NewsItem[]; summary: NewsHourlySummary }> = {
      success: true,
      data: { items: fallbackItems, summary: fallbackSummary },
      timestamp: new Date().toISOString(),
      warning: 'Using fallback data - local data file not found'
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('News API error:', error);
    
    // Return fallback data on error
    const fallbackItems = getFallbackNews();
    const fallbackSummary: NewsHourlySummary = {
      hour: new Date().toISOString().slice(0, 13) + ':00',
      summary: '美伊冲突进入全面升级阶段',
      keyEvents: ['数据加载失败，显示备用数据'],
      riskLevel: 'high'
    };
    
    const response: ApiResponse<{ items: NewsItem[]; summary: NewsHourlySummary }> = {
      success: true,
      data: { items: fallbackItems, summary: fallbackSummary },
      timestamp: new Date().toISOString(),
      warning: 'Using fallback data due to error'
    };
    
    return NextResponse.json(response);
  }
}
