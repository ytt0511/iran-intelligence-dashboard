#!/bin/bash

# 伊朗情报看板 Vercel 部署脚本

set -e

# Vercel Token（请从 Vercel Settings → Tokens 获取）
# VERCEL_TOKEN="your-vercel-token-here"

echo "🚀 伊朗情报看板 Vercel 部署脚本"
echo "================================"

# 检查是否在项目目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖..."
npm install

# 构建项目
echo "🔨 构建项目..."
npm run build

# 检查构建是否成功
if [ ! -d "out" ]; then
    echo "❌ 构建失败: out 目录不存在"
    exit 1
fi

echo "✅ 构建成功"

# 部署到 Vercel
echo "☁️  部署到 Vercel..."
npx vercel@latest deploy --prod --yes --token="$VERCEL_TOKEN"

echo ""
echo "✅ 部署完成!"
echo ""
