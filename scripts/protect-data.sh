#!/bin/bash

# 伊朗情报看板数据保护脚本
# 防止误修改数据文件

PROTECTED_FILES=(
  "data/news.json"
  "data/polymarket.json"
  "data/assets.json"
  "data/phase-analysis.json"
)

# 检查是否在保护列表中
is_protected() {
  local file="$1"
  for protected in "${PROTECTED_FILES[@]}"; do
    if [[ "$file" == *"$protected"* ]]; then
      return 0
    fi
  done
  return 1
}

# 主逻辑
if [ $# -eq 0 ]; then
  echo "用法: $0 <command> [args...]"
  echo ""
  echo "受保护的数据文件（禁止手工修改）:"
  for file in "${PROTECTED_FILES[@]}"; do
    echo "  - $file"
  done
  echo ""
  echo "如需修改，请使用对应的定时任务或联系管理员"
  exit 1
fi

# 检查命令是否涉及保护文件
for arg in "$@"; do
  if is_protected "$arg"; then
    echo "❌ 错误: $arg 是受保护的数据文件"
    echo ""
    echo "该文件只能通过以下方式修改:"
    echo "  1. 定时任务自动生成"
    echo "  2. 使用特定的子代理任务"
    echo ""
    echo "如需手工修改，请先解除保护或联系管理员"
    exit 1
  fi
done

# 执行原命令
exec "$@"
