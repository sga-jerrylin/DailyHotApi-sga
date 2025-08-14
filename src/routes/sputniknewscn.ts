/**
 * 🚀 俄罗斯卫星通讯社中文网数据源 - 基于newsnow项目的成功实现
 */

import type { ListContext } from "../types.js";
import { defineHTMLSource, type NewsItem } from "../utils/defineSource.js";
import * as cheerio from "cheerio";

// 俄罗斯卫星通讯社中文网数据源
const sputniknewscnSource = defineHTMLSource(
  "https://sputniknews.cn/services/widget/lenta/",
  (html: string): NewsItem[] => {
    const $ = cheerio.load(html);
    const $items = $(".lenta__item");
    const news: NewsItem[] = [];
    
    $items.each((_, el) => {
      const $el = $(el);
      const $a = $el.find("a");
      const url = $a.attr("href");
      const title = $a.find(".lenta__item-text").text();
      const date = $a.find(".lenta__item-date").attr("data-unixtime");
      
      if (url && title && date) {
        const timestamp = new Date(Number(`${date}000`)).getTime();
        news.push({
          id: url,
          title,
          desc: '',
          url: `https://sputniknews.cn${url}`,
          pubDate: timestamp,
          extra: {
            info: new Date(timestamp).toLocaleDateString(),
            hover: title
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
  const data = await sputniknewscnSource();
  
  return {
    name: "sputniknewscn",
    title: "俄罗斯卫星通讯社中文网",
    type: typeMap[type as keyof typeof typeMap] || "最新",
    params: {
      type: {
        name: "榜单分类",
        type: typeMap,
      },
    },
    link: "https://sputniknews.cn/",
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

export const sputniknewscnDataSource = sputniknewscnSource;
