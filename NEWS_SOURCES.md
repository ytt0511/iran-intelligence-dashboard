# 伊朗情报看板 - 新闻数据源配置

## 已配置新闻源

### 主流国际媒体
| 媒体 | RSS/API | 状态 |
|------|---------|------|
| Reuters | https://www.reuters.com/world/middle-east/ | 待接入 |
| Al Jazeera | https://www.aljazeera.com/xml/rss/all.xml | 待接入 |
| BBC | https://feeds.bbci.co.uk/news/world/middle_east/rss.xml | 待接入 |
| Associated Press | https://apnews.com/hub/middle-east | 待接入 |
| Bloomberg | 需 API Key | 待接入 |
| Financial Times | 需订阅 | 待接入 |
| The Guardian | https://www.theguardian.com/world/middleeast/rss | 待接入 |
| NYT | https://rss.nytimes.com/services/xml/rss/nyt/MiddleEast.xml | 待接入 |
| Washington Post | 需 API | 待接入 |
| CNN | http://rss.cnn.com/rss/edition_world.rss | 待接入 |

### 中东专业媒体
| 媒体 | RSS/URL | 状态 |
|------|---------|------|
| Al Arabiya | https://english.alarabiya.net/rss | 待接入 |
| Middle East Eye | https://www.middleeasteye.net/rss | 待接入 |
| Jerusalem Post | https://www.jpost.com/rss | 待接入 |
| Haaretz | https://www.haaretz.com/rss | 待接入 |
| Iran International | https://www.iranintl.com/rss | 待接入 |
| Times of Israel | https://www.timesofisrael.com/rss | 待接入 |

### 智库/研究机构
| 机构 | URL | 状态 |
|------|-----|------|
| ISW | https://www.understandingwar.org/publications | 待接入 |
| Crisis Group | https://www.crisisgroup.org/middle-east-north-gulf | 待接入 |
| CSIS | https://www.csis.org/programs/middle-east-program | 待接入 |
| Brookings | https://www.brookings.edu/topic/iran/ | 待接入 |
| Atlantic Council | https://www.atlanticcouncil.org/region/middle-east/ | 待接入 |
| Chatham House | https://www.chathamhouse.org/research/middle-east | 待接入 |
| IISS | https://www.iiss.org/blogs/military-balance | 待接入 |

## 监控关键词

### 核心关键词
- Iran war update
- US-Israel strikes on Iran
- Strait of Hormuz closure
- Iranian retaliatory attacks
- Iran air defense
- Revolutionary Guard movements
- Iran regional proxies
- Middle East Gulf tensions

### 军事/安全
- Iran missile launches
- US military operations Iran
- Israel Iran air strikes
- Drone attacks Gulf Iran
- Iran nuclear facilities
- Energy infrastructure attacks Iran

### 政治/经济
- Iran sanctions impact
- Iran economic crisis
- Iran internal protests
- Iran leadership succession
- GCC diplomatic response Iran
- Iran internet blackout

### 人道/影响
- Iranian human rights
- Casualties Iran conflict
- Emergency travel advisories Iran
- Iran protest crackdown
- Iran foreign relations

## 技术实现方案

### 方案1: RSS 聚合（推荐）
使用 RSS 聚合器抓取上述媒体的 RSS feed，筛选含关键词的内容。

### 方案2: NewsAPI
使用 NewsAPI (newsapi.org) 聚合多源新闻，免费版 100 次/天。

### 方案3: GDELT
使用 GDELT 全球事件数据库，可获取结构化新闻事件。

### 方案4: 搜索 API
使用 Brave Search API 或 Google Custom Search 实时搜索关键词。

## 当前状态
当前使用模拟数据展示，真实数据接入需要：
1. 申请 NewsAPI Key 或配置 RSS 抓取
2. 设置定时任务更新数据
3. 实现关键词过滤和分类

## 下一步
建议先申请 NewsAPI (免费) 快速接入真实新闻数据。
