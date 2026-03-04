# 伊朗情报看板定时任务配置

## 新闻爬虫任务 - 每小时执行

```json
{
  "name": "iran-news-crawler",
  "schedule": {
    "kind": "cron",
    "expr": "0 * * * *",
    "tz": "Asia/Shanghai"
  },
  "payload": {
    "kind": "agentTurn",
    "message": "【伊朗新闻爬虫任务】\n\n执行新闻抓取脚本:\n```bash\ncd /root/.openclaw/workspace/iran-intelligence-dashboard\npython3 scripts/crawl_news.py\n```\n\n任务完成后:\n1. 检查 data/news.json 是否更新\n2. 验证数据格式正确\n3. 如失败则发送报警",
    "model": "kimi-coding/k2p5",
    "thinking": "low",
    "timeoutSeconds": 120
  },
  "sessionTarget": "isolated",
  "delivery": {
    "mode": "none"
  }
}
```

## 数据更新任务 - 每15分钟刷新前端数据

```json
{
  "name": "iran-dashboard-data-refresh",
  "schedule": {
    "kind": "cron",
    "expr": "*/15 * * * *",
    "tz": "Asia/Shanghai"
  },
  "payload": {
    "kind": "agentTurn",
    "message": "【伊朗看板数据刷新】\n\n1. 检查 news.json 是否存在\n2. 如数据超过2小时未更新，触发新闻爬虫\n3. 验证数据完整性",
    "model": "kimi-coding/k2p5",
    "thinking": "low",
    "timeoutSeconds": 60
  },
  "sessionTarget": "isolated",
  "delivery": {
    "mode": "none"
  }
}
```

## 部署任务 - 数据更新后自动部署

```json
{
  "name": "iran-dashboard-deploy",
  "schedule": {
    "kind": "cron",
    "expr": "5 * * * *",
    "tz": "Asia/Shanghai"
  },
  "payload": {
    "kind": "agentTurn",
    "message": "【伊朗看板自动部署】\n\n如果新闻数据有更新，执行部署:\n```bash\ncd /root/.openclaw/workspace/iran-intelligence-dashboard\nnpm run build\n# 注意: 需要在 Vercel 环境变量中配置 VERCEL_TOKEN\n```",
    "model": "kimi-coding/k2p5",
    "thinking": "low",
    "timeoutSeconds": 300
  },
  "sessionTarget": "isolated",
  "delivery": {
    "mode": "announce",
    "to": "ou_3526797c65d7dc4e37f175d1c9720400"
  }
}
```

## 手动执行命令

```bash
# 立即执行新闻爬虫
cd /root/.openclaw/workspace/iran-intelligence-dashboard
python3 scripts/crawl_news.py

# 查看数据
cat data/news.json | head -50

# 手动部署
./deploy.sh
```
