/**
 * 🚀 联合早报数据源 - 基于newsnow项目的成功实现
 */

import type { ListContext } from "../types.js";
import { defineSource, type NewsItem } from "../utils/defineSource.js";
import { myFetch } from "../utils/myFetch.js";
import { parseRelativeDate } from "../utils/dateParser.js";
import * as cheerio from "cheerio";

// 联合早报数据源 - 使用正确的官网
const zaobaoSource = defineSource(async (): Promise<NewsItem[]> => {
  try {
    // 使用正确的联合早报官网，并设置正确的编码
    const html: string = await myFetch("https://www.zaobao.com/realtime", {
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const base = "https://www.zaobao.com";
    const $ = cheerio.load(html);
    const news: NewsItem[] = [];

    // 尝试多个可能的选择器
    const selectors = [
      'article.article-item',
      '.article-list .article-item',
      '.news-list .news-item',
      '.realtime-list .item'
    ];

    let $items = $();
    for (const selector of selectors) {
      $items = $(selector);
      if ($items.length > 0) break;
    }

    $items.each((index, el) => {
      const $item = $(el);
      const $link = $item.find('a').first();
      const url = $link.attr('href');
      const title = $link.text().trim() || $item.find('.title, h3, h4').text().trim();
      const timeText = $item.find('.time, .date, .publish-time').text().trim();

      if (url && title) {
        const fullUrl = url.startsWith('http') ? url : base + url;
        news.push({
          id: url,
          title: title,
          desc: '',
          url: fullUrl,
          pubDate: timeText ? parseRelativeDate(timeText, "Asia/Singapore").valueOf() : Date.now(),
          extra: {
            info: timeText || '刚刚',
            hover: title
          }
        });
      }
    });

    // 如果没有找到新闻，尝试备用方案
    if (news.length === 0) {
      console.log('联合早报: 尝试备用选择器');
      $('a').each((_, el) => {
        const $link = $(el);
        const href = $link.attr('href');
        const text = $link.text().trim();

        if (href && text && text.length > 10 && href.includes('/realtime/')) {
          news.push({
            id: href,
            title: text,
            desc: '',
            url: href.startsWith('http') ? href : base + href,
            pubDate: Date.now(),
            extra: {
              info: '最新',
              hover: text
            }
          });
        }
      });
    }

    return news.slice(0, 30).sort((a, b) => (b.pubDate as number) - (a.pubDate as number));
  } catch (error) {
    console.error('获取联合早报数据失败:', error);
    return [];
  }
}, { cacheTTL: 60 * 30 });

const typeMap = {
  'realtime': '实时'
};

export const handleRoute = async (c: ListContext) => {
  const type = c.req.query("type") || "realtime";
  const data = await zaobaoSource();
  
  return {
    name: "zaobao",
    title: "联合早报",
    type: typeMap[type as keyof typeof typeMap] || "实时",
    params: {
      type: {
        name: "榜单分类",
        type: typeMap,
      },
    },
    link: "https://www.zaobao.com/",
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

export const zaobaoDataSource = zaobaoSource;
