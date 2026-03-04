# OpenClaw Git 配置脚本
# 用于在 OpenClaw 环境中配置 Git 和推送数据更新

# Git 配置
REPO_URL="${1:-}"
USERNAME="${2:-}"
TOKEN="${3:-}"

if [ -n "$REPO_URL" ] && [ -n "$USERNAME" ] && [ -n "$TOKEN" ]; then
  echo "========================================"
  echo "配置 Git 凭证..."
  echo "========================================"

  git config user.name "$USERNAME"
  git config user.email "$USERNAME@users.noreply.github.com"
  git remote set-url origin "$TOKEN@github.com/$REPO_URL"

  echo "✅ Git 配置完成"
  echo "   Remote: origin → $REPO_URL"
  echo ""
fi
