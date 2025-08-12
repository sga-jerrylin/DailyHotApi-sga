@echo off
chcp 65001 >nul
echo.
echo 🔍 SGA DailyHot AI 平台健康检查...
echo.

echo 📦 检查Docker容器状态：
docker-compose ps

echo.
echo 🌐 检查前端服务 (http://localhost:3000)：
curl -s -o nul -w "%%{http_code}" http://localhost:3000 | findstr "200" >nul
if %errorlevel% equ 0 (
    echo ✅ 前端服务正常
) else (
    echo ❌ 前端服务异常
)

echo.
echo 🔌 检查后端API服务 (http://localhost:6688)：
curl -s -o nul -w "%%{http_code}" http://localhost:6688 | findstr "200" >nul
if %errorlevel% equ 0 (
    echo ✅ 后端API服务正常
) else (
    echo ❌ 后端API服务异常
)

echo.
echo 📊 检查聚合数据接口：
curl -s -o nul -w "%%{http_code}" "http://localhost:6688/aggregate?group=source&per=5" | findstr "200" >nul
if %errorlevel% equ 0 (
    echo ✅ 聚合数据接口正常
) else (
    echo ❌ 聚合数据接口异常
)

echo.
echo 🗄️ 检查Redis服务：
docker-compose exec redis redis-cli ping | findstr "PONG" >nul
if %errorlevel% equ 0 (
    echo ✅ Redis服务正常
) else (
    echo ❌ Redis服务异常
)

echo.
echo 🎯 快速访问链接：
echo   前端界面: http://localhost:3000
echo   API文档: http://localhost:6688
echo   聚合数据: http://localhost:6688/aggregate?group=source^&per=5
echo.

echo 📝 最近的服务日志：
echo --- 后端日志 ---
docker-compose logs --tail=5 backend
echo.
echo --- 前端日志 ---
docker-compose logs --tail=5 frontend
echo.

echo ✨ 健康检查完成！
pause
