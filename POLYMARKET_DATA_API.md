# Polymarket CSV 数据处理完整指南

## 概述

该系统用于处理 `/data/polymarket_data` 目录下的 CSV 文件，将其转换为统一的 JSON 格式，方便前端使用。

## 数据处理流程

```
CSV 文件 (10个)
    ↓
处理脚本 (process-polymarket-csv.js)
    ↓
JSON 文件 (polymarket_data.json)
    ↓
API 路由 (/api/polymarket-data)
    ↓
前端组件
```

## 文件结构

```
iran-intelligence-dashboard/
├── data/
│   ├── polymarket_data/              # CSV 源文件目录
│   │   ├── fed-decision-in-march-885.csv
│   │   ├── usisrael-strikes-iran-on.csv
│   │   └── ... (共10个文件)
│   └── polymarket_data.json          # 生成的 JSON 文件 (18MB)
├── scripts/
│   └── process-polymarket-csv.js     # CSV 处理脚本
├── app/
│   ├── api/
│   │   └── polymarket-data/
│   │       └── route.ts              # API 路由（读取 JSON）
│   └── types/
│       └── polymarket-data.ts        # TypeScript 类型定义
└── package.json                       # 包含构建脚本
```

## CSV 文件格式

### 文件列表
| 文件名 | 指标数量 | 数据点数量 | 文件大小 |
|--------|----------|------------|----------|
| fed-decision-in-march-885.csv | 4 | 22,292 | 260KB |
| us-iran-nuclear-deal-before-2027.csv | 1 | 5,250 | 136KB |
| us-seizes-an-iran-linked-oil-tanker-by-march-7.csv | 1 | 2,071 | 53KB |
| us-x-iran-ceasefire-by.csv | 7 | 12,747 | 100KB |
| **usisrael-strikes-iran-on.csv** | 9 | 29,904 | 124KB |
| what-will-the-usisrael-target-in-iran-by-march-31.csv | 5 | 8,645 | 85KB |
| who-will-be-next-supreme-leader-of-iran-515.csv | 40 | 72,160 | 479KB |
| will-crude-oil-cl-hit-by-end-of-march.csv | 14 | 25,382 | 180KB |
| will-iran-close-the-strait-of-hormuz-by-2027.csv | 3 | 19,161 | 239KB |
| will-the-iranian-regime-fall-by-june-30.csv | 1 | 5,329 | 139KB |

### CSV 格式示例
```csv
datetime,"Will US or Israel strike Iran on March 3, 2026","Will US or Israel strike Iran on March 5, 2026"
2026-02-28 22:10:00,0.655,0.57
2026-02-28 22:11:00,0.655,0.57
2026-02-28 22:20:00,0.665,0.57
```

**说明**：
- 第一列：`datetime` - 时间戳（北京时间，格式：YYYY-MM-DD HH:MM:SS）
- 后续列：各个预测市场指标的概率值（0-1 之间的小数）
- 空值：表示该时间点无数据

## 使用方法

### 1. 处理 CSV 文件

#### 开发环境
```bash
# 直接运行脚本
npm run process-csv

# 或使用 node
node scripts/process-polymarket-csv.js
```

#### 构建时自动处理
```bash
# 构建时会自动运行处理脚本
npm run build
```

### 2. API 调用

#### 端点
```
GET /api/polymarket-data
```

#### 响应格式
```json
{
  "success": true,
  "meta": {
    "totalFiles": 10,
    "totalIndicators": 85,
    "totalDataPoints": 202941,
    "generatedAt": "2026-03-04T02:58:21.392Z",
    "version": "1.0.0"
  },
  "data": {
    "usisrael-strikes-iran-on": {
      "Will US or Israel strike Iran on March 3, 2026": [
        {
          "datetime": "2026-02-28 22:10:00",
          "value": 0.655
        },
        {
          "datetime": "2026-02-28 22:11:00",
          "value": 0.655
        }
      ],
      "Will US or Israel strike Iran on March 5, 2026": [
        {
          "datetime": "2026-02-28 22:10:00",
          "value": 0.57
        }
      ]
    },
    "will-iran-close-the-strait-of-hormuz-by-2027": {
      ...
    }
  }
}
```

