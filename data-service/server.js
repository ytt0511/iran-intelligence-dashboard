const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

// 静态数据路径
const DATA_DIR = path.join(__dirname, 'data');

// API 路由
app.get('/api/polymarket', (req, res) => {
  try {
    const filePath = path.join(DATA_DIR, 'polymarket.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    res.json({
      success: true,
      data: data.markets || data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to load Polymarket data'
    });
  }
});

app.get('/api/news', (req, res) => {
  try {
    const filePath = path.join(DATA_DIR, 'news.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    res.json({
      success: true,
      data: {
        items: data.news || [],
        summary: {
          hour: data.summary?.hour || new Date().toISOString().slice(0, 13) + ':00',
          summary: data.summary?.overview || '',
          keyEvents: data.summary?.key_themes || [],
          riskLevel: data.summary?.risk_assessment?.level?.toLowerCase() || 'medium'
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to load news data'
    });
  }
});

app.get('/api/assets', (req, res) => {
  try {
    const filePath = path.join(DATA_DIR, 'assets.json');
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    res.json({
      success: true,
      data: data.assets || data,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to load assets data'
    });
  }
});

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`\n🚀 Data Service running on port ${PORT}`);
  console.log(`\n📊 Available endpoints:`);
  console.log(`   GET ${process.env.CORS_ORIGIN || '*'}://localhost:${PORT}/api/polymarket`);
  console.log(`   GET ${process.env.CORS_ORIGIN || '*'}://localhost:${PORT}/api/news`);
  console.log(`   GET ${process.env.CORS_ORIGIN || '*'}://localhost:${PORT}/api/assets`);
  console.log(`   GET ${process.env.CORS_ORIGIN || '*'}://localhost:${PORT}/health\n`);
});
