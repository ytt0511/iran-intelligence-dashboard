// Types for Iran Intelligence Dashboard

// ============ Polymarket Data ============
export interface PolymarketEvent {
  id: string;
  title: string;
  probability: number;
  change1h: number;
  change24h: number;
  volume: number;
  category: 'conflict' | 'sanction' | 'energy' | 'diplomacy';
  trend: 'up' | 'down' | 'stable';
  history: { time: string; probability: number }[];
}

// ============ Shipping Data ============
export interface ShippingZone {
  id: string;
  name: string;
  nameEn: string;
  density: number; // 0-100
  change: number;
  vessels: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  coordinates: { lat: number; lng: number };
}

export interface ShippingData {
  zones: ShippingZone[];
  lastUpdate: string;
  globalDensity: number;
}

// ============ News Data ============
export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url?: string;
  timestamp: string;
  category: 'domestic' | 'us' | 'israel' | 'energy' | 'military' | 'sanction' | 'diplomacy';
  importance: 'low' | 'medium' | 'high' | 'critical';
  tags: string[];
}

export interface NewsHourlySummary {
  hour: string;
  summary: string;
  keyEvents: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

// ============ Probability Model ============
export interface ProbabilityMetric {
  id: string;
  name: string;
  description?: string;
  probability: number; // 0-100
  trend: 'up' | 'down' | 'stable';
  change24h: number;
  category?: string;
  timeToEvent?: string;
  confidence?: number;
  factors?: string[];
  triggers?: TriggerFactor[];
  history?: { time: string; value: number }[];
  lastUpdate?: string;
}

export interface TriggerFactor {
  id: string;
  name: string;
  impact: 'low' | 'medium' | 'high';
  active: boolean;
  description: string;
}

// ============ Asset Data ============
export interface AssetPrice {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  lastUpdate: string;
  miniChart: { time: string; value: number }[];
}

export interface AssetData {
  assets: AssetPrice[];
  lastUpdate: string;
}

// ============ Dashboard State ============
export interface DashboardState {
  polymarket: PolymarketEvent[];
  shipping: ShippingData;
  news: {
    summary: NewsHourlySummary;
    items: NewsItem[];
  };
  probabilities: ProbabilityMetric[];
  assets: AssetData;
  lastRefresh: string;
}

// ============ API Response ============
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
  error?: string;
  cached?: boolean;
  warning?: string;
  source?: string;
}