#### 错误响应
```json
{
  "success": false,
  "error": "Data file not found. Please run: node scripts/process-polymarket-csv.js",
  "data": null
}
```

## TypeScript 类型定义

### 导入类型
```typescript
import {
  PolymarketDataPoint,
  PolymarketIndicatorData,
  PolymarketJsonData,
  PolymarketDataMeta,
  PolymarketDataApiResponse,
  transformToChartData,
  calculateIndicatorStats
} from '@/app/types/polymarket-data';
```

### 核心类型

#### PolymarketDataPoint
```typescript
interface PolymarketDataPoint {
  datetime: string;    // 时间戳
  value: number | null; // 概率值（0-1）
}
```

#### PolymarketIndicatorData
```typescript
interface PolymarketIndicatorData {
  [indicatorName: string]: PolymarketDataPoint[];
}
```

#### PolymarketJsonData
```typescript
interface PolymarketJsonData {
  [fileName: string]: PolymarketIndicatorData;
}
```

#### PolymarketDataMeta
```typescript
interface PolymarketDataMeta {
  totalFiles: number;
  totalIndicators: number;
  totalDataPoints: number;
  generatedAt: string;
  version: string;
}
```

#### PolymarketDataApiResponse
```typescript
interface PolymarketDataApiResponse {
  success: boolean;
  meta: PolymarketDataMeta;
  data: PolymarketJsonData;
  error?: string;
}
```

## 使用示例

### 1. 基础数据获取
```typescript
'use client';

import { useEffect, useState } from 'react';
import type { PolymarketDataApiResponse } from '@/app/types/polymarket-data';

export default function MyComponent() {
  const [data, setData] = useState<PolymarketDataApiResponse['data'] | null>(null);
  const [meta, setMeta] = useState<PolymarketDataApiResponse['meta'] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/polymarket-data');
        const result: PolymarketDataApiResponse = await response.json();

        if (result.success) {
          setData(result.data);
          setMeta(result.meta);
        } else {
          console.error('Error:', result.error);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>No data available</div>;

  return (
    <div>
      <h3>Polymarket Data</h3>
      <p>Files: {meta?.totalFiles}</p>
      <p>Indicators: {meta?.totalIndicators}</p>
      <p>Data Points: {meta?.totalDataPoints}</p>
      {/* 渲染数据 */}
    </div>
  );
}
```

### 2. 获取特定文件和指标的数据
```typescript
const fileName = 'usisrael-strikes-iran-on';
const fileData = data[fileName];

// 获取该文件下所有指标名称
const indicatorNames = Object.keys(fileData);
console.log('Indicators:', indicatorNames);
// ["Will US or Israel strike Iran on March 3, 2026", ...]

// 获取第一个指标的数据
const firstIndicator = fileData[indicatorNames[0]];
console.log('Data points:', firstIndicator.length);
```

### 3. 获取最新数据点
```typescript
const fileName = 'usisrael-strikes-iran-on';
const indicatorName = 'Will US or Israel strike Iran on March 3, 2026';
const indicatorData = data[fileName][indicatorName];

// 获取最新数据点
const latestDataPoint = indicatorData[indicatorData.length - 1];
console.log('Latest:', latestDataPoint);
// { datetime: "2026-02-28 23:40:00", value: 0.795 }

// 转换为百分比
const probability = (latestDataPoint.value! * 100).toFixed(1);
console.log(`当前概率: ${probability}%`);
```

### 4. 转换为图表数据格式
```typescript
import { transformToChartData } from '@/app/types/polymarket-data';

const fileName = 'usisrael-strikes-iran-on';
const fileData = data[fileName];
const indicatorNames = Object.keys(fileData);

// 转换为图表数据
const chartData = transformToChartData(fileData, indicatorNames);

// chartData 格式：
// [
//   { datetime: "2026-02-28 22:10:00", "指标1": 0.655, "指标2": 0.57 },
//   { datetime: "2026-02-28 22:11:00", "指标1": 0.655, "指标2": 0.57 },
//   ...
// ]
```

