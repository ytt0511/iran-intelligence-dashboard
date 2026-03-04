# 伊朗情报看板 - 前端应用

> 独立的前端应用，通过 API 获取数据

## 目录结构

```
frontend/
├── app/
│   ├── components/      # React 组件
│   ├── types/          # TypeScript 类型定义
│   ├── lib/            # 工具函数
│   ├── globals.css     # 全局样式
│   ├── layout.tsx      # 根布局
│   └── page.tsx        # 主页面
├── public/             # 静态资源
├── .env.example        # 环境变量示例
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.mjs
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑 .env.local，设置数据服务地址
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
```

### 3. 启动开发服务器

```bash
npm run dev
```

访问: http://localhost:3000

### 4. 构建生产版本

```bash
npm run build
```

输出目录: `out/`

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | 数据服务 API 地址 | `http://localhost:3001` |
| `NEXT_PUBLIC_DEV_MODE` | 开发模式标识 | `true` |

## API 端点

| 端点 | 用途 |
|--------|------|
| `/api/polymarket` | Polymarket 预测市场数据 |
| `/api/news` | 新闻数据 |
| `/api/assets` | 敏感资产价格数据 |

## 技术栈

- **框架**: Next.js 14.2.5
- **语言**: TypeScript 5
- **样式**: Tailwind CSS 3.4
- **图表**: Recharts 2.12

## 部署

### Vercel 部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel
```

### 静态托管

将 `out/` 目录部署到任何静态托管服务：
- Vercel
- Netlify
- GitHub Pages
- 阿里云 OSS
- 腾讯云 COS
