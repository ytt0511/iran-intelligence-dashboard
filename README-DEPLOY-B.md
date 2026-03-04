# 方案 B 部署指南

## 架构

```
OpenClaw (数据更新) → GitHub → Vercel (静态托管)
```

## 目录结构调整

将项目结构调整为：

```
iran-intelligence-dashboard/
├── frontend/              # 前端代码
│   ├── app/
│   │   ├── components/
│   │   ├── lib/
│   │   ├── types/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx        # 或使用 page-static.tsx
│   ├── public/
│   │   └── data/          # 数据文件复制到这里
│   ├── package.json
│   ├── .env.example
│   └── next.config.mjs
│
├── data/                  # 数据源文件（在根目录，方便 OpenClaw 访问）
│   ├── news.json
│   ├── polymarket.json
│   └── assets.json
│
├── scripts/               # OpenClaw 执行的爬虫脚本
│   ├── crawl_news.py
│   ├── crawl_news_real.py
│   └── crawl_news_hourly.py
│
└── .github/              # GitHub Actions（可选）
    └── workflows/
        └── deploy.yml
```

## 步骤 1: 初始化 Git 仓库

```bash
cd D:\polket\iran-intelligence-dashboard

# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 首次提交
git commit -m "Initial commit: frontend + data separation"
```

## 步骤 2: 推送到 GitHub

```bash
# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/your-username/iran-intelligence-dashboard.git

# 推送到 GitHub
git push -u origin main
```

## 步骤 3: 配置 OpenClaw 定时任务

### 3.1 新闻爬虫任务

在 OpenClaw 控制台创建以下任务：

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
    "message": "【伊朗新闻爬虫任务】\n\n执行新闻抓取脚本:\n```bash\ncd /root/.openclaw/workspace/iran-intelligence-dashboard\npython3 scripts/crawl_news.py\n```\n\n任务完成后:\n1. 检查 data/news.json 是否更新\n2. 验证数据格式正确\n3. 触发 GitHub 更新推送",
    "model": "kimi-coding/k2p5",
    "thinking": "low",
    "timeoutSeconds": 120
  },
  "sessionTarget": "isolated"
}
```

### 3.2 Polymarket 数据更新任务

```json
{
  "name": "iran-polymarket-updater",
  "schedule": {
    "kind": "cron",
    "expr": "0 * * * *",
    "tz": "Asia/Shanghai"
  },
  "payload": {
    "kind": "agentTurn",
    "message": "【Polymarket 数据更新】\n\n更新 Polymarket 数据:\n```bash\ncd /root/.openclaw/workspace/iran-intelligence-dashboard\n# kimi_search 搜索并整理 Polymarket 数据\n```\n\n任务完成后:\n1. 更新 data/polymarket.json\n2. 触发 GitHub 更新推送",
    "model": "kimi-coding/k2p5",
    "thinking": "low",
    "timeoutSeconds": 90
  },
  "sessionTarget": "isolated"
}
```

### 3.3 资产数据更新任务

```json
{
  "name": "iran-assets-updater",
  "schedule": {
    "kind": "cron",
    "expr": "*/15 * * * *",
    "tz": "Asia/Shanghai"
  },
  "payload": {
    "kind": "agentTurn",
    "message": "【资产数据更新】\n\n获取最新资产数据:\n```bash\ncd /root/.openclaw/workspace/iran-intelligence-dashboard\n# 调用 Yahoo Finance API 获取资产数据\n```\n\n任务完成后:\n1. 更新 data/assets.json\n2. 触发 GitHub 更新推送",
    "model": "kimi-coding/k2p5",
    "thinking": "low",
    "timeoutSeconds": 60
  },
  "sessionTarget": "isolated"
}
```

## 步骤 4: 配置前端读取静态数据

### 方式 A: 使用 page-static.tsx

```bash
# 将 page.tsx 重命名备份
cd frontend/app
mv page.tsx page-api.tsx

