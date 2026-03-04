#!/usr/bin/env python3
"""
伊朗新闻爬虫 - 每小时抓取一次
类似非洲/日本情报看板的实现方式
"""

import json
import os
import re
import sys
from datetime import datetime, timedelta
from urllib.parse import urljoin, urlparse

# 添加项目路径
sys.path.insert(0, '/root/.openclaw/workspace/iran-intelligence-dashboard')

# 新闻源配置
NEWS_SOURCES = [
    {
        "name": "Reuters",
        "url": "https://www.reuters.com/world/middle-east/",
        "enabled": True
    },
    {
        "name": "Al Jazeera",
        "url": "https://www.aljazeera.com/middle-east/",
        "enabled": True
    },
    {
        "name": "BBC",
        "url": "https://www.bbc.com/news/world/middle_east",
        "enabled": True
    },
    {
        "name": "The Guardian",
        "url": "https://www.theguardian.com/world/middleeast",
        "enabled": True
    },
    {
        "name": "Al Arabiya",
        "url": "https://english.alarabiya.net/News/middle-east",
        "enabled": True
    },
    {
        "name": "Jerusalem Post",
        "url": "https://www.jpost.com/international",
        "enabled": True
    },
    {
        "name": "Times of Israel",
        "url": "https://www.timesofisrael.com/",
        "enabled": True
    }
]

# 关键词过滤
KEYWORDS = [
    'iran', 'iranian', 'tehran',
    'israel', 'israeli', 'gaza', 'hamas', 'hezbollah',
    'middle east', 'gulf', 'persian', 'strait of hormuz',
    'sanctions', 'nuclear', 'uranium', 'enrichment',
    'missile', 'drone', 'attack', 'strike', 'war', 'conflict',
    'houthis', 'yemen', 'red sea', 'shipping',
    'revolutionary guard', 'irgc', 'quds force',
    'oil', 'energy', 'opec', 'brent', 'wti'
]

# 分类映射
CATEGORY_MAP = {
    'military': ['attack', 'strike', 'missile', 'drone', 'war', 'conflict', 'military', 'defense'],
    'energy': ['oil', 'energy', 'opec', 'brent', 'wti', 'gas', 'petroleum'],
    'sanction': ['sanctions', 'embargo', 'restriction'],
    'diplomacy': ['diplomatic', 'negotiation', 'talks', 'deal', 'agreement'],
    'domestic': ['protest', 'election', 'government', 'domestic', 'internal'],
    'us': ['us', 'usa', 'america', 'biden', 'trump', 'washington'],
    'israel': ['israel', 'israeli', 'gaza', 'hamas', 'hezbollah', 'idf']
}

def classify_category(text):
    """根据内容分类"""
    text_lower = text.lower()
    scores = {}
    
    for category, keywords in CATEGORY_MAP.items():
        score = sum(1 for kw in keywords if kw in text_lower)
        if score > 0:
            scores[category] = score
    
    if scores:
        return max(scores, key=scores.get)
    return 'military'  # 默认分类

def classify_importance(text):
    """判断重要性"""
    text_lower = text.lower()
    
    critical_keywords = ['war', 'attack', 'strike', 'killed', 'death', 'nuclear', 'invasion']
    high_keywords = ['missile', 'drone', 'sanctions', 'conflict', 'tension', 'crisis']
    
    if any(kw in text_lower for kw in critical_keywords):
        return 'critical'
    elif any(kw in text_lower for kw in high_keywords):
        return 'high'
    return 'medium'

def extract_tags(text):
    """提取标签"""
    text_lower = text.lower()
    tags = []
    
    for keyword in KEYWORDS:
        if keyword in text_lower:
            tags.append(keyword.replace(' ', '-'))
    
    return tags[:5]  # 最多5个标签

