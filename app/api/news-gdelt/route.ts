import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { ApiResponse, NewsItem, NewsHourlySummary } from '@/app/types';
import { isBuildTime, buildTimeSkipResponse } from '@/app/lib/build-utils';

// GDELT API Configuration
const GDELT_DOC_API = "https://api.gdeltproject.org/api/v2/doc/doc";
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
let cachedData: { items: NewsItem[]; summary: NewsHourlySummary } | null = null;
let lastFetchTime = 0;

// Iran-related keywords for GDELT query
const IRAN_QUERY = '(Iran OR Tehran OR "Islamic Republic") AND (US OR "United States" OR America OR Israel OR conflict OR nuclear OR sanctions OR military OR talks)';

interface GDELTArticle {
  url: string;
  title: string;
  seendate: string;
  domain: string;
  source: string;
  language: string;
}

// Fetch data from GDELT API
async function fetchGDELTData(): Promise<GDELTArticle[]> {
  // Skip during build time
  if (isBuildTime()) {
    throw new Error('Skipping GDELT API call during build');
  }

  try {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000); // Last 7 days
    
    const params = new URLSearchParams({
      query: IRAN_QUERY,
      mode: 'ArtList',
      format: 'json',
      startdatetime: formatGDELTDate(startDate),
      enddatetime: formatGDELTDate(endDate),
      sort: 'HybridRel',
      maxrecords: '100'
    });

    const response = await fetch(`${GDELT_DOC_API}?${params}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error(`GDELT API error: ${response.status}`);
    }

    const data = await response.json();
    return data.articles || [];
  } catch (error) {
    console.error('GDELT fetch error:', error);
    return [];
  }
}

// Format date for GDELT API
function formatGDELTDate(date: Date): string {
  return date.toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
}

// Determine category based on content
function determineCategory(title: string): NewsItem['category'] {
  const lower = title.toLowerCase();
  if (lower.includes('nuclear') || lower.includes('uranium') || lower.includes('enrichment')) return 'military';
  if (lower.includes('sanction') || lower.includes('oil') || lower.includes('trade')) return 'sanction';
  if (lower.includes('talk') || lower.includes('negotiation') || lower.includes('diplomat')) return 'diplomacy';
  if (lower.includes('military') || lower.includes('attack') || lower.includes('strike') || lower.includes('war')) return 'military';
  if (lower.includes('protest') || lower.includes('election') || lower.includes('domestic')) return 'domestic';
  return 'diplomacy';
}

// Determine importance
function determineImportance(title: string): NewsItem['importance'] {
  const lower = title.toLowerCase();
  const criticalKeywords = ['war', 'attack', 'strike', 'killed', 'destroyed', 'breakthrough', 'deal'];
  const highKeywords = ['sanction', 'military', 'nuclear', 'crisis', 'tension'];
  
  if (criticalKeywords.some(k => lower.includes(k))) return 'critical';
  if (highKeywords.some(k => lower.includes(k))) return 'high';
  return 'medium';
}

// Convert GDELT article to NewsItem
function convertToNewsItem(article: GDELTArticle, index: number): NewsItem {
  return {
    id: `gdelt-${index}-${Date.now()}`,
    title: article.title,
    summary: article.title,
    source: article.source || article.domain || 'GDELT',
    url: article.url,
    timestamp: parseGDELTDate(article.seendate),
    category: determineCategory(article.title),
    importance: determineImportance(article.title),
    tags: extractTags(article.title)
  };
}

// Parse GDELT date format
function parseGDELTDate(dateStr: string): string {
  if (!dateStr || dateStr.length < 14) return new Date().toISOString();
  
  const year = dateStr.slice(0, 4);
  const month = dateStr.slice(4, 6);
  const day = dateStr.slice(6, 8);
  const hour = dateStr.slice(8, 10);
  const minute = dateStr.slice(10, 12);
  
  return new Date(`${year}-${month}-${day}T${hour}:${minute}:00Z`).toISOString();
}

// Extract tags from title
function extractTags(title: string): string[] {
  const lower = title.toLowerCase();
  const tags: string[] = [];
  
  if (lower.includes('iran')) tags.push('iran');
  if (lower.includes('us') || lower.includes('america')) tags.push('us');
  if (lower.includes('israel')) tags.push('israel');
  if (lower.includes('nuclear')) tags.push('nuclear');
  if (lower.includes('sanction')) tags.push('sanctions');
  if (lower.includes('military')) tags.push('military');
  if (lower.includes('oil')) tags.push('oil');
  
  return tags.slice(0, 5);
}

// Generate summary from articles
function generateSummary(items: NewsItem[]): NewsHourlySummary {
  const criticalCount = items.filter(i => i.importance === 'critical').length;
  const highCount = items.filter(i => i.importance === 'high').length;
  
  let riskLevel: NewsHourlySummary['riskLevel'] = 'low';
  if (criticalCount >= 2 || (criticalCount >= 1 && highCount >= 3)) {
    riskLevel = 'critical';
  } else if (criticalCount >= 1 || highCount >= 3) {
    riskLevel = 'high';
  } else if (highCount >= 1) {
    riskLevel = 'medium';
  }
  
  const keyEvents = items
    .filter(i => i.importance === 'critical' || i.importance === 'high')
    .slice(0, 5)
    .map(i => i.title.length > 50 ? i.title.slice(0, 50) + '...' : i.title);
  
  return {
    hour: new Date().toISOString().slice(0, 13) + ':00',
    summary: `GDELT监测到${items.length}条美伊相关新闻，${criticalCount}条危急，${highCount}条高危。`,
    keyEvents: keyEvents.length > 0 ? keyEvents : ['暂无重大事件'],
    riskLevel
  };
}

// Fallback to local data
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

export async function GET() {
  // Skip during build time
  if (isBuildTime()) {
    return buildTimeSkipResponse('Skipping GDELT news fetch during build');
  }

  try {
    const now = Date.now();
    
    // Check cache
    if (cachedData && (now - lastFetchTime) < CACHE_DURATION) {
      const response: ApiResponse<{ items: NewsItem[]; summary: NewsHourlySummary }> = {
        success: true,
        data: cachedData,
        timestamp: new Date().toISOString(),
        cached: true,
        source: 'gdelt-cache'
      };
      return NextResponse.json(response);
    }

    // Try GDELT first
    const gdeltArticles = await fetchGDELTData();
    
    if (gdeltArticles.length > 0) {
      const items = gdeltArticles.map((article, index) => 
        convertToNewsItem(article, index)
      );
      
      const summary = generateSummary(items);
      const data = { items, summary };
      
      // Update cache
      cachedData = data;
      lastFetchTime = now;
      
      const response: ApiResponse<{ items: NewsItem[]; summary: NewsHourlySummary }> = {
        success: true,
        data,
        timestamp: new Date().toISOString(),
        cached: false,
        source: 'gdelt-api'
      };
      return NextResponse.json(response);
    }
    
    // Fallback to local data
    const localData = readLocalNewsData();
    if (localData) {
      const response: ApiResponse<{ items: NewsItem[]; summary: NewsHourlySummary }> = {
        success: true,
        data: localData,
        timestamp: new Date().toISOString(),
        cached: false,
        source: 'local-data'
      };
      return NextResponse.json(response);
    }

    // Empty response
    const response: ApiResponse<{ items: NewsItem[]; summary: NewsHourlySummary }> = {
      success: true,
      data: { items: [], summary: { hour: '', summary: '', keyEvents: [], riskLevel: 'low' } },
      timestamp: new Date().toISOString(),
      warning: 'No data available'
    };
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('GDELT API error:', error);
    
    // Try local data on error
    const localData = readLocalNewsData();
    if (localData) {
      const response: ApiResponse<{ items: NewsItem[]; summary: NewsHourlySummary }> = {
        success: true,
        data: localData,
        timestamp: new Date().toISOString(),
        cached: true,
        warning: 'Using local data due to GDELT error'
      };
      return NextResponse.json(response);
    }

    const response: ApiResponse<{ items: NewsItem[]; summary: NewsHourlySummary }> = {
      success: false,
      data: { items: [], summary: { hour: '', summary: '', keyEvents: [], riskLevel: 'low' } },
      timestamp: new Date().toISOString(),
      error: 'Failed to fetch news data'
    };
    return NextResponse.json(response, { status: 500 });
  }
}
