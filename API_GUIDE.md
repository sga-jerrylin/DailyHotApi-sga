# 🤖 智能体API调用指南

## 📖 概述

DailyHot API 为智能体提供了丰富的实时热点数据接口，支持多种数据源和灵活的参数配置。本指南将详细介绍如何在智能体中集成和使用这些API。

## 🚀 快速开始

### 基础URL
```
http://localhost:6688
```

### 获取所有可用数据源
```bash
GET /all
```

**响应示例：**
```json
{
  "code": 200,
  "count": 65,
  "routes": [
    {"name": "36kr", "path": "/36kr"},
    {"name": "v2ex", "path": "/v2ex"},
    {"name": "github", "path": "/github"},
    {"name": "weibo", "path": "/weibo"}
  ]
}
```

## 📊 核心API接口

### 1. 聚合热点API（推荐）
```bash
GET /aggregate
```

**参数：**
- `limit`: 每个数据源返回条数 (默认: 10)
- `category`: 分类筛选 (`tech`, `news`, `finance`, `community`, `entertainment`)

**示例：**
```bash
# 获取所有热点，每个数据源5条
GET /aggregate?limit=5

# 获取科技分类热点
GET /aggregate?category=tech&limit=3
```

### 2. 单个数据源API

#### V2EX社区
```bash
GET /v2ex?type=hot          # 热门主题
GET /v2ex?type=latest       # 最新主题
```

#### GitHub趋势
```bash
GET /github?type=daily      # 日榜
GET /github?type=weekly     # 周榜
GET /github?type=monthly    # 月榜
```

#### 微博热搜
```bash
GET /weibo
```

#### 知乎热榜
```bash
GET /zhihu?type=hot
```

### 3. AI分析API
```bash
GET /ai-analysis
```
返回AI分析的热点趋势和洞察。

## 🔧 通用参数

| 参数 | 类型 | 说明 | 示例 |
|------|------|------|------|
| `limit` | number | 限制返回条数 | `?limit=5` |
| `type` | string | 数据源类型 | `?type=hot` |
| `category` | string | 分类筛选 | `?category=tech` |
| `cache` | boolean | 是否使用缓存 | `?cache=false` |
| `rss` | boolean | 返回RSS格式 | `?rss=true` |

## 💻 编程语言示例

### Python集成
```python
import requests
import json

class DailyHotAPI:
    def __init__(self, base_url="http://localhost:6688"):
        self.base_url = base_url
    
    def get_all_sources(self):
        """获取所有可用数据源"""
        response = requests.get(f"{self.base_url}/all")
        return response.json()
    
    def get_hot_topics(self, source="aggregate", **params):
        """获取热点话题"""
        url = f"{self.base_url}/{source}"
        response = requests.get(url, params=params)
        return response.json()
    
    def get_tech_trends(self, limit=5):
        """获取科技趋势"""
        return self.get_hot_topics("aggregate", category="tech", limit=limit)
    
    def monitor_keywords(self, keywords, limit=50):
        """关键词监控"""
        data = self.get_hot_topics("aggregate", limit=limit)
        alerts = []
        
        for item in data.get('data', []):
            for keyword in keywords:
                if keyword.lower() in item.get('title', '').lower():
                    alerts.append({
                        'keyword': keyword,
                        'item': item
                    })
        return alerts

# 使用示例
api = DailyHotAPI()

# 获取热点数据
hot_data = api.get_hot_topics(limit=5)
print(f"获取到 {hot_data.get('total', 0)} 条热点数据")

# 关键词监控
alerts = api.monitor_keywords(["AI", "区块链", "新能源"])
for alert in alerts:
    print(f"发现关键词 '{alert['keyword']}': {alert['item']['title']}")
```

### JavaScript/Node.js集成
```javascript
class DailyHotAPI {
    constructor(baseUrl = 'http://localhost:6688') {
        this.baseUrl = baseUrl;
    }
    
    async fetchData(endpoint, params = {}) {
        const url = new URL(`${this.baseUrl}/${endpoint}`);
        Object.keys(params).forEach(key => 
            url.searchParams.append(key, params[key])
        );
        
        try {
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            console.error('API请求失败:', error);
            return null;
        }
    }
    
    async getAllSources() {
        return await this.fetchData('all');
    }
    
    async getHotTopics(source = 'aggregate', options = {}) {
        return await this.fetchData(source, options);
    }
    
    async getTechTrends(limit = 5) {
        return await this.fetchData('aggregate', { 
            category: 'tech', 
            limit 
        });
    }
    
    async getMultiSourceData(sources, limit = 5) {
        const results = {};
        for (const source of sources) {
            results[source] = await this.fetchData(source, { limit });
        }
        return results;
    }
}

// 使用示例
const api = new DailyHotAPI();

// 获取多个数据源
api.getMultiSourceData(['v2ex', 'github', 'weibo'], 3)
    .then(data => {
        Object.keys(data).forEach(source => {
            console.log(`${source}: ${data[source]?.total || 0}条数据`);
        });
    });
```

