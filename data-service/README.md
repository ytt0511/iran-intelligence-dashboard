# 伊朗情报看板 - 数据服务

> 独立的数据服务，为前端提供 API

## 目录结构

```
data-service/
├── api/
│   ├── polymarket/      # Polymarket 数据 API
│   ├── news/           # 新闻数据 API
│   ├── assets/         # 资产数据 API
│   └── probability/     # 概率模型 API
├── scripts/            # 数据采集脚本
├── data/              # 数据存储
├── server.js           # Express 服务器入口
├── package.json
└── .env.example        # 环境变量示例
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 根据需要修改配置
```

### 3. 启动服务

```bash
npm start
```

服务将运行在 `http://localhost:3001`

## API 端点

| 方法 | 端点 | 说明 |
|------|--------|------|
| GET | `/api/polymarket` | 获取 Polymarket 数据 |
| GET | `/api/news` | 获取新闻数据 |
| GET | `/api/assets` | 获取资产价格数据 |
| GET | `/health` | 健康检查 |

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|---------|
| `PORT` | 服务端口 | `3001` |
| `CORS_ORIGIN` | CORS 允许来源 | `*` |
| `POLYMARKET_DATA_PATH` | Polymarket 数据路径 | `./data/polymarket.json` |
| `NEWS_DATA_PATH` | 新闻数据路径 | `./data/news.json` |
| `ASSETS_DATA_PATH` | 资产数据路径 | `./data/assets.json` |

## 技术栈

- **框架**: Express.js 4.18
- **语言**: Node.js (JavaScript)
- **CORS**: cors 2.8

## 部署

### Render

1. 将代码推送到 GitHub
2. 在 Render 创建新 Web Service
3. 连接 GitHub 仓库
4. 自动部署

### Railway

```bash
# 安装 Railway CLI
npm i -g @railway/cli

# 登录并部署
railway login
railway up
```

### VPS 部署

```bash
# 使用 PM2 保持运行
npm i -g pm2
pm2 start server.js --name iran-data-service
```
