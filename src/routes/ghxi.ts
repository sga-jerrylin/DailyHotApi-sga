/**
 * 🚀 GitHub中文社区数据源 - 基于newsnow项目的成功实现
 */

import type { ListContext } from "../types.js";
import { defineHTMLSource, type NewsItem } from "../utils/defineSource.js";
import { parseRelativeDate } from "../utils/dateParser.js";
import * as cheerio from "cheerio";

// GitHub中文社区数据源
const ghxiSource = defineHTMLSource(
  "https://www.ghxi.com/category/all",
  (html: string): NewsItem[] => {
    const $ = cheerio.load(html);
    const news: NewsItem[] = [];
    
    $(".sec-panel .sec-panel-body .post-loop li").each((_, elem) => {
      let title = $(elem).find(".item-content .item-title").text();
      if (title) {
        title = title.trim().replaceAll("'", "''");
      }
      
      let description = $(elem).find(".item-content .item-excerpt").text();
      if (description) {
        description = description.trim().replaceAll("'", "''");
      }
      
      const date = $(elem).find(".item-content .date").text();
      const url = $(elem).find(".item-content .item-title a").attr("href");
      
      if (url && title) {
        news.push({
          id: url,
          title,
          desc: description,
          url,
          pubDate: parseRelativeDate(date).valueOf(),
          extra: {
            hover: description,
            info: date
          }
        });
      }
    });

    return news.sort((a, b) => (b.pubDate as number) - (a.pubDate as number));
  },
  { cacheTTL: 60 * 30 }
);

const typeMap = {
  'latest': '最新'
};

export const handleRoute = async (c: ListContext) => {
  const type = c.req.query("type") || "latest";
  const data = await ghxiSource();
  
  return {
    name: "ghxi",
    title: "GitHub中文社区",
    type: typeMap[type as keyof typeof typeMap] || "最新",
    params: {
      type: {
        name: "榜单分类",
        type: typeMap,
      },
    },
    link: "https://www.ghxi.com/",
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

export const ghxiDataSource = ghxiSource;
