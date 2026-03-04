'use client';

import { NewsItem, NewsHourlySummary } from '@/app/types';

interface NewsPanelProps {
  items: NewsItem[];
  summary: NewsHourlySummary;
  lastUpdate: string;
}

export default function NewsPanel({ items, summary, lastUpdate }: NewsPanelProps) {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'domestic': return 'text-purple-400 border-purple-400/30 bg-purple-400/10';
      case 'us': return 'text-blue-400 border-blue-400/30 bg-blue-400/10';
      case 'israel': return 'text-cyan-400 border-cyan-400/30 bg-cyan-400/10';
      case 'energy': return 'text-amber-400 border-amber-400/30 bg-amber-400/10';
      case 'military': return 'text-red-400 border-red-400/30 bg-red-400/10';
      case 'sanction': return 'text-orange-400 border-orange-400/30 bg-orange-400/10';
      case 'diplomacy': return 'text-indigo-400 border-indigo-400/30 bg-indigo-400/10';
      default: return 'text-gray-400 border-gray-400/30 bg-gray-400/10';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'domestic': return '伊朗国内';
      case 'us': return '美国动态';
      case 'israel': return '以色列';
      case 'energy': return '能源';
      case 'military': return '军事';
      case 'sanction': return '制裁';
      case 'diplomacy': return '外交';
      default: return '其他';
    }
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-400 bg-red-400/10 border-red-400/30';
      case 'high': return 'text-orange-400 bg-orange-400/10 border-orange-400/30';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'low': return 'text-green-400 bg-green-400/10 border-green-400/30';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  const getRiskLevelText = (level: string) => {
    switch (level) {
      case 'critical': return '极高风险';
      case 'high': return '高风险';
      case 'medium': return '中等风险';
      case 'low': return '低风险';
      default: return '未知';
    }
  };

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diff = now.getTime() - date.getTime();
      const minutes = Math.floor(diff / 60000);
      
      if (minutes < 1) {
        return '刚刚';
      } else if (minutes < 60) {
        return `${minutes}分钟前`;
      } else if (minutes < 1440) {
        return `${Math.floor(minutes / 60)}小时前`;
      } else {
        return date.toLocaleDateString('zh-CN');
      }
    } catch {
      return '未知时间';
    }
  };

  // Handle empty data
  if (!items || items.length === 0) {
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-100">实时新闻小时报</h3>
              <p className="text-xs text-gray-500">过去24小时关键动态</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>更新于 {new Date(lastUpdate).toLocaleTimeString('zh-CN')}</span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <p className="text-gray-500 mb-2">正在加载新闻数据...</p>
            <p className="text-xs text-gray-600">正在爬取 Reuters, BBC, Al Jazeera...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-100">实时新闻小时报</h3>
            <p className="text-xs text-gray-500">过去24小时关键动态 · Web Crawler数据源</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>更新于 {new Date(lastUpdate).toLocaleTimeString('zh-CN')}</span>
        </div>
      </div>

      {/* Hourly Summary */}
      {summary && summary.summary && (
        <div className="mb-4 p-4 rounded-xl border border-gray-800/60 bg-gradient-to-r from-gray-800/40 to-gray-800/20">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs text-gray-500">{summary.hour || '当前'} 时段摘要</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getRiskLevelColor(summary.riskLevel || 'low')}`}>
                  {getRiskLevelText(summary.riskLevel || 'low')}
                </span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{summary.summary}</p>
            </div>
          </div>
          
          {summary.keyEvents && summary.keyEvents.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-700/30">
              <span className="text-xs text-gray-500 mb-2 block">关键事件:</span>
              <div className="flex flex-wrap gap-2">
                {summary.keyEvents.map((event, index) => (
                  <span
                    key={index}
                    className="text-xs px-2 py-1 rounded-lg bg-gray-700/50 text-gray-300 border border-gray-600/30"
                  >
                    {event}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* News Timeline */}
      <div className="flex-1 overflow-y-auto pr-2 min-h-0">
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={item.id || index}
              className="group relative p-4 rounded-xl border border-gray-800/60 bg-gray-800/20 hover:bg-gray-800/40 hover:border-gray-600/50 transition-all duration-200"
            >
              {/* Timeline Line */}
              {index !== items.length - 1 && (
                <div className="absolute left-6 top-14 bottom-[-12px] w-px bg-gray-700/50" />
              )}
              
              <div className="flex items-start gap-4">
                {/* Importance Indicator */}
                <div className="relative flex-shrink-0">
                  <div className={`w-3 h-3 rounded-full ${getImportanceColor(item.importance)} ring-4 ring-gray-800`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getCategoryColor(item.category)}`}>
                      {getCategoryLabel(item.category)}
                    </span>
                    
                    <span className="text-xs text-gray-500">{item.source}</span>
                    
                    <span className="text-xs text-gray-600">{formatTime(item.timestamp)}</span>
                  </div>
                  
                  <h4 className="text-sm font-medium text-gray-200 mb-1 group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </h4>
                  
                  <p className="text-xs text-gray-400 line-clamp-2">{item.summary}</p>
                  
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {item.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-gray-700/50 text-gray-400"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
