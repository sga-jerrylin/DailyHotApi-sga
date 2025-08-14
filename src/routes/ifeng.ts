/**
 * 🚀 凤凰网数据源 - 基于newsnow项目的成功实现
 */

import type { ListContext } from "../types.js";
import { defineHTMLSource, type NewsItem } from "../utils/defineSource.js";

// 凤凰网数据源
const ifengSource = defineHTMLSource(
  "https://www.ifeng.com/",
  (html: string): NewsItem[] => {
    const regex = /var\s+allData\s*=\s*(\{[\s\S]*?\});/;
    const match = regex.exec(html);
    const news: NewsItem[] = [];
    
    if (match) {
      try {
        const realData = JSON.parse(match[1]);
        const rawNews = realData.hotNews1 as {
          url: string;
          title: string;
          newsTime: string;
        }[];
        
        if (Array.isArray(rawNews)) {
          rawNews.forEach((hotNews) => {
            if (hotNews.url && hotNews.title) {
              news.push({
                id: hotNews.url,
                title: hotNews.title,
                desc: '',
                url: hotNews.url,
                pubDate: new Date(hotNews.newsTime).getTime(),
                extra: {
                  info: hotNews.newsTime,
                  hover: hotNews.title
                }
              });
            }
          });
        }
      } catch (error) {
        console.error('解析凤凰网数据失败:', error);
      }
    }
    
    return news.sort((a, b) => (b.pubDate as number) - (a.pubDate as number));
  },
  { cacheTTL: 60 * 30 }
);

const typeMap = {
  'hot': '热门'
};

export const handleRoute = async (c: ListContext) => {
  const type = c.req.query("type") || "hot";
  const data = await ifengSource();
  
  return {
    name: "ifeng",
    title: "凤凰网",
    type: typeMap[type as keyof typeof typeMap] || "热门",
    params: {
      type: {
        name: "榜单分类",
        type: typeMap,
      },
    },
    link: "https://www.ifeng.com/",
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

export const ifengDataSource = ifengSource;
