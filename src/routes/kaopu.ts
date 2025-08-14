/**
 * 🚀 靠谱新闻数据源 - 基于newsnow项目的成功实现
 * 
 * 特点：
 * 1. 聚合多个新闻源
 * 2. 过滤特定发布者
 * 3. 提供详细的新闻描述
 * 4. 按发布时间排序
 */

import type { ListContext } from "../types.js";
import { defineSource, type NewsItem } from "../utils/defineSource.js";
import { myFetch } from "../utils/myFetch.js";
import { parseTime } from "../utils/dateParser.js";

// 靠谱新闻API响应类型
interface KaopuNewsItem {
  description: string;
  link: string;
  pubDate: string; // ISO日期字符串
  publisher: string;
  title: string;
}

type KaopuResponse = KaopuNewsItem[];

// 靠谱新闻数据源（完全复用newsnow的实现）
const kaopuSource = defineSource(async (): Promise<NewsItem[]> => {
  // 获取多个新闻源的数据（完全复用newsnow的URL）
  const urls = [
    "https://kaopucdn.azureedge.net/jsondata/news_list_beta_hans_0.json",
    "https://kaopucdn.azureedge.net/jsondata/news_list_beta_hans_1.json"
  ];
  
  const responses = await Promise.all(
    urls.map(url => myFetch(url) as Promise<KaopuResponse>)
  );
  
  // 合并所有数据并过滤（完全复用newsnow的逻辑）
  const allNews = responses
    .flat()
    .filter(item => {
      // 过滤掉特定发布者（复用newsnow的过滤逻辑）
      const excludePublishers = ["财新", "公视"];
      return excludePublishers.every(publisher => item.publisher !== publisher);
    })
    .map(item => ({
      id: item.link,
      title: item.title,
      desc: item.description,
      url: item.link,
      pubDate: parseTime(item.pubDate),
      extra: {
        info: item.publisher,
        hover: item.description
      }
    }))
    .sort((a, b) => (b.pubDate as number) - (a.pubDate as number)); // 按时间倒序
  
  return allNews;
}, { cacheTTL: 60 * 30 }); // 缓存30分钟

// 类型映射
const typeMap = {
  'latest': '最新新闻'
};

// 主路由处理函数
export const handleRoute = async (c: ListContext) => {
  const type = c.req.query("type") || "latest";
  
  // 获取数据
  const data = await kaopuSource();
  
  const routeData = {
    name: "kaopu",
    title: "靠谱新闻",
    type: typeMap[type as keyof typeof typeMap] || "最新新闻",
    params: {
      type: {
        name: "新闻分类",
        type: typeMap,
      },
    },
    link: "https://kaopu.news/",
    total: data.length,
    updateTime: new Date().toISOString(),
    data: data.map((item, index) => ({
      ...item,
      hot: index + 1, // 使用排序位置作为热度
      timestamp: item.pubDate,
      mobileUrl: item.url,
      author: item.extra?.info || '' // 发布者作为作者
    }))
  };
  
  return routeData;
};

// 导出数据源定义
export const kaopuDataSource = kaopuSource;