### 5. 计算统计信息
```typescript
import { calculateIndicatorStats } from '@/app/types/polymarket-data';

const fileName = 'usisrael-strikes-iran-on';
const indicatorName = 'Will US or Israel strike Iran on March 3, 2026';
const indicatorData = data[fileName][indicatorName];

const stats = calculateIndicatorStats(indicatorData);
stats.indicatorName = indicatorName;

console.log(stats);
// {
//   indicatorName: "Will US or Israel strike Iran on March 3, 2026",
//   dataPoints: 3323,
//   min: 0.525,
//   max: 0.81,
//   avg: 0.65,
//   latestValue: 0.795,
//   latestDatetime: "2026-02-28 23:40:00",
//   startDatetime: "2026-02-03 12:30:00",
//   endDatetime: "2026-02-28 23:40:00"
// }
```

### 6. 在 Recharts 中使用
```typescript
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { transformToChartData } from '@/app/types/polymarket-data';

function PolymarketChart({ data, fileName }) {
  const fileData = data[fileName];
  const indicatorNames = Object.keys(fileData);
  const chartData = transformToChartData(fileData, indicatorNames);

  // 生成颜色
  const colors = indicatorNames.map((_, i) => `hsl(${i * 40}, 70%, 50%)`);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={chartData}>
        <XAxis
          dataKey="datetime"
          tick={{ fill: '#9ca3af', fontSize: 10 }}
          axisLine={{ stroke: '#374151' }}
        />
        <YAxis
          tick={{ fill: '#9ca3af', fontSize: 10 }}
          axisLine={{ stroke: '#374151' }}
          domain={[0, 1]}
          tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
        />
        <Tooltip
          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
          labelStyle={{ color: '#9ca3af' }}
        />
        {indicatorNames.map((name, idx) => (
          <Line
            key={name}
            type="monotone"
            dataKey={name}
            stroke={colors[idx]}
            strokeWidth={2}
            dot={false}
            name={name.substring(0, 30) + '...'}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
```

## NPM 脚本

| 脚本 | 说明 |
|------|------|
| `npm run process-csv` | 手动运行 CSV 处理脚本 |
| `npm run build` | 构建（自动处理 CSV） |
| `npm run dev` | 启动开发服务器 |

## 数据更新流程

### 选项 1：手动更新
```bash
# 1. 将新的 CSV 文件放到 data/polymarket_data/ 目录

# 2. 重新处理 CSV
npm run process-csv

# 3. 重启开发服务器（如果正在运行）
```

### 选项 2：自动更新（构建时）
```bash
# CSV 文件修改后，重新构建即可
npm run build
```

## 注意事项

1. **文件大小**：生成的 JSON 文件约 18MB，包含 20 万+ 数据点
2. **时区**：所有时间都是北京时间（UTC+8）
3. **空值处理**：`value` 为 `null` 表示该时间点无数据
4. **性能**：
   - 首次 API 调用需要加载 18MB 文件（约 100-500ms）
   - 建议在客户端缓存数据
   - 生产环境可考虑使用 CDN 缓存
5. **构建时间**：处理 10 个 CSV 文件约需 50-100ms

## 故障排查

### 问题：API 返回 404
**原因**：JSON 文件不存在
**解决**：运行 `npm run process-csv`

### 问题：数据不完整
**原因**：CSV 文件格式不正确
**解决**：检查 CSV 文件是否符合格式要求

### 问题：内存不足
**原因**：JSON 文件过大
**解决**：
- 考虑按需加载（只加载需要的文件）
- 使用分页或时间范围过滤
- 增加服务器内存

## 文件清单

| 文件路径 | 说明 |
|---------|------|
| `scripts/process-polymarket-csv.js` | CSV 处理脚本 |
| `app/api/polymarket-data/route.ts` | API 路由 |
| `app/types/polymarket-data.ts` | TypeScript 类型定义 |
| `data/polymarket_data/*.csv` | CSV 源文件（10个） |
| `data/polymarket_data.json` | 生成的 JSON 文件 |
| `package.json` | 包含构建脚本 |

## 数据统计

| 指标 | 数值 |
|------|------|
| CSV 文件数 | 10 |
| 总指标数 | 85 |
| 总数据点 | 202,941 |
| JSON 文件大小 | ~18MB |

---

*文档版本: v2.0*
*最后更新: 2026-03-04*
