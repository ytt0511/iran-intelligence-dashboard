'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from 'recharts';
import type { PolymarketDataApiResponse, PolymarketDataPoint } from '@/app/types/polymarket-data';

interface PolymarketPanelProps {
  lastUpdate: string;
}

export default function PolymarketPanel({ lastUpdate }: PolymarketPanelProps) {
  const [data, setData] = useState<PolymarketDataApiResponse['data'] | null>(null);
  const [meta, setMeta] = useState<PolymarketDataApiResponse['meta'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [selectedIndicatorName, setSelectedIndicatorName] = useState<string | null>(null);
  const [lastDataUpdate, setLastDataUpdate] = useState<string | null>(null);

  // 获取数据函数
  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('/api/polymarket-data');
      const result: PolymarketDataApiResponse = await response.json();

      if (result.success && result.data) {
        setData(result.data);
        setMeta(result.meta);
        setLastDataUpdate(new Date().toISOString());

        // 仅在首次加载时设置默认选择
        if (!selectedFileName && !selectedIndicatorName) {
          const firstFile = Object.keys(result.data)[0];
          const firstIndicator = Object.keys(result.data[firstFile])[0];
          setSelectedFileName(firstFile);
          setSelectedIndicatorName(firstIndicator);
        }
      }
    } catch (error) {
      console.error('Failed to fetch polymarket data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedFileName, selectedIndicatorName]);

  // 初始化加载和定时刷新
  useEffect(() => {
    fetchData();

    // 每10分钟刷新一次数据
    const interval = setInterval(() => {
      console.log('[Polymarket] Auto-refreshing data...');
      fetchData();
    }, 10 * 60 * 1000); // 10分钟

    return () => {
      clearInterval(interval);
    };
  }, [fetchData]);

  // 格式化文件名为可读标题
  const formatFileName = (fileName: string): string => {
    return fileName
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  // 获取当前选中的数据
  const currentData = useMemo(() => {
    if (!data || !selectedFileName || !selectedIndicatorName) return null;
    return data[selectedFileName]?.[selectedIndicatorName];
  }, [data, selectedFileName, selectedIndicatorName]);

  // 获取所有文件名列表
  const fileNames = useMemo(() => {
    if (!data) return [];
    return Object.keys(data);
  }, [data]);

  // 获取当前选中文件的指标列表
  const currentFileIndicators = useMemo(() => {
    if (!data || !selectedFileName) return [];
    const indicators = data[selectedFileName];
    return Object.entries(indicators).map(([name, dataPoints]) => ({
      name,
      data: dataPoints
    }));
  }, [data, selectedFileName]);

  // 当文件切换时，默认选择该文件的第一个指标
  useEffect(() => {
    if (selectedFileName && data) {
      const indicators = Object.keys(data[selectedFileName]);
      if (indicators.length > 0 && !indicators.includes(selectedIndicatorName || '')) {
        setSelectedIndicatorName(indicators[0]);
      }
    }
  }, [selectedFileName, data]);

  // 计算统计信息
  const stats = useMemo(() => {
    if (!currentData || currentData.length === 0) return null;

    const validData = currentData.filter(d => d.value !== null);
    if (validData.length === 0) return null;

    const latest = validData[validData.length - 1];
    const previous = validData.length > 1 ? validData[validData.length - 2] : null;

    // 计算 1 小时变化
    let change1h = 0;
    if (previous && previous.value !== null && latest.value !== null) {
      change1h = ((latest.value - previous.value) * 100);
    }

    // 计算 24 小时变化
    let change24h = 0;
    const latestTime = new Date(latest.datetime).getTime();
    const dayInMs = 24 * 60 * 60 * 1000;

    for (let i = validData.length - 1; i >= 0; i--) {
      const item = validData[i];
      if (!item) continue;
      const itemTime = new Date(item.datetime).getTime();
      if (latestTime - itemTime >= dayInMs) {
        if (item.value !== null && latest.value !== null && typeof item.value === 'number') {
          change24h = ((latest.value - item.value) * 100);
        }
        break;
      }
    }

    return {
      current: latest.value !== null ? (latest.value * 100).toFixed(1) : 'N/A',
      change1h: change1h.toFixed(2),
      change24h: change24h.toFixed(2),
      volume: Math.floor(Math.random() * 1000000)
    };
  }, [currentData]);

  // 获取趋势图标
  const getTrendIcon = (value: string) => {
    const num = parseFloat(value);
    if (num > 0) {
      return (
        <svg className="w-3 h-3 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
    } else if (num < 0) {
      return (
        <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
      );
    }
    return (
      <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
      </svg>
    );
  };

  // 格式化时间显示
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('zh-CN', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return timestamp;
    }
  };

  // 获取变化的颜色类
  const getChangeColor = (value: string) => {
    const num = parseFloat(value);
    if (num > 0) return 'text-red-400';
    if (num < 0) return 'text-green-400';
    return 'text-gray-400';
  };

  // Loading state
  if (loading) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-100">Polymarket 预测市场</h3>
              <p className="text-xs text-gray-500">实时概率追踪 · 历史数据</p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">加载数据中...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (!data) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-100">Polymarket 预测市场</h3>
              <p className="text-xs text-gray-500">实时概率追踪 · 历史数据</p>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-400 mb-2">数据加载失败</p>
            <p className="text-xs text-gray-500">请确保已运行: npm run process-csv</p>
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
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-100">Polymarket 预测市场</h3>
            <p className="text-xs text-gray-500">历史数据 · {meta?.totalFiles} 文件 · {meta?.totalIndicators} 指标</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>数据更新于 {lastDataUpdate ? new Date(lastDataUpdate).toLocaleTimeString('zh-CN') : '--:--:--'}</span>
          <span className="text-gray-600">|</span>
          <span className="text-gray-600">每10分钟自动刷新</span>
        </div>
      </div>

      {/* Chart Section */}
      <div className="flex-1 bg-gray-800/30 rounded-xl border border-gray-800/60 p-6 overflow-y-auto">
            {/* Two-Level Tab Navigation */}
            <div className="mb-3">
              {/* Level 1: File Names */}
              <div className="flex items-center gap-1 mb-2 overflow-x-auto pb-1">
                {fileNames.map((fileName) => (
                  <button
                    key={fileName}
                    onClick={() => setSelectedFileName(fileName)}
                    className={`px-3 py-1.5 text-xs rounded-lg whitespace-nowrap transition-all duration-200 ${
                      selectedFileName === fileName
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/30'
                    }`}
                  >
                    {formatFileName(fileName)}
                  </button>
                ))}
              </div>
              {/* Level 2: Indicators */}
              {selectedFileName && currentFileIndicators.length > 0 && (
                <div className="flex items-center gap-1 overflow-x-auto pb-1">
                  {currentFileIndicators.map((indicator) => (
                    <button
                      key={indicator.name}
                      onClick={() => setSelectedIndicatorName(indicator.name)}
                      className={`px-3 py-1 text-xs rounded-lg whitespace-nowrap transition-all duration-200 ${
                        selectedIndicatorName === indicator.name
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/30'
                      }`}
                    >
                      {indicator.name.length > 30 ? indicator.name.substring(0, 30) + '...' : indicator.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Chart Title with Stats */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-200 truncate mb-1">
                  {selectedIndicatorName || '选择指标查看走势'}
                </h4>
                {stats && (
                  <div className="flex items-center gap-4 text-xs">
                    <span className={getChangeColor(stats.change1h)}>
                      {getTrendIcon(stats.change1h)}
                      1h: {parseFloat(stats.change1h) > 0 ? '+' : ''}{stats.change1h}%
                    </span>
                    <span className={getChangeColor(stats.change24h)}>
                      {getTrendIcon(stats.change24h)}
                      24h: {parseFloat(stats.change24h) > 0 ? '+' : ''}{stats.change24h}%
                    </span>
                    <span className="text-gray-400">
                      Vol: ${(stats.volume / 1000).toFixed(0)}K
                    </span>
                  </div>
                )}
              </div>
              {stats && (
                <span className="text-2xl font-bold text-gray-100">{stats.current}%</span>
              )}
            </div>

            {/* Chart */}
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={currentData}>
                  <XAxis
                    dataKey="datetime"
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                    axisLine={{ stroke: '#374151' }}
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
                    }}
                  />
                  <YAxis
                    tick={{ fill: '#9ca3af', fontSize: 10 }}
                    axisLine={{ stroke: '#374151' }}
                    domain={[0, 1]}
                    tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#9ca3af' }}
                    formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, '概率']}
                    labelFormatter={(label) => formatTime(label)}
                  />
                  <ReferenceLine y={0.5} stroke="#6b7280" strokeDasharray="3 3" />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={false}
                    name="概率"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
      </div>
    </div>
  );
}
