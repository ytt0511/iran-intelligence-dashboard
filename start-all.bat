@echo off
echo ========================================
echo    伊朗情报看板 - 一键启动
echo ========================================
echo.

echo [1] 检查数据服务依赖...
if not exist "data-service\node_modules" (
    echo     - 数据服务未安装依赖，正在安装...
    cd data-service
    call npm install
    cd ..
) else (
    echo     - 数据服务依赖已安装
)

echo.
echo [2] 检查前端依赖...
if not exist "frontend\node_modules" (
    echo     - 前端未安装依赖，正在安装...
    cd frontend
    call npm install
    cd ..
) else (
    echo     - 前端依赖已安装
)

echo.
echo [3] 配置前端环境变量...
if not exist "frontend\.env.local" (
    copy frontend\.env.example frontend\.env.local
    echo     - 已创建 .env.local 文件
) else (
    echo     - .env.local 文件已存在
)

echo.
echo [4] 启动数据服务（端口 3001）...
start "数据服务" cmd /k "cd data-service && npm start && pause"

echo.
echo [5] 等待数据服务启动...
timeout /t 3 /nobreak > nul

echo.
echo [6] 启动前端服务（端口 3000）...
start "前端" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo    服务启动完成！
echo ========================================
echo.
echo 数据服务: http://localhost:3001
echo 前端应用: http://localhost:3000
echo.
echo 按任意键关闭提示窗口...
pause > nul
