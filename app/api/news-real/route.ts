import { NextResponse } from 'next/server';
import { ApiResponse, NewsItem, NewsHourlySummary } from '@/app/types';
import { isBuildTime, buildTimeSkipResponse } from '@/app/lib/build-utils';

// Cache configuration
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes for news
let cachedData: { items: NewsItem[]; summary: NewsHourlySummary } | null = null;
let lastFetchTime = 0;

// GDELT API endpoints
const GDELT_API = 'https://api.gdeltproject.org/api/v2/doc/doc';

// Keywords for Iran-related news
const IRAN_KEYWORDS = [
  'iran', 'tehran', 'iranian', 'persian gulf', 'strait of hormuz',
  'israel iran', 'us iran', 'iran nuclear', 'iran sanctions',
  'revolutionary guard', 'irgc', 'iran military', 'iran missile',
  'middle east tensions', 'gulf tensions', 'iran conflict',
  'iran war', 'iran attack', 'iran retaliation'
];

// News sources mapping
const SOURCE_MAPPING: Record<string, { name: string; category: NewsItem['category'] }> = {
  'reuters.com': { name: 'Reuters', category: 'us' },
  'aljazeera.com': { name: 'Al Jazeera', category: 'diplomacy' },
  'bbc.com': { name: 'BBC', category: 'diplomacy' },
  'bbc.co.uk': { name: 'BBC', category: 'diplomacy' },
  'apnews.com': { name: 'AP', category: 'us' },
  'ap.org': { name: 'AP', category: 'us' },
  'bloomberg.com': { name: 'Bloomberg', category: 'energy' },
  'ft.com': { name: 'Financial Times', category: 'energy' },
  'theguardian.com': { name: 'The Guardian', category: 'diplomacy' },
  'nytimes.com': { name: 'NY Times', category: 'us' },
  'washingtonpost.com': { name: 'WaPo', category: 'us' },
  'alarabiya.net': { name: 'Al Arabiya', category: 'israel' },
  'thetimes.co.uk': { name: 'The Times', category: 'diplomacy' },
  'economist.com': { name: 'The Economist', category: 'diplomacy' },
  'cnn.com': { name: 'CNN', category: 'us' },
  'defensenews.com': { name: 'Defense News', category: 'military' },
  'middleeasteye.net': { name: 'Middle East Eye', category: 'domestic' },
  'jpost.com': { name: 'Jerusalem Post', category: 'israel' },
  'haaretz.com': { name: 'Haaretz', category: 'israel' },
  'iranintl.com': { name: 'Iran Intl', category: 'domestic' },
  'politico.com': { name: 'Politico', category: 'us' },
  'foreignpolicy.com': { name: 'Foreign Policy', category: 'diplomacy' },
  'al-monitor.com': { name: 'Al-Monitor', category: 'diplomacy' },
  'mehrnews.com': { name: 'Mehr News', category: 'domestic' },
  'tehrantimes.com': { name: 'Tehran Times', category: 'domestic' },
  'irna.ir': { name: 'IRNA', category: 'domestic' },
  'farsnews.ir': { name: 'Fars News', category: 'domestic' },
  'tasnimnews.com': { name: 'Tasnim', category: 'domestic' },
};

