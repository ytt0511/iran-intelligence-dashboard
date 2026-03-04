# 伊朗情报看板 - 代码架构说明

> Iran Intelligence Dashboard - Code Architecture Documentation

## 目录

- [1. 项目概述](#1-项目概述)
- [2. 技术栈](#2-技术栈)
- [3. 项目结构](#3-项目结构)
- [4. 核心架构设计](#4-核心架构设计)
- [5. 数据流设计](#5-数据流设计)
- [6. 模块详解](#6-模块详解)
- [7. Python后端分析](#7-python后端分析)
- [8. 样式系统](#8-样式系统)
- [9. 部署架构](#9-部署架构)

---

## 1. 项目概述

伊朗情报看板是一个专业的伊朗地缘政治风险监测系统，采用深色科技风格的实时数据看板。系统通过整合多源数据（Polymarket预测市场、新闻爬虫、金融市场数据、概率模型），提供全面的地缘政治风险分析。

### 核心功能

| 模块 | 功能描述 | 更新频率 |
|------|---------|----------|
| **实时事件区** | Polymarket预测市场数据 + 智能新闻分析 | 每小时 |
| **新闻小时报** | 多源新闻爬虫 + 风险等级评估 | 每15分钟 |
| **概率模型** | 希尔伯特变换相位分析 + 风险预测 | 每小时 |
| **敏感资产** | 油价/黄金/美元/航运指数实时行情 | 每5分钟 |

---

## 2. 技术栈

### 前端

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js 14.2.5                      │
│                    (App Router)                          │
├─────────────────────────────────────────────────────────────┤
│  React 18.3  │  TypeScript 5  │  Tailwind CSS 3.4    │
├─────────────────────────────────────────────────────────────┤
│              Recharts 2.12 (数据可视化)                  │
└─────────────────────────────────────────────────────────────┘
```

### 后端 (Python)

```
┌─────────────────────────────────────────────────────────────┐
│  numpy  │  pandas  │  scipy.signal (hilbert)          │
├─────────────────────────────────────────────────────────────┤
│              Hilbert Phase Analyzer                       │
│              (希尔伯特相位分析器)                         │
└─────────────────────────────────────────────────────────────┘
```

### 数据源

| 数据源 | 用途 | API/方式 |
|--------|------|----------|
| Polymarket | 预测市场数据 | 本地JSON文件 |
| Yahoo Finance | 资产价格数据 | REST API |
| Reuters/BBC/Al Jazeera | 新闻数据 | Web爬虫 |

---

## 3. 项目结构

```
iran-intelligence-dashboard/
│
├── app/                          # Next.js App Router 目录
│   ├── api/                      # API 路由
│   │   ├── polymarket-real/       # Polymarket实时数据
│   │   │   └── route.ts
│   │   ├── markets-real/          # 市场数据API
│   │   │   └── route.ts
│   │   ├── news-crawler/          # 新闻爬虫数据API
│   │   │   └── route.ts
│   │   ├── news/                 # 新闻备用API
│   │   ├── news-local/           # 本地新闻API
│   │   ├── news-gdelt/           # GDELT新闻API
│   │   ├── assets/              # 资产备用API
│   │   ├── shipping/            # 航运数据API
│   │   └── probability/         # 概率模型API
│   │
│   ├── components/               # React组件
│   │   ├── PolymarketPanel.tsx  # Polymarket面板
│   │   ├── NewsPanel.tsx        # 新闻面板
│   │   ├── ProbabilityPanel.tsx  # 概率模型面板
│   │   ├── AssetsPanel.tsx       # 资产面板
│   │   └── ShippingPanel.tsx     # 航运面板
│   │
│   ├── lib/
│   │   └── mockData.ts          # 模拟数据生成器
│   │
│   ├── types/
│   │   └── index.ts             # TypeScript类型定义
│   │
│   ├── globals.css              # 全局样式
│   ├── layout.tsx              # 根布局
│   └── page.tsx                # 主页面 (入口组件)
│
├── scripts/                     # Python爬虫脚本
│   ├── crawl_news.py           # 新闻爬虫主脚本
│   ├── crawl_news_real.py      # 实时新闻爬虫
│   └── crawl_news_hourly.py    # 小时新闻爬虫
│
├── data/                       # 数据文件目录
│   ├── news.json              # 新闻数据
│   ├── polymarket.json        # Polymarket数据
│   ├── assets.json           # 资产数据
│   └── phase_analysis.json    # 相位分析数据
│
├── public/                     # 静态资源
│   ├── data/                 # 公共数据文件
│   │   └── polymarket.json
│   └── shipping/             # 航运图片资源
│
├── hilbert_phase_analyzer.py   # 希尔伯特相位分析器
├── run_phase_analysis.py       # 相位分析运行脚本
│
├── package.json               # Node.js依赖
├── tsconfig.json             # TypeScript配置
├── tailwind.config.ts        # Tailwind配置
├── next.config.mjs          # Next.js配置
├── vercel.json              # Vercel部署配置
│
└── 文档文件
    ├── README.md              # 项目说明
    ├── ARCHITECTURE.md       # 本文档
    ├── CRON_CONFIG.md        # 定时任务配置
    ├── DEPLOY_OSS.md         # OSS部署说明
    ├── MANAGEMENT.md          # 管理说明
    ├── NEWS_SOURCES.md       # 新闻源配置
    ├── DATA_SOURCES.md       # 数据源说明
    └── REQUIREMENTS.md       # 需求文档
```

---

## 4. 核心架构设计

### 4.1 架构分层

```
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                     │
│  (React Components - PolymarketPanel, NewsPanel, ...)     │
├─────────────────────────────────────────────────────────────┤
│                    Application Layer                     │
│  (Page Component - Data Fetching, State Management)      │
├─────────────────────────────────────────────────────────────┤
│                     API Layer                          │
│  (Next.js API Routes - /api/polymarket-real, ...)       │
├─────────────────────────────────────────────────────────────┤
│                  Data Service Layer                      │
│  (External APIs - Polymarket, Yahoo Finance, ...)        │
├─────────────────────────────────────────────────────────────┤
│                   Data Storage Layer                     │
│  (JSON Files - data/news.json, data/polymarket.json)    │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 组件层次结构

```
page.tsx (主入口组件)
├── Header (导航栏)
│   ├── Logo & Title
│   ├── Section Navigation (全部/实时事件/新闻/概率模型/敏感资产)
│   └── Refresh Button
│
├── PolymarketPanel (实时事件区)
│   ├── News Intelligence Analysis (智能分析)
│   └── Event Cards List (事件卡片列表)
│
├── NewsPanel (新闻小时报)
│   ├── Hourly Summary (时段摘要)
│   └── News Timeline (新闻时间线)
│
├── ProbabilityPanel (概率模型)
│   ├── Probability Overview Tab (概率概览)
│   │   └── Gauge Cards (仪表盘卡片)
│   └── Phase Analysis Tab (相位分析)
│       ├── Phase Circle (相位圆图)
│       ├── Hilbert Info (分析信息)
│       └── Time Series Chart (时间序列图)
│
└── AssetsPanel (敏感资产)
    └── Asset Cards Grid (资产卡片网格)
        ├── Price Display
        ├── Change Indicator
        └── Mini Chart (迷你K线)
```

---

## 5. 数据流设计

### 5.1 数据获取流程

```
┌─────────────┐
│   用户访问   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────┐
│         page.tsx 初始化            │
│  • 调用 fetchPolymarketData()     │
│  • 调用 fetchMarketData()         │
│  • 调用 fetchNewsData()          │
│  • 调用 generateProbabilityData() │
└──────┬────────────────────────────┘
       │
       ├─────────────────────────────────────────┐
       │                                     │
       ▼                                     ▼
┌─────────────────┐                 ┌─────────────────┐
│ /api/          │                 │ /api/          │
│ polymarket-    │                 │ markets-       │
│ real           │                 │ real           │
└───────┬───────┘                 └───────┬───────┘
        │                                  │
        ▼                                  ▼
┌─────────────────┐                 ┌─────────────────┐
│ 读取本地       │                 │ 调用 Yahoo    │
│ polymarket     │                 │ Finance API    │
│ .json 文件    │                 └───────┬───────┘
└───────┬───────┘                         │
        │                          ▼        │
        │                   ┌──────────────┴──┐
        │                   │   缓存/降级     │
        │                   │   机制          │
        │                   └───────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│      统一数据格式化               │
│  (ApiResponse<T> 标准响应)      │
└───────┬───────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│      组件渲染                     │
│  (Props 传递 + 状态更新)        │
└─────────────────────────────────────┘
```

### 5.2 自动刷新机制

```typescript
// page.tsx 中的自动刷新配置
├── 全量刷新: setInterval(fetchData, 60 * 60 * 1000)  // 每小时
├── 资产刷新: setInterval(assetRefresh, 5 * 60 * 1000)  // 每5分钟
└── 新闻刷新: setInterval(newsRefresh, 15 * 60 * 1000)  // 每15分钟
```

### 5.3 数据缓存策略

| API路由 | 缓存时长 | 缓存位置 | 降级策略 |
|---------|---------|---------|---------|
| `/api/markets-real` | 2分钟 | 内存变量 | 返回备用数据 |
| `/api/news-crawler` | 15分钟 | 内存变量 | 返回本地数据文件 |
| `/api/polymarket-real` | 无 | 读取文件 | 返回空数组 |

---

## 6. 模块详解

### 6.1 类型系统 (`app/types/index.ts`)

```typescript
// 核心数据结构
PolymarketEvent      // Polymarket预测市场事件
ShippingZone        // 航运区域数据
NewsItem           // 新闻条目
NewsHourlySummary   // 小时新闻摘要
ProbabilityMetric  // 概率指标
TriggerFactor      // 触发因子
AssetPrice         // 资产价格
ApiResponse<T>    // 统一API响应格式
```

### 6.2 主页面组件 (`app/page.tsx`)

**核心功能:**
- 数据获取与聚合
- 自动刷新调度
- 导航筛选控制
- 错误处理与降级

**关键状态:**
```typescript
{
  data: DashboardData | null      // 完整看板数据
  loading: boolean                // 加载状态
  lastRefresh: string             // 最后刷新时间
  activeSection: string          // 当前激活板块
  probabilityTab: 'phase' | 'overview'  // 概率面板Tab
  error: string | null          // 错误信息
}
```

### 6.3 API路由设计

#### `/api/polymarket-real/route.ts`

```
功能: 读取本地 Polymarket 数据文件
输入: GET请求
输出: ApiResponse<PolymarketEvent[]>
数据源: data/polymarket.json
```

#### `/api/markets-real/route.ts`

```
功能: 获取实时金融市场数据
输入: GET请求
输出: ApiResponse<AssetPrice[]>
数据源: Yahoo Finance API
缓存: 2分钟内存缓存
降级: 返回备用模拟数据
```

#### `/api/news-crawler/route.ts`

```
功能: 获取爬虫新闻数据
输入: GET请求
输出: ApiResponse<{items, summary}>
数据源: data/news.json (本地文件)
缓存: 15分钟内存缓存
降级: 返回备用新闻数据
```

### 6.4 组件设计模式

#### PolymarketPanel

```
布局: 双列布局
├── 左侧: 新闻智能分析
│   ├── 风险等级评分
│   ├── 关键事件列表
│   ├── 事件预测
│   └── 形势研判
└── 右侧: 事件卡片列表
    ├── 概率显示
    ├── 1h/24h变化
    └── 交易量
```

#### NewsPanel

```
布局: 垂直滚动
├── 时段摘要卡片
│   ├── 风险等级标识
│   ├── 摘要文本
│   └── 关键事件标签
└── 新闻时间线
    ├── 重要性指示器
    ├── 分类标签
    ├── 标题/摘要
    └── 标签云
```

#### ProbabilityPanel

```
双Tab切换设计
├── 概率概览Tab
│   └── 仪表盘卡片网格
│       ├── Gauge图表
│       ├── 24h变化
│       └── 触发因子
└── 相位分析Tab
    ├── 相位圆图
    ├── Hilbert分析信息
    ├── 时间序列图表
    └── 方法说明
```

#### AssetsPanel

```
网格布局
└── 资产卡片
    ├── 价格显示
    ├── 涨跌幅指示
    └── 迷你K线图
```

---

## 7. Python后端分析

### 7.1 希尔伯特相位分析器 (`hilbert_phase_analyzer.py`)

```
HilbertPhaseAnalyzer 类
├── load_data()           # 加载时间序列数据
├── detrend()            # 去趋势处理
├── apply_hilbert()       # 应用希尔伯特变换
│   ├── 计算解析信号: z(t) = x(t) + i·H(x(t))
│   ├── 提取振幅: A(t) = |z(t)|
│   └── 提取相位: φ(t) = arg(z(t))
├── calculate_phase_velocity()  # 计算相位速度
├── predict_next_peak()    # 预测下一个峰值
├── get_cycle_status()    # 获取周期状态
└── analyze()            # 完整分析流程
```

### 7.2 新闻爬虫脚本 (`scripts/crawl_news.py`)

```
功能模块:
├── 新闻源配置 (NEWS_SOURCES)
│   ├── Reuters
│   ├── Al Jazeera
│   ├── BBC
│   ├── The Guardian
│   ├── Al Arabiya
│   ├── Jerusalem Post
│   └── Times of Israel
│
├── 关键词过滤 (KEYWORDS)
├── 分类映射 (CATEGORY_MAP)
├── 重要性判断 (classify_importance)
├── 标签提取 (extract_tags)
└── 数据保存 (save_news_data)
```

---

## 8. 样式系统

### 8.1 Tailwind配置

```typescript
tailwind.config.ts
├── content: ["./app/**/*.{ts,tsx}"]
├── theme: {
│   extend: {
│     colors: 自定义颜色扩展
│     fontFamily: 字体配置
│     animation: 自定义动画
│   }
│ }
└── plugins: []
```

### 8.2 自定义样式 (`globals.css`)

**动画系统:**
- `fadeIn`: 淡入动画
- `fadeInUp`: 向上淡入
- `slideIn`: 滑入
- `pulse-soft`: 柔和脉冲
- `shimmer`: 扫光效果
- `float`: 悬浮效果
- `pulse-glow`: 脉冲发光
- `scanline`: 扫描线效果

**颜色系统:**
```css
--background: #0a0a0f      /* 主背景 */
--foreground: #e5e5e5      /* 主文字 */
--accent: #3b82f6           /* 强调色 */
--muted: #6b7280            /* 次要文字 */
--border: #1f2937           /* 边框色 */
--card: #111827             /* 卡片背景 */
```

**渐变主题:**
- `.intel-gradient`: 情报主题渐变
- `.risk-gradient`: 风险主题渐变
- `.alert-gradient`: 警报主题渐变

---

## 9. 部署架构

### 9.1 静态导出配置

```javascript
// next.config.mjs
{
  output: 'export',        // 静态导出模式
  distDir: 'out',        // 输出目录
  images: { unoptimized: true }
}
```

### 9.2 部署流程

```
┌─────────────┐
│  数据更新   │ (每小时)
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ Python爬虫执行  │ (scripts/crawl_news.py)
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ 数据文件更新    │ (data/news.json)
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Next.js 构建   │ (npm run build)
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│ Vercel部署    │ (npx vercel deploy --prod)
└─────────────────┘
```

### 9.3 定时任务配置 (CRON)

| 任务 | 表达式 | 说明 |
|------|--------|------|
| 新闻爬虫 | `0 * * * *` | 每小时执行 |
| 数据刷新 | `*/15 * * * *` | 每15分钟检查 |
| 自动部署 | `5 * * * *` | 数据更新后部署 |

---

## 10. 扩展指南

### 10.1 添加新的数据源

1. 创建新的API路由: `app/api/new-source/route.ts`
2. 定义数据类型: 在 `app/types/index.ts` 中添加
3. 创建对应组件: `app/components/NewSourcePanel.tsx`
4. 在 `page.tsx` 中集成

### 10.2 添加新的新闻源

编辑 `scripts/crawl_news.py`:

```python
NEWS_SOURCES.append({
    "name": "新源名称",
    "url": "https://...",
    "enabled": True
})
```

### 10.3 修改样式主题

编辑 `app/globals.css` 中的CSS变量:
```css
:root {
  --background: #新背景色;
  --accent: #新强调色;
}
```

---

## 11. 安全与隐私

- API密钥和Token存储在环境变量中
- 用户数据仅存储在本地
- 外部API请求通过服务端代理
- 无用户追踪或数据收集

---

## 12. 性能优化

| 优化点 | 实现方式 |
|--------|---------|
| 代码分割 | Next.js 自动代码分割 |
| 图片优化 | `unoptimized: true` (静态托管) |
| API缓存 | 内存缓存 + 时间控制 |
| 数据预取 | React `useEffect` 初始化时获取 |
| 懒加载 | 按需加载组件 |

---

## 13. 维护者

- 版本: 0.1.0
- 最后更新: 2026-03-04
- 许可证: MIT

---

*文档生成时间: 2026-03-04*
