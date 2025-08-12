# 🚀 SGA DailyHot AI 热点监控平台 - Docker 部署指南

## 📋 项目概述

SGA DailyHot AI 是一个基于人工智能的中文热点监控平台，集成了：

- 🌟 **星辰大海界面** - 120+动画元素的宇宙主题UI
- 🤖 **DeepSeek AI分析** - 真正的AI热点趋势分析
- 📊 **35个数据源** - 覆盖科技、新媒体、实时新闻、财经四大分类
- 🔄 **实时更新** - Redis缓存 + 流式数据处理

## 🏗️ 架构说明

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   前端服务       │    │   后端API       │    │   Redis缓存     │
│   (Nginx)       │────│   (Node.js)     │────│   (Redis)       │
│   Port: 3000    │    │   Port: 6688    │    │   Port: 6379    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 快速部署

### 1. 环境要求

- Docker >= 20.0
- Docker Compose >= 2.0
- 至少 2GB 可用内存
- 至少 5GB 可用磁盘空间

### 2. 克隆项目

```bash
git clone https://github.com/sga-jerrylin/DailyHotApi-sga.git
cd DailyHotApi-sga
```

### 3. 一键部署

#### Linux/macOS:
```bash
# 给脚本执行权限
chmod +x docker-deploy.sh

# 执行部署
./docker-deploy.sh
```

#### Windows:
```cmd
# 直接运行批处理文件
deploy.bat
```

### 4. 访问服务

- 🌐 **前端界面**: http://localhost:3000
- 🔌 **API服务**: http://localhost:6688
- 📊 **聚合数据**: http://localhost:6688/aggregate?group=source&per=5

## 🔧 管理命令

### 查看服务状态
```bash
docker-compose ps
```

### 查看日志
```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f redis
```

### 重启服务
```bash
# 重启所有服务
docker-compose restart

# 重启特定服务
docker-compose restart backend
docker-compose restart frontend
```

### 停止服务
```bash
docker-compose down
```

### 完全清理
```bash
# 停止并删除所有容器、网络、镜像
docker-compose down --rmi all --volumes --remove-orphans
```

## 🔍 健康检查

#### Linux/macOS:
```bash
chmod +x health-check.sh
./health-check.sh
```

#### Windows:
```cmd
health-check.bat
```

## ⚙️ 配置说明

### 环境变量配置

主要配置文件：`.env.docker`

```bash
# 服务端口
PORT=6688

# 允许的域名
ALLOWED_DOMAIN="*"
ALLOWED_HOST="*"

# Redis配置
REDIS_HOST="redis"
REDIS_PORT=6379

# 缓存时长（秒）
CACHE_TTL=3600

# 请求超时（毫秒）
REQUEST_TIMEOUT=8000
```

### 自定义配置

如需修改配置，编辑 `.env.docker` 文件后重新构建：

```bash
docker-compose down
docker-compose build
docker-compose up -d
```

## 🤖 AI 分析功能

### DeepSeek AI 集成

- **模型**: deepseek-chat
- **API Key**: 已内置（前端直接调用）
- **分析维度**: 5大维度深度分析
- **输出方式**: 流式实时显示

### 使用方法

1. 访问前端界面 http://localhost:3000
2. 点击 "开始 DeepSeek AI 分析" 按钮
3. 等待AI分析完成（约30-60秒）
4. 查看详细的热点趋势分析报告

## 🐛 故障排除

### 常见问题

1. **端口冲突**
   ```bash
   # 检查端口占用
   netstat -tulpn | grep :3000
   netstat -tulpn | grep :6688
   ```

2. **内存不足**
   ```bash
   # 检查Docker内存使用
   docker stats
   ```

3. **网络问题**
   ```bash
   # 重建网络
   docker-compose down
   docker network prune
   docker-compose up -d
   ```

### 日志分析

```bash
# 查看详细错误日志
docker-compose logs --tail=100 backend | grep ERROR
docker-compose logs --tail=100 frontend | grep error
```

## 📈 性能优化

### 生产环境建议

1. **增加缓存时间**
   ```bash
   # 修改 .env.docker
   CACHE_TTL=7200  # 2小时
   ```

2. **调整请求超时**
   ```bash
   REQUEST_TIMEOUT=10000  # 10秒
   ```

3. **Redis持久化**
   ```bash
   # 在 docker-compose.yml 中添加
   volumes:
     - redis-data:/data
   ```

## 🔒 安全建议

1. **生产环境部署**
   - 修改默认端口
   - 配置防火墙规则
   - 使用HTTPS
   - 定期更新镜像

2. **API安全**
   - 配置访问域名限制
   - 添加API限流
   - 监控异常请求

## 📞 技术支持

- **项目地址**: https://github.com/sga-jerrylin/DailyHotApi-sga
- **问题反馈**: GitHub Issues
- **技术交流**: 欢迎提交PR

---

🌟 **SGA AI 驱动，星辰大海无限！** 🌟
