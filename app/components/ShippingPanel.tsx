'use client';

import { ShippingZone } from '@/app/types';

interface ShippingPanelProps {
  data: ShippingZone[];
  lastUpdate: string;
}

export default function ShippingPanel({ data, lastUpdate }: ShippingPanelProps) {
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskTextColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case 'critical': return '极高';
      case 'high': return '高';
      case 'medium': return '中';
      case 'low': return '低';
      default: return '未知';
    }
  };

  // Generate heatmap grid based on density
  const generateHeatmap = (density: number) => {
    const cells = [];
    const rows = 5;
    const cols = 8;
    const activeCells = Math.floor((density / 100) * (rows * cols));
    
    for (let i = 0; i < rows * cols; i++) {
      const isActive = i < activeCells;
      const intensity = isActive ? Math.random() * 0.5 + 0.5 : 0.1;
      cells.push(
        <div
          key={i}
          className={`heatmap-cell aspect-square rounded-sm ${
            isActive ? 'bg-blue-500' : 'bg-gray-800'
          }`}
          style={{ opacity: intensity }}
        />
      );
    }
    return cells;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-100">航运态势监测</h3>
            <p className="text-xs text-gray-500">波斯湾 · 霍尔木兹海峡 · 阿曼湾</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>更新于 {new Date(lastUpdate).toLocaleTimeString('zh-CN')}</span>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        {/* Left: Zone List */}
        <div className="space-y-3 overflow-y-auto pr-2">
          {data.map((zone) => (
            <div
              key={zone.id}
              className="p-4 rounded-xl border border-gray-800/60 bg-gray-800/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium text-gray-200">{zone.name}</h4>
                    <span className="text-xs text-gray-500">{zone.nameEn}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-500">船舶密度:</span>
                      <span className="text-sm font-semibold text-gray-200">{zone.density}%</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-500">船舶数:</span>
                      <span className="text-sm font-semibold text-gray-200">{zone.vessels}</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-500">风险等级:</span>
                      <span className={`text-xs font-medium ${getRiskTextColor(zone.riskLevel)}`}>
                        {getRiskLabel(zone.riskLevel)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className={`flex items-center gap-1 text-xs ${
                  zone.change > 0 ? 'text-red-400' : zone.change < 0 ? 'text-green-400' : 'text-gray-400'
                }`}>
                  {zone.change > 0 ? (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  ) : zone.change < 0 ? (
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  ) : null}
                  <span>{zone.change > 0 ? '+' : ''}{zone.change.toFixed(1)}%</span>
                </div>
              </div>
              
              {/* Density Bar */}
              <div className="mt-3">
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getRiskColor(zone.riskLevel)}`}
                    style={{ width: `${zone.density}%` }}
                  />
                </div>
              </div>
              
              {/* Mini Heatmap */}
              <div className="mt-3 grid grid-cols-8 gap-1">
                {generateHeatmap(zone.density)}
              </div>
            </div>
          ))}
        </div>

        {/* Right: Overview Map */}
        <div className="bg-gray-800/30 rounded-xl border border-gray-800/60 p-4">
          <div className="h-full flex flex-col">
            <h4 className="text-sm font-medium text-gray-200 mb-4">区域概览</h4>
            
            <div className="flex-1 relative">
              {/* Simplified Map Visualization */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-full max-w-sm aspect-[4/3]">
                  {/* Map Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-lg border border-gray-700/50">
                    {/* Grid Lines */}
                    <div className="absolute inset-0 opacity-20">
                      {[...Array(5)].map((_, i) => (
                        <div key={`h-${i}`} className="absolute w-full h-px bg-blue-500/30" style={{ top: `${(i + 1) * 20}%` }} />
                      ))}
                      {[...Array(5)].map((_, i) => (
                        <div key={`v-${i}`} className="absolute h-full w-px bg-blue-500/30" style={{ left: `${(i + 1) * 20}%` }} />
                      ))}
                    </div>
                    
                    {/* Zone Markers */}
                    {data.map((zone, index) => {
                      const positions = [
                        { left: '60%', top: '70%' },  // Hormuz
                        { left: '30%', top: '40%' },  // North Persian Gulf
                        { left: '75%', top: '60%' },  // Gulf of Oman
                        { left: '45%', top: '65%' },  // South Persian Gulf
                        { left: '55%', top: '55%' },  // Iran Port
                      ];
                      const pos = positions[index] || { left: '50%', top: '50%' };
                      
                      return (
                        <div
                          key={zone.id}
                          className="absolute transform -translate-x-1/2 -translate-y-1/2"
                          style={{ left: pos.left, top: pos.top }}
                        >
                          <div className={`w-4 h-4 rounded-full ${getRiskColor(zone.riskLevel)} animate-pulse-glow`} />
                          <div className="absolute top-5 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                            <span className="text-[10px] text-gray-400 bg-gray-900/80 px-1.5 py-0.5 rounded">
                              {zone.name}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Labels */}
                    <div className="absolute bottom-2 left-2 text-[10px] text-gray-500">
                      波斯湾
                    </div>
                    <div className="absolute top-2 right-2 text-[10px] text-gray-500">
                      阿曼湾
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Legend */}
            <div className="mt-4 flex items-center justify-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="text-gray-400">低风险</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                <span className="text-gray-400">中风险</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                <span className="text-gray-400">高风险</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
