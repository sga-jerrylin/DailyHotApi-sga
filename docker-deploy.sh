#!/bin/bash

# SGA DailyHot AI 热点监控平台 Docker 部署脚本

set -e

echo "🚀 开始部署 SGA DailyHot AI 热点监控平台..."

# 检查Docker是否运行
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker 未运行，请先启动 Docker"
    exit 1
fi

# 检查docker-compose是否可用
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose 未安装"
    exit 1
fi

echo "📦 停止现有容器..."
docker-compose down --remove-orphans

echo "🔨 构建后端镜像..."
docker-compose build backend

echo "🎨 构建前端镜像..."
docker-compose build frontend

echo "🗄️ 启动Redis缓存服务..."
docker-compose up -d redis

echo "⏳ 等待Redis启动..."
sleep 5

echo "🚀 启动后端API服务..."
docker-compose up -d backend

echo "⏳ 等待后端服务启动..."
sleep 10

echo "🌐 启动前端服务..."
docker-compose up -d frontend

echo "⏳ 等待前端服务启动..."
sleep 5

echo "🔍 检查服务状态..."
docker-compose ps

echo ""
echo "🎉 部署完成！"
echo ""
echo "📊 服务访问地址："
echo "  🌐 前端界面: http://localhost:3000"
echo "  🔌 API服务: http://localhost:6688"
echo "  📈 Redis缓存: localhost:6379"
echo ""
echo "🔧 管理命令："
echo "  查看日志: docker-compose logs -f"
echo "  停止服务: docker-compose down"
echo "  重启服务: docker-compose restart"
echo ""
echo "✨ SGA AI 热点分析功能已启用，支持 DeepSeek AI 深度分析！"
