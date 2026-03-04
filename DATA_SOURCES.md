# 伊朗情报看板 - 真实数据源集成

## 新增功能

### 1. Polymarket 真实数据 API
- **路由**: `/api/polymarket-real`
- **数据源**: Polymarket GraphQL API (`https://gamma-api.polymarket.com/query`)
- **获取内容**:
  - 伊朗相关预测市场 (iran, israel, middle east, oil, gaza, hamas, hezbollah, houthis, yemen, strait, nuclear)
  - 市场概率、交易量、流动性
  - 24小时变化率 (模拟计算)
- **缓存**: 5分钟

### 2. 金融市场真实数据 API
- **路由**: `/api/markets-real`
- **数据源**: Yahoo Finance API (`https://query1.finance.yahoo.com/v8/finance/chart/`)
- **获取资产**:
  - WTI原油 (CL=F)
  - 布伦特原油 (BZ=F)
  - 黄金 (GC=F)
  - 美元指数 (DX-Y.NYB)
  - 标普500 (^GSPC)
  - 白银期货 (SI=F)
- **缓存**: 2分钟
- **降级策略**: API失败时自动使用模拟数据

### 3. 新闻爬虫 API (NEW)
- **路由**: `/api/news-crawler`
- **数据源**: 直接爬取以下新闻网站
  - Reuters (https://www.reuters.com/world/middle-east/)
  - Al Jazeera (https://www.aljazeera.com/middle-east/)
  - BBC (https://www.bbc.com/news/world/middle_east)
  - The Guardian (https://www.theguardian.com/world/middleeast)
  - Al Arabiya (https://english.alarabiya.net/News/middle-east)
  - Jerusalem Post (https://www.jpost.com/international)
  - Times of Israel (https://www.timesofisrael.com/)
  - Iran International (https://www.iranintl.com/)
  - Middle East Eye (https://www.middleeasteye.net/)
  - Haaretz (https://www.haaretz.com/middle-east-news)
- **关键词过滤**:
  - Iran, Iranian, Tehran
  - Israel, Israeli
  - Middle East, Gulf
  - Hormuz, Strait
  - sanctions, nuclear
  - missile, drone, attack
- **缓存**: 15分钟 (避免频繁爬取被封IP)
- **请求间隔**: 每个源之间1秒延迟

## 前端更新

### page.tsx
- 集成真实数据API调用
- 添加错误处理和加载状态
- 自动刷新机制:
  - 完整数据: 每小时
  - 资产数据: 每5分钟
  - 新闻数据: 每15分钟 (爬虫限制)

### PolymarketPanel.tsx
- 支持空数据状态显示
- 优化真实数据展示

### AssetsPanel.tsx
- 支持空数据状态显示
- 优化价格格式化

### NewsPanel.tsx
- 支持空数据状态显示
- 显示爬虫数据源
- 优化新闻时间线展示

## 类型更新

### types/index.ts
ApiResponse 接口新增字段:
- `cached?: boolean` - 是否使用缓存数据
- `warning?: string` - 警告信息
- `source?: string` - 数据来源

## 使用说明

1. 启动开发服务器:
```bash
npm run dev
```

2. 访问看板:
```
http://localhost:3000
```

3. 测试API:
```bash
# Polymarket数据
curl http://localhost:3000/api/polymarket-real

# 市场数据
curl http://localhost:3000/api/markets-real

# 新闻爬虫数据
curl http://localhost:3000/api/news-crawler
```

## 注意事项

1. **API限制**: 
   - Yahoo Finance 可能有请求频率限制
   - 新闻爬虫需要控制频率避免被封IP (已设置15分钟缓存和1秒间隔)

2. **数据准确性**: 
   - Polymarket数据为实时数据，变化率可能为模拟值
   - 新闻爬虫依赖HTML结构，如果网站改版可能需要更新解析器

3. **缓存机制**: 
   - Polymarket: 5分钟
   - 市场数据: 2分钟
   - 新闻爬虫: 15分钟

4. **错误处理**: 
   - API失败时会自动降级到缓存数据或模拟数据
   - 爬虫失败时也会使用备用模拟数据

## 部署

构建静态导出:
```bash
npm run build
```

输出目录: `out/`

## 文件结构

```
app/
├── api/
│   ├── polymarket-real/
│   │   └── route.ts      # Polymarket真实数据API
│   ├── markets-real/
│   │   └── route.ts      # 金融市场真实数据API
│   ├── news-crawler/     # 新闻爬虫API (NEW)
│   │   └── route.ts
│   └── news-real/        # GDELT新闻API (备用)
│       └── route.ts
├── components/
│   ├── PolymarketPanel.tsx
│   ├── AssetsPanel.tsx
│   └── NewsPanel.tsx
├── lib/
│   └── mockData.ts       # 模拟数据(降级用)
├── types/
│   └── index.ts          # 类型定义
└── page.tsx              # 主页面
```

## 爬虫实现细节

### 解析器
- **Reuters**: 专用正则解析器
- **Al Jazeera**: 专用正则解析器
- **BBC**: 专用正则解析器
- **Guardian**: 专用正则解析器
- **其他**: 通用HTML解析器

### 关键词匹配
爬虫会筛选包含以下关键词的新闻:
- iran, iranian, tehran
- israel, israeli, gaza, hamas, hezbollah
- middle east, gulf, arab
- hormuz, strait
- sanction, embargo
- nuclear, uranium
- missile, drone, rocket, attack, strike, war
- military, revolutionary guard, irgc

### 重要性判断
- **Critical**: war, attack, strike, invasion, killed, death, destroyed, nuclear weapon
- **High**: sanction, missile, drone, retaliation, escalation, tension, conflict, military
- **Medium**: 其他
