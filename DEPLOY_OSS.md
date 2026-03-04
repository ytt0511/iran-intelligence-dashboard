# 阿里云 OSS 部署配置

## 1. 安装 ossutil

```bash
# macOS
brew install ossutil

# Linux
wget http://gosspublic.alicdn.com/ossutil/1.7.15/ossutil64
chmod 755 ossutil64
sudo mv ossutil64 /usr/local/bin/ossutil

# 验证安装
ossutil --version
```

## 2. 配置阿里云凭证

```bash
# 配置访问密钥
ossutil config

# 输入以下信息：
# - AccessKey ID: 你的 AccessKey ID
# - AccessKey Secret: 你的 AccessKey Secret
# - Endpoint: oss-cn-hangzhou.aliyuncs.com (根据你的区域调整)
# - 语言: CH
```

**获取 AccessKey：**
1. 登录阿里云控制台 → 右上角头像 → AccessKey 管理
2. 创建 AccessKey（保存好 Secret，只显示一次）

## 3. 创建 OSS Bucket

```bash
# 创建 Bucket（替换为你的 bucket 名称和区域）
ossutil mb oss://iran-intelligence-dashboard --acl public-read

# 设置静态网站托管
ossutil website --index index.html --error 404.html oss://iran-intelligence-dashboard
```

**Bucket 命名规则：**
- 全局唯一（建议用项目名+随机数）
- 只能包含小写字母、数字、连字符
- 示例：`iran-intel-20260303`

## 4. 部署脚本

### deploy-oss.sh

```bash
#!/bin/bash

# 阿里云 OSS 部署脚本

# 配置
BUCKET_NAME="iran-intelligence-dashboard"  # 替换为你的 bucket 名称
REGION="cn-hangzhou"  # 替换为你的区域
ENDPOINT="oss-${REGION}.aliyuncs.com"
BUILD_DIR="./out"

echo "🚀 开始部署到阿里云 OSS..."

# 1. 构建项目
echo "📦 构建项目..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
fi

# 2. 上传文件到 OSS
echo "☁️  上传到 OSS..."
ossutil cp -r ${BUILD_DIR}/ oss://${BUCKET_NAME}/ \
    --update \
    --jobs 10 \
    --parallel 10 \
    --exclude ".DS_Store" \
    --exclude "*.map"

if [ $? -ne 0 ]; then
    echo "❌ 上传失败"
    exit 1
fi

# 3. 设置缓存策略
echo "⚙️  设置缓存策略..."
ossutil set-meta oss://${BUCKET_NAME}/ css/ Cache-Control:"public,max-age=31536000" --update -r
ossutil set-meta oss://${BUCKET_NAME}/ js/ Cache-Control:"public,max-age=31536000" --update -r
ossutil set-meta oss://${BUCKET_NAME}/ images/ Cache-Control:"public,max-age=31536000" --update -r
ossutil set-meta oss://${BUCKET_NAME}/ index.html Cache-Control:"public,max-age=0,no-cache" --update

# 4. 输出访问地址
echo ""
echo "✅ 部署成功！"
echo ""
echo "🌐 访问地址："
echo "   http://${BUCKET_NAME}.oss-${REGION}.aliyuncs.com"
echo ""
echo "📋 Bucket 信息："
echo "   名称: ${BUCKET_NAME}"
echo "   区域: ${REGION}"
echo "   终端节点: ${ENDPOINT}"
```

## 5. 使用方式

```bash
# 给脚本执行权限
chmod +x deploy-oss.sh

# 执行部署
./deploy-oss.sh
```

## 6. 绑定自定义域名（可选）

### 6.1 在 OSS 控制台添加域名
1. 登录 [OSS 控制台](https://oss.console.aliyun.com)
2. 选择你的 Bucket → 域名管理
3. 点击「绑定域名」
4. 输入你的域名，如 `iran.yourdomain.com`

### 6.2 在 DNS 服务商添加 CNAME

```
类型: CNAME
主机: iran
记录值: iran-intelligence-dashboard.oss-cn-hangzhou.aliyuncs.com
TTL: 600
```

### 6.3 配置 HTTPS（推荐）
1. 在 OSS 域名管理页面
2. 点击「证书托管」
3. 上传 SSL 证书（或使用阿里云免费证书）

## 7. 自动部署（GitHub Actions）

### .github/workflows/deploy-oss.yml

```yaml
name: Deploy to Aliyun OSS

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
    
    - name: Setup ossutil
      run: |
        wget http://gosspublic.alicdn.com/ossutil/1.7.15/ossutil64
        chmod 755 ossutil64
        sudo mv ossutil64 /usr/local/bin/ossutil
    
    - name: Configure ossutil
      run: |
        ossutil config -i ${{ secrets.ALIYUN_ACCESS_KEY_ID }} \
                       -k ${{ secrets.ALIYUN_ACCESS_KEY_SECRET }} \
                       -e oss-cn-hangzhou.aliyuncs.com \
                       -L CH
    
    - name: Deploy to OSS
      run: |
        ossutil cp -r ./out/ oss://${{ secrets.OSS_BUCKET_NAME }}/ \
          --update \
          --jobs 10 \
          --parallel 10
    
    - name: Set cache headers
      run: |
        ossutil set-meta oss://${{ secrets.OSS_BUCKET_NAME }}/ css/ Cache-Control:"public,max-age=31536000" --update -r
        ossutil set-meta oss://${{ secrets.OSS_BUCKET_NAME }}/ js/ Cache-Control:"public,max-age=31536000" --update -r
        ossutil set-meta oss://${{ secrets.OSS_BUCKET_NAME }}/ index.html Cache-Control:"public,max-age=0,no-cache" --update
```

### GitHub Secrets 配置

在 GitHub 仓库 → Settings → Secrets and variables → Actions 中添加：

| Secret Name | Value |
|-------------|-------|
| `ALIYUN_ACCESS_KEY_ID` | 你的 AccessKey ID |
| `ALIYUN_ACCESS_KEY_SECRET` | 你的 AccessKey Secret |
| `OSS_BUCKET_NAME` | iran-intelligence-dashboard |

## 8. 常见问题

### Q: 上传后访问返回 403？
A: 检查 Bucket 权限是否为「公共读」
```bash
ossutil set-acl oss://your-bucket public-read
```

### Q: 如何刷新 CDN 缓存？
A: 如果使用了 CDN，需要刷新缓存
```bash
# 登录阿里云 CDN 控制台手动刷新
# 或使用 API
```

### Q: 如何设置自定义 404 页面？
A: 在 Bucket 根目录上传 404.html，然后：
```bash
ossutil website --index index.html --error 404.html oss://your-bucket
```

## 9. 费用估算

| 项目 | 免费额度 | 超出费用 |
|------|---------|---------|
| 存储 | 5GB/月 | ¥0.12/GB/月 |
| 流量 | 50GB/月 | ¥0.8/GB |
| 请求 | 100万次/月 | ¥0.01/万次 |

对于小型看板，免费额度完全够用。

## 10. 相关链接

- [阿里云 OSS 控制台](https://oss.console.aliyun.com)
- [ossutil 文档](https://help.aliyun.com/document_detail/120075.html)
- [OSS 静态网站托管](https://help.aliyun.com/document_detail/31872.html)
