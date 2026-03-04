// Mock data generators for Iran Intelligence Dashboard

import { 
  PolymarketEvent, 
  ShippingZone, 
  NewsItem, 
  NewsHourlySummary,
  ProbabilityMetric, 
  TriggerFactor,
  AssetPrice 
} from '../types';

// Helper to generate random number in range
const random = (min: number, max: number) => Math.random() * (max - min) + min;
const randomInt = (min: number, max: number) => Math.floor(random(min, max));

// Helper to generate time series data
const generateTimeSeries = (points: number, baseValue: number, volatility: number) => {
  const data = [];
  let value = baseValue;
  const now = new Date();
  
  for (let i = points; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    value += random(-volatility, volatility);
    value = Math.max(0, Math.min(100, value));
    data.push({
      time: time.toISOString(),
      probability: Number(value.toFixed(1))
    });
  }
  return data;
};

// Helper to generate time series data for probability metrics
const generateProbabilityTimeSeries = (points: number, baseValue: number, volatility: number) => {
  const data = [];
  let value = baseValue;
  const now = new Date();
  
  for (let i = points; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    value += random(-volatility, volatility);
    value = Math.max(0, Math.min(100, value));
    data.push({
      time: time.toISOString(),
      value: Number(value.toFixed(1))
    });
  }
  return data;
};

// ============ Polymarket Mock Data ============
export const generatePolymarketData = (): PolymarketEvent[] => {
  const events: PolymarketEvent[] = [
    {
      id: '1',
      title: '美伊军事冲突在30天内爆发',
      probability: 23.5,
      change1h: 2.3,
      change24h: 5.7,
      volume: 2847500,
      category: 'conflict',
      trend: 'up',
      history: generateTimeSeries(24, 18, 3)
    },
    {
      id: '2',
      title: '霍尔木兹海峡航运中断',
      probability: 15.2,
      change1h: -1.2,
      change24h: 3.4,
      volume: 1923000,
      category: 'energy',
      trend: 'up',
      history: generateTimeSeries(24, 12, 2)
    },
    {
      id: '3',
      title: '伊朗恢复核设施浓缩活动',
      probability: 67.8,
      change1h: 0.5,
      change24h: -2.1,
      volume: 3562000,
      category: 'diplomacy',
      trend: 'stable',
      history: generateTimeSeries(24, 70, 4)
    },
    {
      id: '4',
      title: '美国对伊朗实施新制裁',
      probability: 78.4,
      change1h: 3.2,
      change24h: 8.9,
      volume: 4215000,
      category: 'sanction',
      trend: 'up',
      history: generateTimeSeries(24, 65, 3)
    },
    {
      id: '5',
      title: '以色列对伊朗设施发动打击',
      probability: 31.6,
      change1h: -0.8,
      change24h: 1.5,
      volume: 2156000,
      category: 'conflict',
      trend: 'stable',
      history: generateTimeSeries(24, 30, 5)
    },
    {
      id: '6',
      title: '伊朗石油出口降至100万桶/日以下',
      probability: 42.3,
      change1h: 1.8,
      change24h: 4.2,
      volume: 1789000,
      category: 'energy',
      trend: 'up',
      history: generateTimeSeries(24, 38, 3)
    }
  ];
  return events;
};

// ============ Shipping Mock Data ============
export const generateShippingData = (): ShippingZone[] => {
  return [
    {
      id: '1',
      name: '霍尔木兹海峡',
      nameEn: 'Strait of Hormuz',
      density: 87,
      change: 5.2,
      vessels: 156,
      riskLevel: 'high',
      coordinates: { lat: 26.5, lng: 56.3 }
    },
    {
      id: '2',
      name: '波斯湾北部',
      nameEn: 'Northern Persian Gulf',
      density: 64,
      change: -2.1,
      vessels: 89,
      riskLevel: 'medium',
      coordinates: { lat: 28.5, lng: 50.8 }
    },
    {
      id: '3',
      name: '阿曼湾',
      nameEn: 'Gulf of Oman',
      density: 72,
      change: 3.8,
      vessels: 124,
      riskLevel: 'medium',
      coordinates: { lat: 25.2, lng: 58.5 }
    },
    {
      id: '4',
      name: '波斯湾南部',
      nameEn: 'Southern Persian Gulf',
      density: 58,
      change: 1.2,
      vessels: 76,
      riskLevel: 'medium',
      coordinates: { lat: 25.8, lng: 52.5 }
    },
    {
      id: '5',
      name: '伊朗港口区',
      nameEn: 'Iran Port Zone',
      density: 43,
      change: -5.6,
      vessels: 52,
      riskLevel: 'high',
      coordinates: { lat: 27.1, lng: 56.3 }
    }
  ];
};

