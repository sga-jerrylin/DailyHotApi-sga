/**
 * 🚀 快牛财经数据源 - 基于newsnow项目的成功实现
 */

import type { ListContext } from "../types.js";
import { defineHTMLSource, type NewsItem } from "../utils/defineSource.js";
import * as cheerio from "cheerio";

// 快讯数据源
const expressSource = defineHTMLSource(
  "https://www.fastbull.com/cn/express-news",
  (html: string): NewsItem[] => {
    const $ = cheerio.load(html);
    const baseURL = "https://www.fastbull.com";
    const $main = $(".news-list");
    const news: NewsItem[] = [];
    
    $main.each((_, el) => {
      const a = $(el).find(".title_name");
      const url = a.attr("href");
      const titleText = a.text();
      const title = titleText.match(/【(.+)】/)?.[1] ?? titleText;
      const date = $(el).attr("data-date");
      
      if (url && title && date) {
        news.push({
          id: url,
          title: title.length < 4 ? titleText : title,
          desc: '',
          url: baseURL + url,
          pubDate: Number(date),
          extra: {
            info: new Date(Number(date)).toLocaleString(),
            hover: title
          }
        });
      }
    });
    
    return news;
  },
  { cacheTTL: 60 * 15 }
);

// 新闻数据源
const newsSource = defineHTMLSource(
  "https://www.fastbull.com/cn/news",
  (html: string): NewsItem[] => {
    const $ = cheerio.load(html);
    const baseURL = "https://www.fastbull.com";
    const $main = $(".trending_type");
    const news: NewsItem[] = [];
    
    $main.each((_, el) => {
      const a = $(el);
      const url = a.attr("href");
      const title = a.find(".title").text();
      const date = a.find("[data-date]").attr("data-date");
      
      if (url && title && date) {
        news.push({
          id: url,
          title,
          desc: '',
          url: baseURL + url,
          pubDate: Number(date),
          extra: {
            info: new Date(Number(date)).toLocaleString(),
            hover: title
          }
        });
      }
    });
    
    return news;
  },
  { cacheTTL: 60 * 15 }
);

const typeMap = {
  'express': '快讯',
  'news': '新闻'
};

export const handleRoute = async (c: ListContext) => {
  const type = c.req.query("type") || "express";
  
  let data: NewsItem[];
  if (type === 'news') {
    data = await newsSource();
  } else {
    data = await expressSource();
  }
  
  return {
    name: "fastbull",
    title: "快牛财经",
    type: typeMap[type as keyof typeof typeMap] || "快讯",
    params: {
      type: {
        name: "榜单分类",
        type: typeMap,
      },
    },
    link: "https://www.fastbull.com/",
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

export const fastbullDataSource = { express: expressSource, news: newsSource };
