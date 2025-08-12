#!/bin/bash

# SGA DailyHot AI 热点监控平台健康检查脚本

echo "🔍 SGA DailyHot AI 平台健康检查..."
echo ""

# 检查Docker容器状态
echo "📦 检查Docker容器状态："
docker-compose ps

echo ""

# 检查前端服务
echo "🌐 检查前端服务 (http://localhost:3000)："
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 | grep -q "200"; then
    echo "✅ 前端服务正常"
else
    echo "❌ 前端服务异常"
fi

# 检查后端API服务
echo "🔌 检查后端API服务 (http://localhost:6688)："
if curl -s -o /dev/null -w "%{http_code}" http://localhost:6688 | grep -q "200"; then
    echo "✅ 后端API服务正常"
else
    echo "❌ 后端API服务异常"
fi

# 检查聚合数据接口
echo "📊 检查聚合数据接口："
if curl -s -o /dev/null -w "%{http_code}" "http://localhost:6688/aggregate?group=source&per=5" | grep -q "200"; then
    echo "✅ 聚合数据接口正常"
else
    echo "❌ 聚合数据接口异常"
fi

# 检查Redis连接
echo "🗄️ 检查Redis服务："
if docker-compose exec redis redis-cli ping | grep -q "PONG"; then
    echo "✅ Redis服务正常"
else
    echo "❌ Redis服务异常"
fi

echo ""
echo "🎯 快速访问链接："
echo "  前端界面: http://localhost:3000"
echo "  API文档: http://localhost:6688"
echo "  聚合数据: http://localhost:6688/aggregate?group=source&per=5"
echo ""

# 检查日志
echo "📝 最近的服务日志："
echo "--- 后端日志 ---"
docker-compose logs --tail=5 backend
echo ""
echo "--- 前端日志 ---"
docker-compose logs --tail=5 frontend
echo ""

echo "✨ 健康检查完成！"
