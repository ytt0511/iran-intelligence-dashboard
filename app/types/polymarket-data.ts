/**
 * Polymarket CSV 数据类型定义
 *
 * 数据结构说明：
 * - 第一层：文件名（去掉 .csv 扩展名）
 * - 第二层：指标名（CSV 第一行，除 datetime 外的列标题）
 * - 第三层：数据点数组，每个数据点包含 datetime 和 value
 */

/**
 * 单个数据点
 */
export interface PolymarketDataPoint {
  /** 时间戳（北京时间，格式：YYYY-MM-DD HH:MM:SS） */
  datetime: string;
  /** 概率值（0-1 之间的小数），可能为 null（无数据） */
  value: number | null;
}

/**
 * 单个指标的数据序列
 * key: 指标名称（例如："Will US or Israel strike Iran on March 3, 2026"）
 * value: 该指标的所有数据点（按时间顺序）
 */
export interface PolymarketIndicatorData {
  [indicatorName: string]: PolymarketDataPoint[];
}

/**
 * 完整的 Polymarket 数据集
 * key: 文件名（不含 .csv 扩展名）
 * value: 该文件包含的所有指标数据
 *
 * 示例：
 * {
 *   "usisrael-strikes-iran-on": {
 *     "Will US or Israel strike Iran on March 3, 2026": [
 *       { datetime: "2026-02-28 22:10:00", value: 0.655 },
 *       { datetime: "2026-02-28 22:11:00", value: 0.655 },
 *       ...
 *     ],
 *     "Will US or Israel strike Iran on March 5, 2026": [...]
 *   },
 *   "will-iran-close-the-strait-of-hormuz-by-2027": {...}
 * }
 */
export interface PolymarketJsonData {
  [fileName: string]: PolymarketIndicatorData;
}

/**
 * 元数据信息
 */
export interface PolymarketDataMeta {
  /** CSV 文件总数 */
  totalFiles: number;
  /** 指标总数 */
  totalIndicators: number;
  /** 数据点总数 */
  totalDataPoints: number;
  /** 生成时间（ISO 8601 格式） */
  generatedAt: string;
  /** 版本号 */
  version: string;
}

/**
 * API 响应类型（完整版）
 */
export interface PolymarketDataApiResponse {
  success: boolean;
  meta: PolymarketDataMeta;
  data: PolymarketJsonData;
  error?: string;
}

/**
 * 用于图表显示的简化数据格式
 */
export interface ChartDataPoint {
  datetime: string;
  [indicatorName: string]: number | null | string;
}

/**
 * 将 PolymarketIndicatorData 转换为图表数据格式
 * @param indicatorData 指标数据
 * @param indicatorNames 要包含的指标名称数组
 * @returns 图表数据数组
 */
export function transformToChartData(
  indicatorData: PolymarketIndicatorData,
  indicatorNames: string[]
): ChartDataPoint[] {
  // 找到最长的数据序列作为基准
  const maxLength = Math.max(
    ...indicatorNames.map(name => indicatorData[name]?.length || 0)
  );

  if (maxLength === 0) return [];

  const chartData: ChartDataPoint[] = [];

  for (let i = 0; i < maxLength; i++) {
    const point: ChartDataPoint = {
      datetime: indicatorData[indicatorNames[0]]?.[i]?.datetime || ''
    };

    indicatorNames.forEach(name => {
      point[name] = indicatorData[name]?.[i]?.value || null;
    });

    chartData.push(point);
  }

  return chartData;
}

/**
 * 获取指标的数据统计信息
 */
export interface IndicatorStats {
  indicatorName: string;
  dataPoints: number;
  min: number | null;
  max: number | null;
  avg: number | null;
  latestValue: number | null;
  latestDatetime: string | null;
  startDatetime: string | null;
  endDatetime: string | null;
}

/**
 * 计算单个指标的统计信息
 */
export function calculateIndicatorStats(
  data: PolymarketDataPoint[]
): IndicatorStats {
  const validData = data.filter(d => d.value !== null);

  if (validData.length === 0) {
    return {
      indicatorName: '',
      dataPoints: data.length,
      min: null,
      max: null,
      avg: null,
      latestValue: null,
      latestDatetime: null,
      startDatetime: null,
      endDatetime: null
    };
  }

  const values = validData.map(d => d.value as number);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
  const latest = validData[validData.length - 1];
  const first = validData[0];

  return {
    indicatorName: '',
    dataPoints: data.length,
    min,
    max,
    avg,
    latestValue: latest.value,
    latestDatetime: latest.datetime,
    startDatetime: first.datetime,
    endDatetime: latest.datetime
  };
}
