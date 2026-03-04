# 伊朗情报看板 - 前后端分离指南

## 分离后的目录结构

```
iran-intelligence-dashboard/
├── frontend/                   # ← 前端应用
│   ├── app/
│   ├── public/
│   ├── package.json
│   └── README.md
│
├── data-service/               # ← 数据服务
│   ├── api/
│   ├── scripts/
│   ├── data/
│   ├── server.js
│   ├── package.json
│   └── README.md
│
└── README-SPLIT.md             # ← 本文档
```

## 启动方式

### 本地开发

```bash
# 终端 1: 启动数据服务
cd data-service
npm install
npm start
# 运行在 http://localhost:3001

# 终端 2: 启动前端
cd frontend
npm install
cp .env.example .env.local
# 编辑 .env.local 设置 NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
npm run dev
# 运行在 http://localhost:3000
```

### 生产部署

#### 前端部署到 Vercel

```bash
cd frontend
npm run build
vercel
```

#### 数据服务部署到 Render

1. 创建 Render 账号
2. 创建新 Web Service
3. 选择 "Deploy from GitHub"
4. 选择数据服务仓库
5. 自动部署

## API 配置

前端需要配置环境变量指向数据服务地址：

```bash
# 开发环境 (.env.local)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001

# 生产环境 (Vercel)
NEXT_PUBLIC_API_BASE_URL=https://your-data-service.onrender.com
```

## 数据更新

数据服务中的 `data/` 目录需要定期更新，可通过以下方式：

1. **定时任务**: 使用 cron 任务运行 `scripts/` 中的爬虫脚本
2. **手动更新**: 将更新后的 JSON 文件放入 `data/` 目录
3. **外部数据源**: 使用外部数据采集服务定期推送到 `data/` 目录

## 优势对比

| 维度 | 原项目 | 前后分离 |
|------|---------|-----------|
| 部署灵活性 | 低 (需一起部署) | 高 (独立部署) |
| 数据更新 | 需重新构建 | 独立更新 |
| 开发协作 | 需全项目 | 可分模块 |
| 维护复杂度 | 高 (耦合) | 低 (解耦) |
| 扩展性 | 低 (静态文件) | 高 (独立 API 服务) |

## 迁移步骤

1. ✅ 创建 `frontend/` 目录并复制前端文件
2. ✅ 创建 `data-service/` 目录并复制 API 和数据文件
3. ✅ 修改前端数据获取方式，使用环境变量配置的 API 地址
4. ✅ 创建各自独立的配置文件
5. ✅ 分别部署前端和数据服务

## 注意事项

1. 前端 `next.config.mjs` 中配置了 `output: 'export'`，API 路由在生产环境不会工作
2. 开发环境前端使用 Next.js API 路由，生产环境调用外部数据服务
3. 确保 CORS 配置正确，避免跨域问题
4. 数据服务的 `data/` 目录需要有写权限，用于定时任务更新数据
