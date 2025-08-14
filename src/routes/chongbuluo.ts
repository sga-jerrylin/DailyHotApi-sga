/**
 * 🚀 虫部落数据源 - 基于newsnow项目的成功实现
 */

import type { ListContext } from "../types.js";
import { defineHTMLSource, defineRSSSource, type NewsItem } from "../utils/defineSource.js";
import * as cheerio from "cheerio";

// 热门数据源
const hotSource = defineHTMLSource(
  "https://www.chongbuluo.com/forum.php?mod=guide&view=hot",
  (html: string): NewsItem[] => {
    const $ = cheerio.load(html);
    const baseUrl = "https://www.chongbuluo.com/";
    const news: NewsItem[] = [];

    $(".bmw table tr").each((_, elem) => {
      const xst = $(elem).find(".common .xst").text();
      const url = $(elem).find(".common a").attr("href");
      
      if (xst && url) {
        news.push({
          id: baseUrl + url,
          title: xst,
          desc: '',
          url: baseUrl + url,
          extra: {
            hover: xst,
          }
        });
      }
    });

    return news;
  },
  { cacheTTL: 60 * 30 }
);

// 最新数据源
const latestSource = defineRSSSource(
  "https://www.chongbuluo.com/forum.php?mod=rss&view=newthread",
  { limit: 20, cacheTTL: 60 * 20 }
);

const typeMap = {
  'hot': '热门',
  'latest': '最新'
};

export const handleRoute = async (c: ListContext) => {
  const type = c.req.query("type") || "hot";
  
  let data: NewsItem[];
  if (type === 'latest') {
    data = await latestSource();
  } else {
    data = await hotSource();
  }
  
  return {
    name: "chongbuluo",
    title: "虫部落",
    type: typeMap[type as keyof typeof typeMap] || "热门",
    params: {
      type: {
        name: "榜单分类",
        type: typeMap,
      },
    },
    link: "https://www.chongbuluo.com/",
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

export const chongbuluoDataSource = { hot: hotSource, latest: latestSource };
