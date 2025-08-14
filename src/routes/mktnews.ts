/**
 * 🚀 MarketNews数据源 - 基于newsnow项目的成功实现
 */

import type { ListContext } from "../types.js";
import { defineAPISource, type NewsItem } from "../utils/defineSource.js";

interface Report {
  id: string;
  type: number;
  time: string;
  important: number;
  data: {
    content: string;
    pic: string;
    title: string;
  };
  remark: string[];
  hot: boolean;
  hot_start: string;
  hot_end: string;
  classify: {
    id: number;
    pid: number;
    name: string;
    parent: string;
  }[];
}

interface MktNewsResponse {
  data: {
    id: number;
    name: string;
    pid: number;
    child: {
      id: number;
      name: string;
      pid: number;
      flash_list: Report[];
    }[];
  }[];
}

// MarketNews快讯数据源
const flashSource = defineAPISource(
  "https://api.mktnews.net/api/flash/host",
  (res: MktNewsResponse): NewsItem[] => {
    const categories = ["policy", "AI", "financial"] as const;
    const typeMap = { policy: "Policy", AI: "AI", financial: "Financial" } as const;

    const allReports = categories.flatMap((category) => {
      const flash_list = res.data.find(item => item.name === category)?.child[0]?.flash_list || [];
      return flash_list.map(item => ({ ...item, type: typeMap[category] }));
    });

    return allReports
      .sort((a, b) => b.time.localeCompare(a.time))
      .map(item => ({
        id: item.id,
        title: item.data.title || item.data.content,
        desc: item.data.content,
        url: `https://mktnews.net/flashDetail.html?id=${item.id}`,
        pubDate: new Date(item.time).getTime(),
        extra: { 
          info: item.type,
          hover: item.data.content
        }
      }));
  },
  { cacheTTL: 60 * 15 }
);

const typeMap = {
  'flash': '快讯'
};

export const handleRoute = async (c: ListContext) => {
  const type = c.req.query("type") || "flash";
  const data = await flashSource();
  
  return {
    name: "mktnews",
    title: "MarketNews",
    type: typeMap[type as keyof typeof typeMap] || "快讯",
    params: {
      type: {
        name: "榜单分类",
        type: typeMap,
      },
    },
    link: "https://mktnews.net/",
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

export const mktnewsDataSource = flashSource;