// ============ News Mock Data ============
export const generateNewsData = (): NewsItem[] => {
  const now = new Date();
  const news: NewsItem[] = [
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
    },
    {
      id: '6',
      title: '欧盟宣布对伊朗实施新制裁措施',
      summary: '欧盟外长会议通过决议，对伊朗实施新一轮制裁，涉及14名个人和4个实体。',
      source: 'EU Observer',
      timestamp: new Date(now.getTime() - 4 * 60 * 60 * 1000).toISOString(),
      category: 'sanction',
      importance: 'medium',
      tags: ['制裁', '欧盟', '外交']
    },
    {
      id: '7',
      title: '伊朗议会通过反美决议',
      summary: '伊朗议会以压倒性多数通过决议，谴责美国在中东地区的军事存在，并呼吁加强国防能力。',
      source: 'IRNA',
      timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000).toISOString(),
      category: 'domestic',
      importance: 'medium',
      tags: ['议会', '美国', '政治']
    },
    {
      id: '8',
      title: '沙特与伊朗外长通话讨论地区局势',
      summary: '沙特阿拉伯与伊朗外长进行电话会谈，双方就缓解地区紧张局势交换了意见。',
      source: 'Al Jazeera',
      timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString(),
      category: 'diplomacy',
      importance: 'low',
      tags: ['沙特', '外交', '地区局势']
    }
  ];
  return news;
};

export const generateHourlySummary = (): NewsHourlySummary => {
  return {
    hour: new Date().toISOString().slice(0, 13) + ':00',
    summary: '过去一小时，伊朗核问题持续升温。伊朗宣布提高铀浓缩纯度至60%，引发国际社会高度关注。美国方面表态强硬，不排除军事选项。地区军事活动增加，霍尔木兹海峡风险上升。',
    keyEvents: [
      '伊朗提高铀浓缩至60%纯度',
      '美国威胁采取军事行动',
      '霍尔木兹海峡军事演习开始',
      '以色列拦截伊朗无人机'
    ],
    riskLevel: 'high'
  };
};

// ============ Probability Model Mock Data ============
const generateTriggers = (metricId: string): TriggerFactor[] => {
  const triggersMap: Record<string, TriggerFactor[]> = {
    'conflict': [
      { id: 'c1', name: '核设施活动升级', impact: 'high', active: true, description: '伊朗将铀浓缩提升至60%' },
      { id: 'c2', name: '美军中东增兵', impact: 'high', active: true, description: '美国向波斯湾增派航母战斗群' },
      { id: 'c3', name: '以色列军事准备', impact: 'medium', active: true, description: '以色列空军进入高度戒备' },
      { id: 'c4', name: '外交谈判破裂', impact: 'high', active: false, description: '维也纳会谈暂停' }
    ],
    'oil': [
      { id: 'o1', name: '霍尔木兹封锁威胁', impact: 'high', active: true, description: '革命卫队展示封锁能力' },
      { id: 'o2', name: '全球库存下降', impact: 'medium', active: true, description: 'OECD原油库存降至5年低位' },
      { id: 'o3', name: '美元走弱', impact: 'low', active: false, description: '美元指数跌破102' }
    ],
    'shipping': [
      { id: 's1', name: '海峡军事演习', impact: 'high', active: true, description: '伊朗在霍尔木兹举行军演' },
      { id: 's2', name: '保险费率上涨', impact: 'medium', active: true, description: '战争险费率上涨300%' },
      { id: 's3', name: '商船改道', impact: 'medium', active: false, description: '部分船东选择绕行' }
    ],
    'sanction': [
      { id: 'sa1', name: '美国国会施压', impact: 'high', active: true, description: '两党议员要求更严厉制裁' },
      { id: 'sa2', name: '欧盟跟进', impact: 'medium', active: true, description: '欧盟通过新制裁决议' },
      { id: 'sa3', name: '中国反对', impact: 'medium', active: false, description: '中方呼吁通过对话解决' }
    ],
    'spread': [
      { id: 'sp1', name: '黎巴嫩真主党', impact: 'high', active: true, description: '真主党威胁报复以色列' },
      { id: 'sp2', name: '也门胡塞武装', impact: 'medium', active: true, description: '胡塞武装袭击沙特石油设施' },
      { id: 'sp3', name: '伊拉克什叶派民兵', impact: 'medium', active: false, description: '民兵组织威胁打击美军基地' }
    ]
  };
  return triggersMap[metricId] || [];
};

