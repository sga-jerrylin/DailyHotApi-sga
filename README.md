# 🔥 DailyHot API - SGA版

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![API](https://img.shields.io/badge/API-v1.1-green.svg)](./API_GUIDE.md)
[![GitHub Stars](https://img.shields.io/github/stars/sga-jerrylin/DailyHotApi-sga)](https://github.com/sga-jerrylin/DailyHotApi-sga)

一个强大的聚合热点数据API平台，为智能体和开发者提供实时热点数据服务。基于优秀的开源项目 [DailyHot](https://github.com/imsyy/DailyHot) 和 [NewsNow](https://github.com/ourongxing/newsnow) 构建。

## ✨ 特性

- 🚀 **65+数据源聚合** - 覆盖科技、新闻、财经、社区、娱乐等多个领域
- 🤖 **智能体友好** - 专为AI智能体设计的API接口
- ⚡ **高性能缓存** - Redis + NodeCache双重缓存机制
- 🐳 **Docker部署** - 一键部署，开箱即用
- 📊 **分类聚合** - 智能分类，精准推荐
- 🔄 **实时更新** - 自动获取最新热点数据
- 📱 **现代前端** - 基于Next.js的响应式界面
- 🛡️ **稳定可靠** - 完善的错误处理和降级机制

## 🎯 应用场景

- **智能体数据源** - 为AI助手提供实时热点信息
- **内容推荐系统** - 基于热点数据的智能推荐
- **舆情监控** - 实时监控网络热点趋势
- **数据分析** - 热点数据挖掘和分析
- **新闻聚合** - 多平台新闻热点聚合

## 🚀 快速开始

### 方式一：Docker部署（推荐）

```bash
# 克隆项目
git clone https://github.com/sga-jerrylin/DailyHotApi-sga.git
cd DailyHotApi-sga

# 一键启动
docker-compose up -d

# 查看服务状态
docker-compose ps
```

### 方式二：本地开发

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 启动服务
npm start
```

## 📊 服务访问

启动成功后，可以通过以下地址访问：

- **🌐 前端界面**: http://localhost:3000
- **🔌 API服务**: http://localhost:6688
- **📈 Redis缓存**: localhost:6379

## 🔗 API接口

### 核心接口

```bash
# 获取所有数据源
GET /all

# 聚合热点数据（推荐）
GET /aggregate?limit=5&category=tech

# 单个数据源
GET /v2ex?type=hot
GET /github?type=daily
GET /weibo
```

### 智能体集成示例

```python
import requests

# 获取科技热点
response = requests.get("http://localhost:6688/aggregate?category=tech&limit=5")
data = response.json()

for item in data['data']:
    print(f"- {item['title']}")
```

详细的API文档请查看：[📖 智能体API调用指南](./API_GUIDE.md)

## 📋 支持的数据源

### 🔬 科技类 (18个)
- **开发社区**: GitHub、V2EX、掘金、CSDN、HelloGitHub
- **科技媒体**: IT之家、36氪、极客公园、爱范儿、少数派
- **技术论坛**: LinuxDo、NodeSeek、51CTO、数字尾巴、远景论坛

### 📰 新闻类 (15个)  
- **搜索热榜**: 百度热搜、微博热搜
- **新闻媒体**: 腾讯新闻、新浪新闻、网易新闻、澎湃新闻
- **国际媒体**: 纽约时报中文网、联合早报、俄罗斯卫星通讯社

### 💰 财经类 (8个)
- **财经媒体**: 虎嗅、财联社、华尔街见闻、格隆汇
- **投资平台**: 雪球、金十数据、快牛财经

### 👥 社区类 (9个)
- **综合社区**: 知乎、虎扑、NGA、水木社区
- **技术社区**: 全球主机交流、吾爱破解、牛客网

### 🎮 娱乐类 (15个)
- **视频平台**: B站、抖音、快手、AcFun
- **游戏相关**: 原神、崩坏、星穹铁道、英雄联盟、米游社
- **生活平台**: 豆瓣电影、什么值得买、酷安、微信读书

## 🏗️ 项目架构

```
DailyHotApi-sga/
├── src/                    # 后端源码
│   ├── routes/            # 数据源路由
│   ├── utils/             # 工具函数
│   ├── categories.ts      # 数据源分类
│   └── index.ts          # 入口文件
├── dailyhot-fronted/      # 前端项目
├── docker-compose.yml     # Docker编排
├── Dockerfile            # 后端镜像
├── API_GUIDE.md          # API文档
└── README.md             # 项目说明
```

## 🔧 配置说明

### 环境变量

```bash
# 服务配置
PORT=6688                 # API服务端口
CACHE_TTL=3600           # 缓存时间(秒)
REQUEST_TIMEOUT=8000     # 请求超时(毫秒)

# Redis配置
REDIS_HOST=redis         # Redis主机
REDIS_PORT=6379          # Redis端口
REDIS_PASSWORD=          # Redis密码

# 功能开关
USE_LOG_FILE=true        # 启用日志文件
RSS_MODE=false           # RSS模式
DISALLOW_ROBOT=true      # 禁止爬虫
```

### Docker配置

```yaml
# docker-compose.yml
services:
  backend:
    image: dailyhotapi-sga:latest
    ports:
      - "6688:6688"
    environment:
      - REDIS_HOST=redis
    depends_on:
      - redis
  
  frontend:
    image: dailyhot-frontend:latest
    ports:
      - "3000:80"
    depends_on:
      - backend
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

## 🛠️ 开发指南

### 添加新数据源

1. 在 `src/routes/` 目录下创建新的路由文件
2. 在 `src/categories.ts` 中添加到对应分类
3. 实现数据获取和格式化逻辑

```typescript
// src/routes/example.ts
export const handleRoute = async (c: ListContext) => {
  // 实现数据获取逻辑
  return {
    name: "example",
    title: "示例数据源",
    data: [...] // 格式化后的数据
  };
};
```

### 本地调试

```bash
# 启动开发模式
npm run dev

# 运行测试
npm test

# 检查代码质量
npm run lint
```

## 📈 性能优化

- **多级缓存**: Redis + NodeCache双重缓存
- **并发请求**: 支持多数据源并发获取
- **智能降级**: 单个数据源失败不影响整体服务
- **资源优化**: 容器化部署，资源占用低

## 🤝 致谢

本项目基于以下优秀的开源项目构建：

- **[DailyHot](https://github.com/imsyy/DailyHot)** - 提供了丰富的数据源和基础架构
- **[NewsNow](https://github.com/ourongxing/newsnow)** - 提供了现代化的前端设计和架构思路

感谢这些项目的作者和贡献者们的无私奉献，让我们能够站在巨人的肩膀上构建更好的产品。

## 📄 开源协议

本项目采用 [MIT License](./LICENSE) 开源协议。

## 🔗 相关链接

- **项目地址**: https://github.com/sga-jerrylin/DailyHotApi-sga
- **API文档**: [智能体API调用指南](./API_GUIDE.md)
- **问题反馈**: [GitHub Issues](https://github.com/sga-jerrylin/DailyHotApi-sga/issues)
- **原项目**: [DailyHot](https://github.com/imsyy/DailyHot) | [NewsNow](https://github.com/ourongxing/newsnow)

## 🌟 Star History

如果这个项目对你有帮助，请给我们一个 ⭐ Star！

---

**Made with ❤️ by SGA Team**
