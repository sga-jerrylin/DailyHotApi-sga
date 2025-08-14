/**
 * 🚀 RSS测试数据源 - 基于RSS的稳定数据源
 * 
 * 特点：
 * 1. 使用RSS确保高成功率
 * 2. 多个RSS源聚合
 * 3. 简单可靠的实现
 */

import type { ListContext } from "../types.js";
import { defineRSSSource, combineSource, type NewsItem } from "../utils/defineSource.js";

// 多个RSS数据源
const rssFeeds = [
  "https://feeds.feedburner.com/oreilly/radar",
  "https://www.reddit.com/r/programming/.rss",
  "https://feeds.feedburner.com/tweakers/mixed"
];

// 创建RSS数据源
const rssSource1 = defineRSSSource("https://feeds.feedburner.com/oreilly/radar", { limit: 10 });
const rssSource2 = defineRSSSource("https://www.reddit.com/r/programming/.rss", { limit: 10 });

// 组合数据源
const combinedRSSSource = combineSource([rssSource1, rssSource2], { cacheTTL: 60 * 20 });

// 类型映射
const typeMap = {
  'tech': '科技新闻'
};

// 主路由处理函数
export const handleRoute = async (c: ListContext) => {
  const type = c.req.query("type") || "tech";
  
  // 获取数据
  const data = await combinedRSSSource();
  
  const routeData = {
    name: "rss-test",
    title: "RSS聚合",
    type: typeMap[type as keyof typeof typeMap] || "科技新闻",
    params: {
      type: {
        name: "榜单分类",
        type: typeMap,
      },
    },
    link: "https://feeds.feedburner.com/oreilly/radar",
    total: data.length,
    updateTime: new Date().toISOString(),
    data: data.map((item, index) => ({
      ...item,
      hot: index + 1,
      timestamp: item.pubDate,
      mobileUrl: item.url
    }))
  };
  
  return routeData;
};

// 导出数据源定义
export const rssTestDataSource = combinedRSSSource;
