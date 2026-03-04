'use client';

import { useState, useEffect, useCallback } from 'react';
import PolymarketPanel from './components/PolymarketPanel';
import NewsPanel from './components/NewsPanel';
import NewsAnalysisPanel from './components/NewsAnalysisPanel';
import ProbabilityPanel from './components/ProbabilityPanel';
import AssetsPanel from './components/AssetsPanel';
import {
  generateProbabilityData,
} from './lib/mockData';
import {
  PolymarketEvent,
  NewsItem,
  NewsHourlySummary,
  ProbabilityMetric,
  AssetPrice
} from './types';

interface DashboardData {
  polymarket: PolymarketEvent[];
  news: {
    items: NewsItem[];
    summary: NewsHourlySummary;
  };
  probabilities: ProbabilityMetric[];
  assets: AssetPrice[];
}

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<string>('');
  const [activeSection, setActiveSection] = useState<string>('all');
  const [probabilityTab, setProbabilityTab] = useState<'phase' | 'overview'>('phase'); // 默认显示相位分析
  const [error, setError] = useState<string | null>(null);

  // Fetch Polymarket real data
  const fetchPolymarketData = useCallback(async (): Promise<PolymarketEvent[]> => {
    try {
      const response = await fetch('/api/polymarket-real');
      const result = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      }
      throw new Error(result.error || 'Failed to fetch Polymarket data');
    } catch (error) {
      console.error('Polymarket fetch error:', error);
      throw error;
    }
  }, []);

  // Fetch market real data
  const fetchMarketData = useCallback(async (): Promise<AssetPrice[]> => {
    try {
      const response = await fetch('/api/markets-real');
      const result = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      }
      throw new Error(result.error || 'Failed to fetch market data');
    } catch (error) {
      console.error('Market fetch error:', error);
      throw error;
    }
  }, []);

  // Fetch news real data (using web crawler)
  const fetchNewsData = useCallback(async (): Promise<{ items: NewsItem[]; summary: NewsHourlySummary }> => {
    try {
      const response = await fetch('/api/news-crawler');
      const result = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      }
      throw new Error(result.error || 'Failed to fetch news data');
    } catch (error) {
      console.error('News fetch error:', error);
      throw error;
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      
      // Fetch real data for all modules
      const [polymarketData, assetsData, newsData] = await Promise.all([
        fetchPolymarketData().catch(() => null),
        fetchMarketData().catch(() => null),
        fetchNewsData().catch(() => null)
      ]);

      // Use mock data for probabilities (can be replaced with real APIs later)
      const probabilities = generateProbabilityData();

      setData({
        polymarket: polymarketData || [],
        news: newsData || { items: [], summary: { hour: '', summary: '', keyEvents: [], riskLevel: 'low' } },
        probabilities,
        assets: assetsData || []
      });
      setLastRefresh(new Date().toISOString());
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('数据加载失败，部分显示模拟数据');
    } finally {
      setLoading(false);
    }
  }, [fetchPolymarketData, fetchMarketData, fetchNewsData]);

  useEffect(() => {
    fetchData();

    // Set up auto-refresh intervals
    const hourlyInterval = setInterval(fetchData, 60 * 60 * 1000); // Every hour
    const assetInterval = setInterval(async () => {
      try {
        const newAssets = await fetchMarketData();
        setData(prev => prev ? { ...prev, assets: newAssets } : null);
      } catch (error) {
        console.error('Failed to refresh assets:', error);
      }
    }, 5 * 60 * 1000); // Every 5 minutes

    const newsInterval = setInterval(async () => {
      try {
        const newNews = await fetchNewsData();
        setData(prev => prev ? { ...prev, news: newNews } : null);
      } catch (error) {
        console.error('Failed to refresh news:', error);
      }
    }, 15 * 60 * 1000); // Every 15 minutes (respect crawler rate limits)

    return () => {
      clearInterval(hourlyInterval);
      clearInterval(assetInterval);
      clearInterval(newsInterval);
    };
  }, [fetchData, fetchMarketData, fetchNewsData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 animate-pulse flex items-center justify-center">
            <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <p className="text-gray-400">加载情报数据...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">数据加载失败，请刷新重试</p>
          <button
            onClick={fetchData}
            className="mt-4 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-gray-800/60">
        <div className="max-w-[1920px] mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-red-500/25">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-100 tracking-tight">伊朗情报看板</h1>
                <p className="text-[10px] text-gray-500 font-mono tracking-wider uppercase">Iran Intelligence Dashboard</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {error && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                  <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-xs text-yellow-400">{error}</span>
                </div>
              )}
              
              <nav className="hidden md:flex items-center gap-1">
                {[
                  { id: 'all', label: '全部' },
                  { id: 'events', label: '实时事件' },
                  { id: 'news', label: '新闻' },
                  { id: 'probability', label: '概率模型' },
                  { id: 'assets', label: '敏感资产' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 ${
                      activeSection === item.id
                        ? 'bg-gray-800 text-gray-100'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>

              <button
                onClick={fetchData}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-gray-200 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="hidden sm:inline">刷新</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="pt-20 pb-8 px-4">
        <div className="max-w-[1920px] mx-auto">
          {/* Section 1: Polymarket + News (Side by Side) */}
          {(activeSection === 'all' || activeSection === 'events' || activeSection === 'news') && (
            <section className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Left: Polymarket */}
              {(activeSection === 'all' || activeSection === 'events') && (
                <div className="bg-gray-900/50 rounded-2xl border border-gray-800/60 p-6 h-[500px]">
                  <PolymarketPanel
                    lastUpdate={lastRefresh}
                  />
                </div>
              )}
              {/* Right: News */}
              {(activeSection === 'all' || activeSection === 'news') && (
                <div className="bg-gray-900/50 rounded-2xl border border-gray-800/60 p-6 h-[500px]">
                  <NewsPanel
                    items={data.news.items}
                    summary={data.news.summary}
                    lastUpdate={lastRefresh}
                  />
                </div>
              )}
            </section>
          )}

          {/* Section 2: News Analysis - Intelligence Analysis */}
          {(activeSection === 'all' || activeSection === 'events') && (
            <section className="mb-6">
              <div className="bg-gray-900/50 rounded-2xl border border-gray-800/60 p-6 h-[400px]">
                <NewsAnalysisPanel
                  lastUpdate={lastRefresh}
                />
              </div>
            </section>
          )}

          {/* Section 3: Probability Model - Phase Analysis */}
          {(activeSection === 'all' || activeSection === 'probability') && (
            <section className="mb-6">
              <div className="bg-gray-900/50 rounded-2xl border border-gray-800/60 p-6 h-[700px]">
                <ProbabilityPanel
                  data={data.probabilities}
                  lastUpdate={lastRefresh}
                  defaultTab={probabilityTab}
                />
              </div>
            </section>
          )}

          {/* Section 4: Assets - Sensitive Assets */}
          {(activeSection === 'all' || activeSection === 'assets') && (
            <section className="mb-6">
              <div className="bg-gray-900/50 rounded-2xl border border-gray-800/60 p-6 h-[400px]">
                <AssetsPanel
                  data={data.assets}
                  lastUpdate={lastRefresh}
                />
              </div>
            </section>
          )}
        </div>
      </main>

      <footer className="border-t border-gray-800/60 bg-[#0a0a0f]">
        <div className="max-w-[1920px] mx-auto px-4 py-4">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-4">
              <span>数据源: Polymarket API | Yahoo Finance | Web Crawler (Reuters, BBC, Al Jazeera...) | 数据更新频率: 新闻 每15分钟 | 资产 每5分钟</span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                系统运行正常
              </span>
            </div>
            <div>
              最后更新: {new Date(lastRefresh).toLocaleString('zh-CN')}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