export const generateProbabilityData = (): ProbabilityMetric[] => {
  return [
    {
      id: 'conflict',
      name: '短期军事冲突',
      probability: 23.5,
      trend: 'up',
      change24h: 5.7,
      triggers: generateTriggers('conflict'),
      history: generateProbabilityTimeSeries(48, 18, 2)
    },
    {
      id: 'oil',
      name: '油价暴涨(>20%)',
      probability: 34.2,
      trend: 'up',
      change24h: 8.3,
      triggers: generateTriggers('oil'),
      history: generateProbabilityTimeSeries(48, 26, 3)
    },
    {
      id: 'shipping',
      name: '航运中断',
      probability: 15.2,
      trend: 'up',
      change24h: 3.4,
      triggers: generateTriggers('shipping'),
      history: generateProbabilityTimeSeries(48, 12, 1.5)
    },
    {
      id: 'sanction',
      name: '制裁升级',
      probability: 78.4,
      trend: 'up',
      change24h: 8.9,
      triggers: generateTriggers('sanction'),
      history: generateProbabilityTimeSeries(48, 65, 4)
    },
    {
      id: 'spread',
      name: '区域扩散',
      probability: 41.8,
      trend: 'stable',
      change24h: 2.1,
      triggers: generateTriggers('spread'),
      history: generateProbabilityTimeSeries(48, 40, 2.5)
    }
  ];
};

// ============ Asset Mock Data ============
const generateMiniChart = (basePrice: number, volatility: number, points: number = 20) => {
  const data = [];
  let price = basePrice;
  const now = new Date();
  
  for (let i = points; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 15 * 60 * 1000);
    price = price * (1 + random(-volatility, volatility));
    data.push({
      time: time.toISOString(),
      value: Number(price.toFixed(2))
    });
  }
  return data;
};

export const generateAssetData = (): AssetPrice[] => {
  return [
    {
      symbol: 'WTI',
      name: 'WTI原油',
      price: 78.45,
      change: 2.34,
      changePercent: 3.07,
      currency: 'USD',
      lastUpdate: new Date().toISOString(),
      miniChart: generateMiniChart(76.1, 0.005)
    },
    {
      symbol: 'BRENT',
      name: '布伦特原油',
      price: 82.67,
      change: 2.89,
      changePercent: 3.62,
      currency: 'USD',
      lastUpdate: new Date().toISOString(),
      miniChart: generateMiniChart(79.8, 0.006)
    },
    {
      symbol: 'GOLD',
      name: '黄金现货',
      price: 2145.30,
      change: 18.50,
      changePercent: 0.87,
      currency: 'USD',
      lastUpdate: new Date().toISOString(),
      miniChart: generateMiniChart(2126, 0.003)
    },
    {
      symbol: 'DXY',
      name: '美元指数',
      price: 103.85,
      change: -0.42,
      changePercent: -0.40,
      currency: 'USD',
      lastUpdate: new Date().toISOString(),
      miniChart: generateMiniChart(104.3, 0.002)
    },
    {
      symbol: 'SCFI',
      name: '上海出口集装箱运价指数',
      price: 2156.43,
      change: 45.21,
      changePercent: 2.14,
      currency: 'CNY',
      lastUpdate: new Date().toISOString(),
      miniChart: generateMiniChart(2111, 0.008)
    },
    {
      symbol: 'CL1',
      name: 'WTI期货主力',
      price: 78.92,
      change: 2.41,
      changePercent: 3.15,
      currency: 'USD',
      lastUpdate: new Date().toISOString(),
      miniChart: generateMiniChart(76.5, 0.005)
    }
  ];
};