## 🎯 智能体应用场景

### 1. 定时热点监控
```python
import schedule
import time

def daily_trend_monitor():
    api = DailyHotAPI()
    
    # 获取各分类热点
    categories = ['tech', 'news', 'finance']
    for category in categories:
        trends = api.get_hot_topics("aggregate", category=category, limit=5)
        print(f"\n{category.upper()}热点:")
        for item in trends.get('data', []):
            print(f"- {item.get('title', '')}")

# 每小时执行一次
schedule.every().hour.do(daily_trend_monitor)

while True:
    schedule.run_pending()
    time.sleep(60)
```

### 2. 智能推荐系统
```python
def intelligent_recommendation(user_interests):
    api = DailyHotAPI()
    recommendations = []
    
    # 根据用户兴趣获取相关热点
    for interest in user_interests:
        if interest == "technology":
            data = api.get_tech_trends(limit=3)
        elif interest == "social":
            data = api.get_hot_topics("weibo", limit=3)
        elif interest == "development":
            data = api.get_hot_topics("github", limit=3)
        
        if data and 'data' in data:
            recommendations.extend(data['data'])
    
    return recommendations

# 使用示例
user_profile = ["technology", "development"]
recommendations = intelligent_recommendation(user_profile)
```

### 3. 内容分析与洞察
```python
def analyze_trends():
    api = DailyHotAPI()
    
    # 获取AI分析数据
    ai_analysis = api.get_hot_topics("ai-analysis")
    
    # 获取聚合数据进行分析
    aggregate_data = api.get_hot_topics("aggregate", limit=20)
    
    # 简单的热词分析
    word_count = {}
    for item in aggregate_data.get('data', []):
        words = item.get('title', '').split()
        for word in words:
            if len(word) > 2:  # 过滤短词
                word_count[word] = word_count.get(word, 0) + 1
    
    # 返回热词排行
    hot_words = sorted(word_count.items(), key=lambda x: x[1], reverse=True)[:10]
    
    return {
        'ai_insights': ai_analysis,
        'hot_words': hot_words,
        'total_items': len(aggregate_data.get('data', []))
    }
```

## 📈 数据源分类

### 科技类 (tech)
- `github` - GitHub趋势
- `v2ex` - V2EX社区
- `juejin` - 掘金
- `csdn` - CSDN
- `ithome` - IT之家
- `36kr` - 36氪

### 新闻类 (news)
- `weibo` - 微博热搜
- `baidu` - 百度热搜
- `zhihu` - 知乎热榜
- `qq-news` - 腾讯新闻
- `sina-news` - 新浪新闻

### 财经类 (finance)
- `xueqiu` - 雪球
- `wallstreetcn` - 华尔街见闻
- `jin10` - 金十数据

### 社区类 (community)
- `hupu` - 虎扑
- `ngabbs` - NGA
- `hostloc` - 全球主机交流

### 娱乐类 (entertainment)
- `bilibili` - B站
- `douyin` - 抖音
- `acfun` - AcFun

## ⚡ 性能优化建议

1. **使用缓存**: 默认启用缓存，避免频繁请求
2. **合理设置limit**: 根据需要设置合适的数据条数
3. **批量请求**: 使用聚合API减少请求次数
4. **错误处理**: 实现重试机制和降级策略

## 🔒 注意事项

1. **请求频率**: 建议控制请求频率，避免过于频繁的调用
2. **数据时效性**: 数据有缓存机制，实时性可能有延迟
3. **错误处理**: 部分数据源可能临时不可用，需要处理异常情况
4. **数据格式**: 不同数据源返回的字段可能略有差异

## 📞 技术支持

如有问题，请查看：
- 项目文档: README.md
- 问题反馈: GitHub Issues
- API状态: http://localhost:6688/all

---

*本API基于 DailyHot 和 NewsNow 项目构建，感谢开源社区的贡献！*
