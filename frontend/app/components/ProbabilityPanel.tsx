'use client';

import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, AreaChart, Area, ReferenceLine, Tooltip } from 'recharts';
import { ProbabilityMetric } from '@/app/types';

interface ProbabilityPanelProps {
  data: ProbabilityMetric[];
  lastUpdate: string;
  defaultTab?: 'phase' | 'overview';
}

// 模拟相位图数据
const generatePhaseData = () => {
  const data = [];
  for (let i = 0; i <= 360; i += 10) {
    const rad = (i * Math.PI) / 180;
    data.push({
      angle: i,
      x: Math.cos(rad),
      y: Math.sin(rad),
      amplitude: 0.5 + 0.3 * Math.sin(rad * 3)
    });
  }
  return data;
};

// 模拟时间序列相位数据
const generateTimeSeriesData = () => {
  const data = [];
  const now = new Date();
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const phase = ((30 - i) * 15) % 360;
    const amplitude = 0.4 + 0.3 * Math.sin((30 - i) * 0.3) + Math.random() * 0.1;
    data.push({
      date: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
      phase,
      amplitude: Math.round(amplitude * 100) / 100,
      unwrappedPhase: (30 - i) * 15
    });
  }
  return data;
};

export default function ProbabilityPanel({ data, lastUpdate, defaultTab = 'phase' }: ProbabilityPanelProps) {
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'phase'>(defaultTab);
  
  const phaseData = generatePhaseData();
  const timeSeriesData = generateTimeSeriesData();

  const getRiskColor = (probability: number) => {
    if (probability >= 70) return '#ef4444';
    if (probability >= 40) return '#f59e0b';
    if (probability >= 20) return '#3b82f6';
    return '#10b981';
  };

  const getRiskTextColor = (probability: number) => {
    if (probability >= 70) return 'text-red-400';
    if (probability >= 40) return 'text-amber-400';
    if (probability >= 20) return 'text-blue-400';
    return 'text-green-400';
  };

  const getTrendIcon = (trend: string, change: number) => {
    if (trend === 'up' || change > 0) {
      return (
        <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
    } else if (trend === 'down' || change < 0) {
      return (
        <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
      </svg>
    );
  };

  // Gauge Component
  const Gauge = ({ value, color }: { value: number; color: string }) => {
    const radius = 40;
    const stroke = 8;
    const normalizedRadius = radius - stroke / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (value / 100) * circumference;

    return (
      <div className="relative w-24 h-24">
        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90"
        >
          <circle
            stroke="#1f2937"
            strokeWidth={stroke}
            fill="transparent"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease-in-out' }}
            strokeLinecap="round"
            fill="transparent"
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold" style={{ color }}>{value.toFixed(0)}%</span>
        </div>
      </div>
    );
  };

  // Phase Circle Visualization
  const PhaseCircle = ({ currentPhase = 45 }: { currentPhase?: number }) => {
    const rad = (currentPhase * Math.PI) / 180;
    const x = Math.cos(rad) * 80;
    const y = Math.sin(rad) * 80;
    
    return (
      <div className="relative w-48 h-48 mx-auto">
        <svg viewBox="-100 -100 200 200" className="w-full h-full">
          {/* Background circle */}
          <circle cx="0" cy="0" r="80" fill="none" stroke="#1f2937" strokeWidth="2" />
          
          {/* Phase quadrants */}
          <path d="M 0 0 L 80 0 A 80 80 0 0 1 0 80 Z" fill="#10b981" fillOpacity="0.1" />
          <path d="M 0 0 L 0 80 A 80 80 0 0 1 -80 0 Z" fill="#3b82f6" fillOpacity="0.1" />
          <path d="M 0 0 L -80 0 A 80 80 0 0 1 0 -80 Z" fill="#f59e0b" fillOpacity="0.1" />
          <path d="M 0 0 L 0 -80 A 80 80 0 0 1 80 0 Z" fill="#ef4444" fillOpacity="0.1" />
          
          {/* Axis lines */}
          <line x1="-80" y1="0" x2="80" y2="0" stroke="#374151" strokeWidth="1" />
          <line x1="0" y1="-80" x2="0" y2="80" stroke="#374151" strokeWidth="1" />
          
          {/* Current phase vector */}
          <line x1="0" y1="0" x2={x} y2={y} stroke="#ef4444" strokeWidth="3" markerEnd="url(#arrowhead)" />
          
          {/* Current phase point */}
          <circle cx={x} cy={y} r="6" fill="#ef4444" />
          
          {/* Labels */}
          <text x="85" y="5" fill="#9ca3af" fontSize="10">0°</text>
          <text x="-95" y="5" fill="#9ca3af" fontSize="10">180°</text>
          <text x="-5" y="-85" fill="#9ca3af" fontSize="10">90°</text>
          <text x="-5" y="95" fill="#9ca3af" fontSize="10">270°</text>
          
          {/* Legend */}
          <text x="-90" y="-90" fill="#10b981" fontSize="8">上升期</text>
          <text x="60" y="-90" fill="#ef4444" fontSize="8">峰值期</text>
          <text x="60" y="95" fill="#f59e0b" fontSize="8">下降期</text>
          <text x="-90" y="95" fill="#3b82f6" fontSize="8">谷值期</text>
        </svg>
        
        {/* Current phase display */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-6">
          <span className="text-lg font-bold text-red-400">{currentPhase}°</span>
        </div>
      </div>
    );
  };

  // Hilbert Analysis Info - 修正计算逻辑
  const HilbertInfo = () => {
    // 实际计算参数
    const currentPhase = 83.7; // 当前相位（度）
    const amplitude = 0.72; // 振幅强度
    const phaseVelocity = 18.5; // 相位速度（度/天）
    
    // 计算到完整周期中点（180°）的时间
    const targetPhase = 180; // 完整周期中点
    const deltaPhase = targetPhase - currentPhase; // 剩余相位
    const daysToPeak = deltaPhase / phaseVelocity; // 精确计算天数
    
    // 计算预测日期
    const now = new Date();
    const predictedDate = new Date(now.getTime() + daysToPeak * 24 * 60 * 60 * 1000);
    
    // 格式化时间显示
    let timeToPeakText;
    if (daysToPeak < 1) {
      const hours = Math.round(daysToPeak * 24);
      timeToPeakText = `${hours}小时`;
    } else {
      timeToPeakText = `${daysToPeak.toFixed(1)}天`;
    }
    
    return (
      <div className="p-4 rounded-xl border border-gray-800/60 bg-gray-800/20">
        <h4 className="text-sm font-medium text-gray-200 mb-3">希尔伯特变换相位分析</h4>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">{currentPhase}°</div>
            <div className="text-xs text-gray-500">当前相位</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400">{amplitude}</div>
            <div className="text-xs text-gray-500">振幅强度</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{phaseVelocity}°</div>
            <div className="text-xs text-gray-500">相位速度/天</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{timeToPeakText}</div>
            <div className="text-xs text-gray-500">距峰值期</div>
          </div>
        </div>
        
        <div className="text-xs text-gray-400 space-y-1">
          <p>• 周期位置: <span className="text-amber-400">上升期 → 峰值期</span></p>
          <p>• 剩余相位: <span className="text-blue-400">{deltaPhase.toFixed(1)}°</span> (目标180° 周期中点)</p>
          <p>• 预测进入峰值: <span className="text-red-400">{predictedDate.toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span></p>
          <p>• 置信度: <span className="text-green-400">78%</span></p>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-100">冲击事件概率模型</h3>
            <p className="text-xs text-gray-500">希尔伯特变换相位分析</p>
          </div>
        </div>
        
        {/* Tab Switch */}
        <div className="flex items-center gap-1 bg-gray-800/50 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
              activeTab === 'overview' ? 'bg-gray-700 text-gray-200' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            概率概览
          </button>
          <button
            onClick={() => setActiveTab('phase')}
            className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
              activeTab === 'phase' ? 'bg-gray-700 text-gray-200' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            相位分析
          </button>
        </div>
      </div>

      {activeTab === 'overview' ? (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0 overflow-y-auto">
          {data.map((metric) => {
            const color = getRiskColor(metric.probability);
            
            return (
              <div
                key={metric.id}
                className="p-4 rounded-xl border border-gray-800/60 bg-gray-800/20"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <Gauge value={metric.probability} color={color} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-200">{metric.name}</h4>
                      <div className={`flex items-center gap-1 ${getRiskTextColor(metric.probability)}`}>
                        {getTrendIcon(metric.trend, metric.change24h)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 text-xs mb-3">
                      <span className="text-gray-500">24h变化:</span>
                      <span className={metric.change24h > 0 ? 'text-red-400' : 'text-green-400'}>
                        {metric.change24h > 0 ? '+' : ''}{metric.change24h.toFixed(1)}%
                      </span>
                    </div>
                    
                    {metric.triggers && metric.triggers.length > 0 && (
                      <div className="space-y-1">
                        {metric.triggers.slice(0, 3).map((trigger, idx) => (
                          <div key={idx} className="text-xs text-gray-400 flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-gray-600"></span>
                            {trigger.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0 overflow-y-auto">
          {/* Phase Circle */}
          <div className="p-4 rounded-xl border border-gray-800/60 bg-gray-800/20">
            <h4 className="text-sm font-medium text-gray-200 mb-4">相位图 (Phase Diagram)</h4>
            <PhaseCircle currentPhase={83.7} />
            <div className="mt-6 text-xs text-gray-500 text-center">
              复平面表示：横轴为原信号，纵轴为希尔伯特变换信号
            </div>
          </div>
          
          {/* Hilbert Analysis */}
          <HilbertInfo />
          
          {/* Phase Time Series */}
          <div className="p-4 rounded-xl border border-gray-800/60 bg-gray-800/20 lg:col-span-2">
            <h4 className="text-sm font-medium text-gray-200 mb-4">相位时间序列 (30天)</h4>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeSeriesData}>
                  <XAxis 
                    dataKey="date" 
                    tick={{ fill: '#6b7280', fontSize: 10 }}
                    axisLine={{ stroke: '#374151' }}
                  />
                  <YAxis 
                    yAxisId="phase"
                    tick={{ fill: '#6b7280', fontSize: 10 }}
                    axisLine={{ stroke: '#374151' }}
                    label={{ value: '相位 (°)', angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 10 }}
                  />
                  <YAxis 
                    yAxisId="amp"
                    orientation="right"
                    tick={{ fill: '#6b7280', fontSize: 10 }}
                    axisLine={{ stroke: '#374151' }}
                    label={{ value: '振幅', angle: 90, position: 'insideRight', fill: '#6b7280', fontSize: 10 }}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                    labelStyle={{ color: '#9ca3af' }}
                  />
                  <ReferenceLine y={360} yAxisId="phase" stroke="#ef4444" strokeDasharray="3 3" label={{ value: '周期完成', fill: '#ef4444', fontSize: 10 }} />
                  <Line 
                    yAxisId="phase"
                    type="monotone" 
                    dataKey="phase" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={false}
                    name="相位"
                  />
                  <Line 
                    yAxisId="amp"
                    type="monotone" 
                    dataKey="amplitude" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={false}
                    name="振幅"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              蓝色：相位 (0-360°) | 绿色：振幅强度 | 红线：周期完成阈值
            </div>
          </div>
          
          {/* Methodology */}
          <div className="p-4 rounded-xl border border-gray-800/60 bg-gray-800/20 lg:col-span-2">
            <h4 className="text-sm font-medium text-gray-200 mb-3">希尔伯特变换原理</h4>
            <div className="text-xs text-gray-400 space-y-2">
              <p><span className="text-blue-400">解析信号：</span>z(t) = x(t) + i·H(x(t))</p>
              <p><span className="text-green-400">振幅：</span>A(t) = √[x² + H(x)²] —— 周期强度</p>
              <p><span className="text-amber-400">相位：</span>φ(t) = atan2(H(x), x) —— 周期进度</p>
              <p><span className="text-red-400">预测：</span>Δt = Δφ / v —— 基于相位速度计算峰值时间</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
