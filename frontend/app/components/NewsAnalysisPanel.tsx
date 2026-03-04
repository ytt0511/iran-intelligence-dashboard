'use client';

interface NewsAnalysisPanelProps {
  lastUpdate: string;
}

// 模拟新闻分析数据
const generateNewsAnalysis = () => {
  return {
    summary: "过去一小时监测到8条关键动态，美伊冲突持续升级。",
    keyEvents: [
      "伊朗福尔多核设施浓缩铀丰度达83.7%，逼近武器级",
      "霍尔木兹海峡军事演习升级，美军第五舰队提升警戒",
      "美国众议院通过新一轮对伊制裁法案",
      "以色列防长公开威胁预防性打击"
    ],
    riskAssessment: {
      level: "极高",
      score: 9.2,
      trend: "上升"
    },
    predictions: [
      { event: "军事冲突爆发", probability: 78, timeframe: "72小时内" },
      { event: "霍尔木兹海峡关闭", probability: 45, timeframe: "本周内" },
      { event: "核设施遭袭", probability: 62, timeframe: "48小时内" }
    ],
    analysis: "基于过去一小时新闻数据，美伊冲突进入全面升级阶段。伊朗核进展加速，以色列威胁加剧，美国制裁加码，三方博弈进入高危窗口期。"
  };
};

export default function NewsAnalysisPanel({ lastUpdate }: NewsAnalysisPanelProps) {
  const newsAnalysis = generateNewsAnalysis();

  const getRiskColor = (score: number) => {
    if (score >= 8) return 'text-red-400';
    if (score >= 6) return 'text-orange-400';
    if (score >= 4) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getRiskBgColor = (score: number) => {
    if (score >= 8) return 'bg-red-400/20 border-red-400/30';
    if (score >= 6) return 'bg-orange-400/20 border-orange-400/30';
    if (score >= 4) return 'bg-yellow-400/20 border-yellow-400/30';
    return 'bg-green-400/20 border-green-400/30';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-100">实时新闻智能分析</h3>
            <p className="text-xs text-gray-500">过去一小时形势研判</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>更新于 {new Date(lastUpdate).toLocaleTimeString('zh-CN')}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-gray-800/30 rounded-xl border border-gray-800/60 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-100">智能分析</h4>
              <p className="text-[10px] text-gray-500">AI 驱动的风险评估</p>
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${getRiskBgColor(newsAnalysis.riskAssessment.score)}`}>
            <span className={getRiskColor(newsAnalysis.riskAssessment.score)}>
              风险等级: {newsAnalysis.riskAssessment.level} ({newsAnalysis.riskAssessment.score}/10)
            </span>
          </div>
        </div>

        {/* Summary */}
        <div className="mb-5 p-4 rounded-lg bg-gray-700/30 border border-gray-600/30">
          <p className="text-sm text-gray-300 leading-relaxed">{newsAnalysis.summary}</p>
        </div>

        {/* Key Events */}
        <div className="mb-5">
          <h5 className="text-xs font-medium text-gray-400 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            关键事件
          </h5>
          <div className="space-y-2">
            {newsAnalysis.keyEvents.map((event, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 flex-shrink-0"></span>
                <span className="text-gray-300">{event}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Predictions */}
        <div className="mb-5">
          <h5 className="text-xs font-medium text-gray-400 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            事件预测
          </h5>
          <div className="space-y-2">
            {newsAnalysis.predictions.map((pred, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-gray-700/20 border border-gray-600/20">
                <span className="text-sm text-gray-300">{pred.event}</span>
                <div className="flex items-center gap-3">
                  <span className={`text-sm font-medium ${
                    pred.probability >= 70 ? 'text-red-400' :
                    pred.probability >= 50 ? 'text-orange-400' : 'text-yellow-400'
                  }`}>
                    {pred.probability}%
                  </span>
                  <span className="text-xs text-gray-500">{pred.timeframe}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Analysis Text */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
          <h5 className="text-xs font-medium text-blue-400 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            形势研判
          </h5>
          <p className="text-sm text-gray-300 leading-relaxed">{newsAnalysis.analysis}</p>
        </div>
      </div>
    </div>
  );
}