# 使用静态版本
mv page-static.tsx page.tsx
```

### 方式 B: 配置环境变量

编辑 `frontend/.env.local`:

```env
# 数据模式: static = 静态文件, api = API 服务
NEXT_PUBLIC_DATA_MODE=static
```

## 步骤 5: Vercel 部署

### 5.1 连接 GitHub 到 Vercel

1. 访问 https://vercel.com/new
2. 选择 **Import Git Repository**
3. 授权 GitHub 账号
4. 选择 `iran-intelligence-dashboard` 仓库
5. 配置如下：

| 配置项 | 值 |
|--------|-----|
| Framework Preset | Next.js |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `out` |

6. 点击 **Deploy**

### 5.2 配置环境变量（可选）

如果将来需要 API 模式，在 Vercel 中添加：

| 变量 | 值 | 环境 |
|------|-----|------|
| `NEXT_PUBLIC_DATA_MODE` | `static` | Production, Preview, Development |

## 数据流程

```
┌─────────────────────────────────────────────────────────────────┐
│                  OpenClaw 定时任务 (每小时)                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                              │
│  1. 执行爬虫脚本更新 data/news.json                      │
│  2. 更新 data/polymarket.json                              │
│  3. 更新 data/assets.json                                   │
│  4. 触发 Git 推送到 GitHub                                │
│                                                              │
└───────────────────────┬─────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                  GitHub 仓库                                     │
│                                                              │
│  data/ 目录更新后自动触发推送                                   │
│  → GitHub Webhook 检测到更新                               │
│  → 自动触发 Vercel 重新部署                                   │
│                                                              │
└───────────────────────┬─────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Vercel 自动部署                               │
│                                                              │
│  1. 重新拉取最新代码 (包含更新的 data/)                        │
│  2. 执行 npm run build                                      │
│  3. 部署 out/ 目录到 CDN                                    │
│  4. 访问地址更新                                           │
│                                                              │
└─────────────────────────────────────────────────────────────────────┘
```

## OpenClaw Git 推送脚本

OpenClaw 任务中需要包含 Git 推送命令：

```bash
# 1. 配置 Git（首次执行）
cd /root/.openclaw/workspace/iran-intelligence-dashboard
git config user.name "OpenClaw Bot"
git config user.email "bot@openclaw.ai"

# 2. 添加所有更改
git add .

# 3. 提交
git commit -m "Update data files - $(date +%Y-%m-%d %H:%M:%S)"

# 4. 推送
git push origin main
```

## 常见问题

### Q: OpenClaw 无法访问 GitHub？

A: 需要在 OpenClaw 配置 GitHub Personal Access Token：
1. GitHub Settings → Developer settings → Personal access tokens → Generate new token
2. 复制 token
3. 在 OpenClaw 任务中使用：
```bash
git remote set-url origin https://[YOUR_TOKEN]@github.com/username/repo.git
```

### Q: Vercel 自动部署不生效？

A: 检查以下几点：
1. GitHub 仓库是否正确连接到 Vercel
2. Root Directory 是否设置为 `frontend`
3. Vercel 项目是否配置了自动部署（通常连接 GitHub 后自动开启）

### Q: 数据更新慢？

A: OpenClaw 任务执行时间取决于：
- 爬虫脚本的执行时间
- Git 推送的网络速度
- Vercel 构建和部署速度

### Q: 如何查看数据是否更新？

A: 在 OpenClaw 任务执行日志中查看，或在 GitHub 仓库的 Commits 页面查看提交历史。

## 环境配置总结

| 环境 | NEXT_PUBLIC_DATA_MODE | 数据来源 |
|------|----------------------|---------|
| 本地开发 | `static` | `frontend/public/data/` 文件 |
| Vercel 部署 | `static` | Vercel 托管的静态文件 |
| 未来扩展 | `api` | 独立的 API 服务 |