// Determine category based on content
function determineCategory(title: string, source: string): NewsItem['category'] {
  const lowerTitle = title.toLowerCase();
  const sourceInfo = Object.entries(SOURCE_MAPPING).find(([domain]) => 
    source.includes(domain)
  );
  
  if (sourceInfo) {
    return sourceInfo[1].category;
  }
  
  if (lowerTitle.includes('oil') || lowerTitle.includes('gas') || lowerTitle.includes('energy') || lowerTitle.includes('petroleum')) {
    return 'energy';
  }
  if (lowerTitle.includes('sanction') || lowerTitle.includes('embargo')) {
    return 'sanction';
  }
  if (lowerTitle.includes('military') || lowerTitle.includes('attack') || lowerTitle.includes('strike') || lowerTitle.includes('missile') || lowerTitle.includes('war')) {
    return 'military';
  }
  if (lowerTitle.includes('israel') || lowerTitle.includes('gaza') || lowerTitle.includes('hamas') || lowerTitle.includes('hezbollah')) {
    return 'israel';
  }
  if (lowerTitle.includes('diplomat') || lowerTitle.includes('talk') || lowerTitle.includes('negotiation') || lowerTitle.includes('deal')) {
    return 'diplomacy';
  }
  if (lowerTitle.includes('us') || lowerTitle.includes('america') || lowerTitle.includes('biden') || lowerTitle.includes('trump')) {
    return 'us';
  }
  
  return 'diplomacy';
}

// Determine importance based on keywords
function determineImportance(title: string): NewsItem['importance'] {
  const lowerTitle = title.toLowerCase();
  const criticalKeywords = ['war', 'attack', 'strike', 'invasion', 'declaration', 'killed', 'death', 'destroyed', 'nuclear weapon'];
  const highKeywords = ['sanction', 'missile', 'drone', 'retaliation', 'escalation', 'tension', 'conflict', 'military'];
  
  if (criticalKeywords.some(k => lowerTitle.includes(k))) {
    return 'critical';
  }
  if (highKeywords.some(k => lowerTitle.includes(k))) {
    return 'high';
  }
  return 'medium';
}

// Extract tags from title
function extractTags(title: string): string[] {
  const lowerTitle = title.toLowerCase();
  const tags: string[] = [];
  
  const tagKeywords: Record<string, string[]> = {
    '核问题': ['nuclear', 'uranium', 'enrichment'],
    '军事': ['military', 'army', 'force', 'strike', 'attack'],
    '制裁': ['sanction', 'embargo', 'ban'],
    '石油': ['oil', 'petroleum', 'energy'],
    '外交': ['diplomat', 'talk', 'negotiation', 'deal'],
    '以色列': ['israel', 'israeli'],
    '美国': ['us', 'america', 'american', 'biden', 'trump'],
    '霍尔木兹': ['hormuz', 'strait'],
    '导弹': ['missile', 'rocket'],
    '无人机': ['drone', 'uav'],
  };
  
  for (const [tag, keywords] of Object.entries(tagKeywords)) {
    if (keywords.some(k => lowerTitle.includes(k))) {
      tags.push(tag);
    }
  }
  
  return tags.slice(0, 3);
}

// Fetch news from GDELT
async function fetchGDELTNews(): Promise<NewsItem[]> {
  const query = IRAN_KEYWORDS.join(' OR ');
  const timespan = '24h';
  
  try {
    const response = await fetch(
      `${GDELT_API}?query=${encodeURIComponent(query)}&mode=ArtList&maxrecords=50&timespan=${timespan}&format=json`,
      {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 600 }
      }
    );

    if (!response.ok) {
      throw new Error(`GDELT API error: ${response.status}`);
    }

    const data = await response.json();
    const articles = data.articles || [];

    return articles.map((article: any, index: number) => {
      const title = article.title || 'Untitled';
      const source = article.source || 'Unknown';
      const domain = new URL(article.url || 'http://unknown.com').hostname.replace('www.', '');
      
      const sourceInfo = Object.entries(SOURCE_MAPPING).find(([d]) => domain.includes(d));
      const sourceName = sourceInfo ? sourceInfo[1].name : source;
      
      return {
        id: `news-${index}-${Date.now()}`,
        title: title,
        summary: article.seendescription || title,
        source: sourceName,
        timestamp: article.seendate ? new Date(article.seendate).toISOString() : new Date().toISOString(),
        category: determineCategory(title, domain),
        importance: determineImportance(title),
        tags: extractTags(title)
      };
    }).slice(0, 20);

  } catch (error) {
    console.error('GDELT fetch error:', error);
    throw error;
  }
}

