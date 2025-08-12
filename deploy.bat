@echo off
chcp 65001 >nul
echo.
echo 🚀 开始部署 SGA DailyHot AI 热点监控平台...
echo.

REM 检查Docker是否运行
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker 未运行，请先启动 Docker Desktop
    pause
    exit /b 1
)

REM 检查docker-compose是否可用
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ docker-compose 未安装或不可用
    pause
    exit /b 1
)

echo 📦 停止现有容器...
docker-compose down --remove-orphans

echo.
echo 🔨 构建后端镜像...
docker-compose build backend
if %errorlevel% neq 0 (
    echo ❌ 后端镜像构建失败
    pause
    exit /b 1
)

echo.
echo 🎨 构建前端镜像...
docker-compose build frontend
if %errorlevel% neq 0 (
    echo ❌ 前端镜像构建失败
    pause
    exit /b 1
)

echo.
echo 🗄️ 启动Redis缓存服务...
docker-compose up -d redis

echo.
echo ⏳ 等待Redis启动...
timeout /t 5 /nobreak >nul

echo.
echo 🚀 启动后端API服务...
docker-compose up -d backend

echo.
echo ⏳ 等待后端服务启动...
timeout /t 10 /nobreak >nul

echo.
echo 🌐 启动前端服务...
docker-compose up -d frontend

echo.
echo ⏳ 等待前端服务启动...
timeout /t 5 /nobreak >nul

echo.
echo 🔍 检查服务状态...
docker-compose ps

echo.
echo 🎉 部署完成！
echo.
echo 📊 服务访问地址：
echo   🌐 前端界面: http://localhost:3000
echo   🔌 API服务: http://localhost:6688
echo   📈 Redis缓存: localhost:6379
echo.
echo 🔧 管理命令：
echo   查看日志: docker-compose logs -f
echo   停止服务: docker-compose down
echo   重启服务: docker-compose restart
echo.
echo ✨ SGA AI 热点分析功能已启用，支持 DeepSeek AI 深度分析！
echo.
pause