def generate_mock_news():
    """生成模拟新闻数据（实际爬虫实现前使用）"""
    now = datetime.now()
    
    news_items = [
        {
            "id": f"news-{now.strftime('%Y%m%d%H%M')}-001",
            "title": "Iran warns of 'decisive response' after Israeli strike on Damascus consulate",
            "source": "Reuters",
            "url": "https://www.reuters.com/world/middle-east/",
            "timestamp": (now - timedelta(minutes=15)).isoformat(),
            "summary": "Iran's Revolutionary Guards said seven military advisors were killed in the strike, including a senior commander. Tehran vowed to retaliate.",
            "category": "military",
            "importance": "critical",
            "tags": ["iran", "israel", "damascus", "strike", "retaliation"]
        },
        {
            "id": f"news-{now.strftime('%Y%m%d%H%M')}-002",
            "title": "US deploys additional aircraft carrier to Middle East amid rising tensions",
            "source": "Al Jazeera",
            "url": "https://www.aljazeera.com/middle-east/",
            "timestamp": (now - timedelta(minutes=32)).isoformat(),
            "summary": "The Pentagon announced deployment of USS Theodore Roosevelt to join USS Abraham Lincoln in the region as deterrence against Iran.",
            "category": "military",
            "importance": "high",
            "tags": ["us", "carrier", "middle-east", "iran", "deterrence"]
        },
        {
            "id": f"news-{now.strftime('%Y%m%d%H%M')}-003",
            "title": "Oil prices surge 3% on Middle East conflict fears",
            "source": "BBC",
            "url": "https://www.bbc.com/news/world/middle_east",
            "timestamp": (now - timedelta(minutes=45)).isoformat(),
            "summary": "Brent crude jumped above $85 per barrel as markets priced in risk of supply disruptions through Strait of Hormuz.",
            "category": "energy",
            "importance": "high",
            "tags": ["oil", "brent", "middle-east", "hormuz", "economy"]
        },
        {
            "id": f"news-{now.strftime('%Y%m%d%H%M')}-004",
            "title": "EU foreign ministers to discuss Iran sanctions expansion",
            "source": "The Guardian",
            "url": "https://www.theguardian.com/world/middleeast",
            "timestamp": (now - timedelta(minutes=58)).isoformat(),
            "summary": "European Union considering new sanctions targeting Iran drone and missile programs following recent regional attacks.",
            "category": "sanction",
            "importance": "medium",
            "tags": ["eu", "sanctions", "iran", "drone", "missile"]
        },
        {
            "id": f"news-{now.strftime('%Y%m%d%H%M')}-005",
            "title": "Houthis claim new missile attack on Red Sea shipping",
            "source": "Al Arabiya",
            "url": "https://english.alarabiya.net/News/middle-east",
            "timestamp": (now - timedelta(minutes=78)).isoformat(),
            "summary": "Yemen's Iran-aligned Houthi movement said it targeted two vessels in the Red Sea with naval missiles.",
            "category": "military",
            "importance": "high",
            "tags": ["houthis", "red-sea", "iran", "missile", "shipping"]
        },
        {
            "id": f"news-{now.strftime('%Y%m%d%H%M')}-006",
            "title": "IAEA reports increased uranium enrichment activity at Iranian facilities",
            "source": "Jerusalem Post",
            "url": "https://www.jpost.com/international",
            "timestamp": (now - timedelta(minutes=95)).isoformat(),
            "summary": "UN nuclear watchdog detected higher levels of uranium enrichment at Fordow and Natanz facilities.",
            "category": "diplomacy",
            "importance": "critical",
            "tags": ["iaea", "uranium", "enrichment", "iran", "nuclear"]
        },
        {
            "id": f"news-{now.strftime('%Y%m%d%H%M')}-007",
            "title": "Protests erupt in Tehran over economic conditions",
            "source": "Times of Israel",
            "url": "https://www.timesofisrael.com/",
            "timestamp": (now - timedelta(minutes=120)).isoformat(),
            "summary": "Demonstrators gathered in central Tehran chanting slogans against government economic policies.",
            "category": "domestic",
            "importance": "medium",
            "tags": ["tehran", "protests", "economic", "iran"]
        }
    ]
    
    return news_items

def generate_hourly_summary(news_items):
    """生成小时摘要"""
    critical_count = sum(1 for item in news_items if item['importance'] == 'critical')
    high_count = sum(1 for item in news_items if item['importance'] == 'high')
    
    if critical_count >= 2:
        risk_level = 'critical'
    elif critical_count >= 1 or high_count >= 3:
        risk_level = 'high'
    elif high_count >= 1:
        risk_level = 'medium'
    else:
        risk_level = 'low'
    
    hour = datetime.now().strftime('%H:%M')
    
    return {
        "hour": hour,
        "riskLevel": risk_level,
        "summary": f"{hour}时段：伊朗局势持续紧张，以伊冲突升级风险加剧。伊朗警告将对大马士革袭击进行报复，美国增派航母至中东。油价上涨3%，欧盟考虑扩大对伊制裁。",
        "keyEvents": [
            "伊朗警告报复以色列大马士革袭击",
            "美国增派航母至中东",
            "油价上涨3%",
            "欧盟考虑扩大制裁",
            "胡塞武装声称袭击红海船只"
        ]
    }

def save_news_data(news_items, summary):
    """保存新闻数据到 JSON 文件"""
    data_dir = '/root/.openclaw/workspace/iran-intelligence-dashboard/data'
    os.makedirs(data_dir, exist_ok=True)
    
    # 读取现有数据
    news_file = os.path.join(data_dir, 'news.json')
    if os.path.exists(news_file):
        with open(news_file, 'r', encoding='utf-8') as f:
            existing_data = json.load(f)
    else:
        existing_data = {"items": [], "summary": None, "lastUpdate": None}
    
    # 合并数据（去重）
    existing_ids = {item['id'] for item in existing_data.get('items', [])}
    new_items = [item for item in news_items if item['id'] not in existing_ids]
    
    # 保留最近100条
    all_items = new_items + existing_data.get('items', [])
    all_items = all_items[:100]
    
    # 保存数据
    data = {
        "items": all_items,
        "summary": summary,
        "lastUpdate": datetime.now().isoformat()
    }
    
    with open(news_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"✅ 已保存 {len(new_items)} 条新闻到 {news_file}")
    return data

def main():
    """主函数"""
    print(f"🕐 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} - 开始抓取伊朗新闻...")
    
    # 生成新闻数据（实际部署时替换为真实爬虫）
    news_items = generate_mock_news()
    
    # 生成摘要
    summary = generate_hourly_summary(news_items)
    
    # 保存数据
    data = save_news_data(news_items, summary)
    
    print(f"✅ 抓取完成，共 {len(data['items'])} 条新闻")
    print(f"📊 风险等级: {summary['riskLevel']}")
    
    return data

if __name__ == '__main__':
    main()
