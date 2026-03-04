'use client';

import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { AssetPrice } from '@/app/types';

interface AssetsPanelProps {
  data: AssetPrice[];
  lastUpdate: string;
}

export default function AssetsPanel({ data, lastUpdate }: AssetsPanelProps) {
  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-red-400' : 'text-green-400';
  };

  const getChangeBgColor = (change: number) => {
    return change >= 0 ? 'bg-red-400/10' : 'bg-green-400/10';
  };

  const getSparklineColor = (change: number) => {
    return change >= 0 ? '#ef4444' : '#10b981';
  };

  // Handle empty data
  if (!data || data.length === 0) {
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-100">高频敏感资产</h3>
              <p className="text-xs text-gray-500">油价 · 黄金 · 美元 · 航运指数</p>
            </div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <p className="text-gray-500 mb-2">正在加载市场数据...</p>
            <p className="text-xs text-gray-600">连接 Yahoo Finance API</p>
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
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-100">高频敏感资产</h3>
            <p className="text-xs text-gray-500">油价 · 黄金 · 美元 · 航运指数</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>更新于 {new Date(lastUpdate).toLocaleTimeString('zh-CN')}</span>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 min-h-0 overflow-y-auto">
        {data.map((asset) => (
          <div
            key={asset.symbol}
            className="p-4 rounded-xl border border-gray-800/60 bg-gray-800/20 hover:bg-gray-800/40 hover:border-gray-600/50 transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-100">{asset.symbol}</span>
                  <span className="text-xs text-gray-500">{asset.name}</span>
                </div>
                <div className="mt-1">
                  <span className="text-2xl font-bold text-gray-100">
                    {asset.currency === 'USD' ? '$' : '¥'}{asset.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              
              <div className={`flex flex-col items-end gap-1`}>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${getChangeBgColor(asset.change)}`}>
                  {asset.change >= 0 ? (
                    <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  ) : (
                    <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  )}
                  <span className={`text-sm font-medium ${getChangeColor(asset.change)}`}>
                    {asset.change >= 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%
                  </span>
                </div>
                <span className={`text-xs ${getChangeColor(asset.change)}`}>
                  {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}
                </span>
              </div>
            </div>
            
            {/* Mini Chart */}
            <div className="h-16 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={asset.miniChart}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={getSparklineColor(asset.change)}
                    strokeWidth={1.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
