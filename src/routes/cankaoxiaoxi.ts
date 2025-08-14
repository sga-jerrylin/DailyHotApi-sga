/**
 * 🚀 参考消息数据源 - 基于newsnow项目的成功实现
 */

import type { ListContext } from "../types.js";
import { defineSource, type NewsItem } from "../utils/defineSource.js";
import { myFetch } from "../utils/myFetch.js";

interface CankaoxiaoxiResponse {
  list: {
    data: {
      id: string;
      title: string;
      url: string;
      publishTime: string;
    };
  }[];
}

// 参考消息数据源（完全复用newsnow的实现）
const cankaoxiaoxiSource = defineSource(async (): Promise<NewsItem[]> => {
  const channels = ["zhongguo", "guandian", "gj"];
  
  const responses = await Promise.all(
    channels.map(channel => 
      myFetch(`https://china.cankaoxiaoxi.com/json/channel/${channel}/list.json`) as Promise<CankaoxiaoxiResponse>
    )
  );
  
  const allNews = responses
    .map(res => res.list)
    .flat()
    .map(item => ({
      id: item.data.id,
      title: item.data.title,
      desc: '',
      url: item.data.url,
      pubDate: new Date(item.data.publishTime).getTime(),
      extra: {
        info: new Date(item.data.publishTime).toLocaleDateString(),
        hover: item.data.title
      }
    }))
    .sort((a, b) => (b.pubDate as number) - (a.pubDate as number));
  
  return allNews;
}, { cacheTTL: 60 * 30 });

const typeMap = {
  'latest': '最新'
};

export const handleRoute = async (c: ListContext) => {
  const type = c.req.query("type") || "latest";
  const data = await cankaoxiaoxiSource();
  
  return {
    name: "cankaoxiaoxi",
    title: "参考消息",
    type: typeMap[type as keyof typeof typeMap] || "最新",
    params: {
      type: {
        name: "榜单分类",
        type: typeMap,
      },
    },
    link: "https://china.cankaoxiaoxi.com/",
    total: data.length,
    updateTime: new Date().toISOString(),
    data: data.map((item, index) => ({
      ...item,
      hot: index + 1,
      timestamp: item.pubDate,
      mobileUrl: item.url
    }))
  };
};

export const cankaoxiaoxiDataSource = cankaoxiaoxiSource;
