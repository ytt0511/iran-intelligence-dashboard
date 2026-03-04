/**
 * Polymarket CSV 数据处理脚本
 *
 * 功能：将 data/polymarket_data 目录下的 CSV 文件转换为 JSON 格式
 * 输出：data/polymarket_data.json
 *
 * 使用方法：
 *   node scripts/process-polymarket-csv.js
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data/polymarket_data');
const OUTPUT_FILE = path.join(__dirname, '../data/polymarket_data.json');

/**
 * 解析单个 CSV 文件
 */
function parseCsvFile(filePath, fileName) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');

  // 处理 BOM 和换行符
  const content = fileContent.replace(/^\uFEFF/, '').trim();
  const lines = content.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  if (lines.length < 2) {
    return {};
  }

  // 解析 CSV 行，正确处理引号
  function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // 转义的引号
          current += '"';
          i++; // 跳过下一个引号
        } else {
          // 切换引号状态
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // 字段分隔符（不在引号内）
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  }

  // 解析标题行（第一行）
  const headers = parseCSVLine(lines[0]).map(h => h.replace(/^"|"$/g, '').trim());

  // 第一列是 datetime，后面都是指标
  let indicatorNames = headers.slice(1);

  // 如果指标名是简单的 "Yes" 或 "No"，使用文件名作为更清晰的指标名
  if (indicatorNames.length === 1 && (indicatorNames[0] === 'Yes' || indicatorNames[0] === 'No')) {
    // 将文件名转换为可读标题
    indicatorNames = [fileName
      .replace(/-/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())];
  }

  // 初始化结果对象
  const result = {};
  indicatorNames.forEach(name => {
    result[name] = [];
  });

  // 解析数据行
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);

    // 第一列是时间
    const datetime = values[0];

    // 后面每一列对应一个指标
    for (let j = 0; j < indicatorNames.length; j++) {
      const rawValue = values[j + 1];
      let value = null;

      if (rawValue && rawValue !== '' && rawValue !== ',') {
        const parsed = parseFloat(rawValue);
        if (!isNaN(parsed)) {
          value = parsed;
        }
      }

      result[indicatorNames[j]].push({
        datetime,
        value
      });
    }
  }

  return result;
}

/**
 * 读取并解析所有 CSV 文件
 */
function parseAllCsvFiles() {
  const result = {};

  // 检查目录是否存在
  if (!fs.existsSync(DATA_DIR)) {
    console.error(`❌ 目录不存在: ${DATA_DIR}`);
    return result;
  }

  // 读取目录下所有文件
  const files = fs.readdirSync(DATA_DIR);

  // 筛选 CSV 文件
  const csvFiles = files.filter(file => file.endsWith('.csv'));

  console.log(`📁 找到 ${csvFiles.length} 个 CSV 文件\n`);

  // 解析每个 CSV 文件
  csvFiles.forEach((file, index) => {
    const filePath = path.join(DATA_DIR, file);
    const fileName = file.replace('.csv', '');

    try {
      const startTime = Date.now();
      const csvData = parseCsvFile(filePath, fileName);
      const fileStats = fs.statSync(filePath);
      const fileSize = (fileStats.size / 1024).toFixed(2);

      // 计算总数据点
      const totalPoints = Object.values(csvData).reduce(
        (sum, arr) => sum + arr.length,
        0
      );

      result[fileName] = csvData;

      const elapsed = Date.now() - startTime;
      console.log(
        `  [${index + 1}/${csvFiles.length}] ✓ ${file.padEnd(50)} ` +
        `(${fileSize}KB, ${Object.keys(csvData).length} 指标, ${totalPoints} 数据点, ${elapsed}ms)`
      );
    } catch (error) {
      console.error(`  ❌ 解析失败: ${file}`, error.message);
    }
  });

  return result;
}

/**
 * 主函数
 */
function main() {
  console.log('='.repeat(60));
  console.log('Polymarket CSV 数据处理脚本');
  console.log('='.repeat(60));
  console.log(`📂 输入目录: ${DATA_DIR}`);
  console.log(`📄 输出文件: ${OUTPUT_FILE}`);
  console.log('='.repeat(60));
  console.log();

  // 解析所有 CSV 文件
  const polymarketData = parseAllCsvFiles();

  if (Object.keys(polymarketData).length === 0) {
    console.log('\n❌ 没有成功解析任何文件');
    process.exit(1);
  }

  // 计算总体统计
  const totalFiles = Object.keys(polymarketData).length;
  const totalIndicators = Object.values(polymarketData).reduce(
    (sum, file) => sum + Object.keys(file).length,
    0
  );
  const totalDataPoints = Object.values(polymarketData).reduce(
    (sum, file) => sum + Object.values(file).reduce((s, arr) => s + arr.length, 0),
    0
  );

  // 生成输出数据
  const outputData = {
    meta: {
      totalFiles,
      totalIndicators,
      totalDataPoints,
      generatedAt: new Date().toISOString(),
      version: '1.0.0'
    },
    data: polymarketData
  };

  // 写入 JSON 文件
  console.log();
  console.log('='.repeat(60));
  console.log('📊 统计信息:');
  console.log(`  - 文件数量: ${totalFiles}`);
  console.log(`  - 指标数量: ${totalIndicators}`);
  console.log(`  - 数据点总数: ${totalDataPoints}`);
  console.log('='.repeat(60));
  console.log();

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(outputData, null, 2), 'utf-8');

  const outputFileStats = fs.statSync(OUTPUT_FILE);
  const outputFileSize = (outputFileStats.size / 1024).toFixed(2);

  console.log(`✅ 成功生成 JSON 文件: ${OUTPUT_FILE} (${outputFileSize}KB)`);
  console.log();
}

// 执行主函数
main();
