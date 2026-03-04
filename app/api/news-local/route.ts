import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { NewsItem, NewsHourlySummary } from '@/app/types';

export async function GET() {
  try {
    // 读取本地新闻数据文件
    const dataPath = path.join(process.cwd(), 'data', 'news.json');
    
    if (fs.existsSync(dataPath)) {
      const fileContent = fs.readFileSync(dataPath, 'utf-8');
      const rawData = JSON.parse(fileContent);
      
      // 适配新的数据格式
      const items: NewsItem[] = rawData.news || rawData.items || [];
      const summary: NewsHourlySummary = {
        hour: rawData.summary?.hour || new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
        riskLevel: rawData.metadata?.risk_level || rawData.summary?.riskLevel || 'medium',
        summary: rawData.summary?.overview || rawData.summary?.summary || '暂无摘要',
        keyEvents: rawData.summary?.key_themes || rawData.summary?.keyEvents || []
      };
      
      return NextResponse.json({
        success: true,
        data: { items, summary },
        timestamp: rawData.metadata?.generated_at || rawData.lastUpdate || new Date().toISOString(),
        source: 'local-json'
      });
    } else {
      // 如果文件不存在，返回模拟数据
      const mockData = generateMockData();
      return NextResponse.json({
        success: true,
        data: { items: mockData.items, summary: mockData.summary },
        timestamp: new Date().toISOString(),
        source: 'mock-data'
      });
    }
  } catch (error) {
    console.error('Failed to read news data:', error);
    
    // 出错时返回模拟数据
    const mockData = generateMockData();
    
    return NextResponse.json({
      success: true,
      data: { items: mockData.items, summary: mockData.summary },
      timestamp: new Date().toISOString(),
      source: 'fallback-mock',
      warning: 'Using fallback data'
    });
  }
}

function generateMockData() {
  const now = new Date();
  
  const items: NewsItem[] = [
    {
      id: `news-${now.getTime()}-001`,
      title: "Iran warns of 'decisive response' after Israeli strike on Damascus consulate",
      source: "Reuters",
      url: "https://www.reuters.com/world/middle-east/",
      timestamp: new Date(now.getTime() - 15 * 60000).toISOString(),
      summary: "Iran's Revolutionary Guards said seven military advisors were killed in the strike, including a senior commander. Tehran vowed to retaliate.",
      category: "military",
      importance: "critical",
      tags: ["iran", "israel", "damascus", "strike", "retaliation"]
    },
    {
      id: `news-${now.getTime()}-002`,
      title: "US deploys additional aircraft carrier to Middle East amid rising tensions",
      source: "Al Jazeera",
      url: "https://www.aljazeera.com/middle-east/",
      timestamp: new Date(now.getTime() - 32 * 60000).toISOString(),
      summary: "The Pentagon announced deployment of USS Theodore Roosevelt to join USS Abraham Lincoln in the region as deterrence against Iran.",
      category: "military",
      importance: "high",
      tags: ["us", "carrier", "middle-east", "iran", "deterrence"]
    },
    {
      id: `news-${now.getTime()}-003`,
      title: "Oil prices surge 3% on Middle East conflict fears",
      source: "BBC",
      url: "https://www.bbc.com/news/world/middle_east",
      timestamp: new Date(now.getTime() - 45 * 60000).toISOString(),
      summary: "Brent crude jumped above $85 per barrel as markets priced in risk of supply disruptions through Strait of Hormuz.",
      category: "energy",
      importance: "high",
      tags: ["oil", "brent", "middle-east", "hormuz", "economy"]
    }
  ];
  
  const summary: NewsHourlySummary = {
    hour: now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }),
    riskLevel: 'critical',
    summary: `${now.getHours()}:00时段：伊朗局势持续紧张，以伊冲突升级风险加剧。`,
    keyEvents: [
      "伊朗警告报复以色列大马士革袭击",
      "美国增派航母至中东",
      "油价上涨3%"
    ]
  };
  
  return { items, summary, lastUpdate: now.toISOString() };
}