// Alternative: Fetch from NewsAPI (requires API key)
async function fetchNewsAPI(): Promise<NewsItem[]> {
  // This is a placeholder for NewsAPI integration
  // Requires NEWS_API_KEY environment variable
  const apiKey = process.env.NEWS_API_KEY;
  
  if (!apiKey) {
    throw new Error('NewsAPI key not configured');
  }

  const query = 'Iran OR Tehran OR "Persian Gulf" OR "Strait of Hormuz"';
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=20&apiKey=${apiKey}`;

  const response = await fetch(url, { next: { revalidate: 600 } });
  
  if (!response.ok) {
    throw new Error(`NewsAPI error: ${response.status}`);
  }

  const data = await response.json();
  
  return data.articles.map((article: any, index: number) => ({
    id: `news-${index}-${Date.now()}`,
    title: article.title,
    summary: article.description || article.title,
    source: article.source?.name || 'Unknown',
    timestamp: new Date(article.publishedAt).toISOString(),
    category: determineCategory(article.title, article.source?.name || ''),
    importance: determineImportance(article.title),
    tags: extractTags(article.title)
  }));
}

// Generate hourly summary from news items
function generateSummary(items: NewsItem[]): NewsHourlySummary {
  const now = new Date();
  const hour = now.toISOString().slice(0, 13) + ':00';
  
  // Count by importance
  const criticalCount = items.filter(i => i.importance === 'critical').length;
  const highCount = items.filter(i => i.importance === 'high').length;
  
  // Determine risk level
  let riskLevel: NewsHourlySummary['riskLevel'] = 'low';
  if (criticalCount >= 2 || (criticalCount >= 1 && highCount >= 3)) {
    riskLevel = 'critical';
  } else if (criticalCount >= 1 || highCount >= 3) {
    riskLevel = 'high';
  } else if (highCount >= 1) {
    riskLevel = 'medium';
  }
  
  // Get key events (most important news titles)
  const keyEvents = items
    .filter(i => i.importance === 'critical' || i.importance === 'high')
    .slice(0, 5)
    .map(i => i.title.length > 50 ? i.title.slice(0, 50) + '...' : i.title);
  
  // Generate summary text
  const categories = ['military', 'sanction', 'energy', 'diplomacy'];
  const categoryCounts: Record<string, number> = {};
  categories.forEach(cat => {
    categoryCounts[cat] = items.filter(i => i.category === cat).length;
  });
  
  const dominantCategory = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'general';
  
  const summaryTexts: Record<string, string> = {
    military: `过去一小时，地区军事活动显著增加。${criticalCount > 0 ? '监测到关键军事动态，' : ''}涉及导弹部署、军事演习及边境紧张局势。`,
    sanction: `制裁相关动态持续发酵。${criticalCount > 0 ? '重要制裁措施 announced，' : ''}多国就经济制裁表态，影响能源及金融领域。`,
    energy: `能源市场波动加剧。${criticalCount > 0 ? '关键能源基础设施受威胁，' : ''}油价及航运保险费率出现显著变化。`,
    diplomacy: `外交渠道活动频繁。${criticalCount > 0 ? '重要外交声明发布，' : ''}各方就地区局势进行密集沟通与协调。`,
    general: `地区局势持续演变。${criticalCount > 0 ? '监测到重要动态，' : ''}各方保持高度关注，市场反应敏感。`
  };
  
  return {
    hour,
    summary: summaryTexts[dominantCategory],
    keyEvents: keyEvents.length > 0 ? keyEvents : ['暂无重大事件'],
    riskLevel
  };
}

// Fallback mock data
function getFallbackNews(): NewsItem[] {
  const now = new Date();
  return [
    {
      id: '1',
      title: '伊朗宣布提高铀浓缩至60%纯度',
      summary: '伊朗原子能组织宣布，作为对美国制裁的回应，已将铀浓缩活动提升至60%纯度，接近武器级90%水平。',
      source: 'Reuters',
      timestamp: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
      category: 'domestic',
      importance: 'critical',
      tags: ['核问题', '制裁', '外交']
    },
    {
      id: '2',
      title: '美国国务卿：不排除对伊朗采取军事行动',
      summary: '美国国务卿在记者会上表示，如果外交途径无法阻止伊朗核计划，美国将考虑所有选项，包括军事行动。',
      source: 'AP',
      timestamp: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
      category: 'us',
      importance: 'high',
      tags: ['美国', '军事', '外交']
    },
    {
      id: '3',
      title: '以色列空军在叙利亚上空拦截伊朗无人机',
      summary: '以色列国防军称，其空军在叙利亚领空拦截了数架疑似伊朗制造的无人机，这是本周第三次类似事件。',
      source: 'Jerusalem Post',
      timestamp: new Date(now.getTime() - 90 * 60 * 1000).toISOString(),
      category: 'israel',
      importance: 'medium',
      tags: ['以色列', '军事', '叙利亚']
    },
    {
      id: '4',
      title: '伊朗石油出口量下降至120万桶/日',
      summary: '据油轮追踪数据显示，受制裁影响，伊朗石油出口量已降至120万桶/日，为近三年来最低水平。',
      source: 'Bloomberg',
      timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
      category: 'energy',
      importance: 'high',
      tags: ['石油', '制裁', '经济']
    },
    {
      id: '5',
      title: '革命卫队在霍尔木兹海峡举行军事演习',
      summary: '伊朗革命卫队宣布在霍尔木兹海峡开始为期三天的军事演习，展示其封锁海峡的能力。',
      source: 'Tasnim',
      timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000).toISOString(),
      category: 'military',
      importance: 'high',
      tags: ['军事', '霍尔木兹', '演习']
    }
  ];
}

export async function GET() {
  // Skip during build time
  if (isBuildTime()) {
    return buildTimeSkipResponse('Skipping news fetch during build');
  }

  try {
    const now = Date.now();
    
    // Check cache
    if (cachedData && (now - lastFetchTime) < CACHE_DURATION) {
      const response: ApiResponse<{ items: NewsItem[]; summary: NewsHourlySummary }> = {
        success: true,
        data: cachedData,
        timestamp: new Date().toISOString(),
        cached: true
      };
      return NextResponse.json(response);
    }

    let items: NewsItem[] = [];
    
    // Try GDELT first
    try {
      items = await fetchGDELTNews();
    } catch (gdeltError) {
      console.warn('GDELT failed, trying NewsAPI:', gdeltError);
      
      // Try NewsAPI as backup
      try {
        items = await fetchNewsAPI();
      } catch (newsapiError) {
        console.warn('NewsAPI also failed:', newsapiError);
      }
    }
    
    // If no items fetched, use fallback
    if (items.length === 0) {
      items = getFallbackNews();
    }
    
    // Generate summary
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
      source: items.length > 0 && !items[0].id.startsWith('news-mock') ? 'gdelt' : 'fallback'
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('News API error:', error);
    
    // Return cached data if available
    if (cachedData) {
      const response: ApiResponse<{ items: NewsItem[]; summary: NewsHourlySummary }> = {
        success: true,
        data: cachedData,
        timestamp: new Date().toISOString(),
        cached: true,
        warning: 'Using cached data due to API error'
      };
      return NextResponse.json(response);
    }

    // Return fallback data
    const fallbackItems = getFallbackNews();
    const fallbackSummary = generateSummary(fallbackItems);
    
    const response: ApiResponse<{ items: NewsItem[]; summary: NewsHourlySummary }> = {
      success: true,
      data: { items: fallbackItems, summary: fallbackSummary },
      timestamp: new Date().toISOString(),
      warning: 'Using fallback data'
    };
    
    return NextResponse.json(response);
  }
}
