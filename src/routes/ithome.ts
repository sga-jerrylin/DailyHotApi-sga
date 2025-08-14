import type { RouterData } from "../types.js";
import { load } from "cheerio";
import { get } from "../utils/getData.js";
import { getTime } from "../utils/getTime.js";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const listData = await getList(noCache);
  const routeData: RouterData = {
    name: "ithome",
    title: "IT之家",
    type: "热榜",
    description: "爱科技，爱这里 - 前沿科技新闻网站",
    link: "https://m.ithome.com/rankm/",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

// 链接处理
const replaceLink = (url: string, getId: boolean = false) => {
  const match = url.match(/[html|live]\/(\d+)\.htm/);
  // 是否匹配成功
  if (match && match[1]) {
    return getId
      ? match[1]
      : `https://www.ithome.com/0/${match[1].slice(0, 3)}/${match[1].slice(3)}.htm`;
  }
  // 返回原始 URL
  return url;
};

const getList = async (noCache: boolean) => {
  try {
    // 🚀 完全对齐newsnow：使用桌面版URL和选择器
    const url = `https://www.ithome.com/list/`;
    const result = await get({
      url,
      noCache,
      ttl: 600,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
      }
    });

    const $ = load(result.data);
    const listDom = $("#list > div.fl > ul > li");
    const listData = listDom.toArray().map((item) => {
      const dom = $(item);
      const $a = dom.find("a.t");
      const href = $a.attr("href");
      const title = $a.text();
      const date = dom.find("i").text();

      // 完全对齐newsnow的过滤逻辑
      const isAd = href?.includes("lapin") || ["神券", "优惠", "补贴", "京东"].find(k => title.includes(k));
      if (isAd || !href || !title || !date) return null;

      return {
        id: href,
        title: title,
        timestamp: getTime(date),
        hot: 0,
        url: href,
        mobileUrl: href,
      };
    }).filter((item): item is NonNullable<typeof item> => item !== null);

    return {
      ...result,
      data: listData,
    };
  } catch (error) {
    return {
      fromCache: false,
      updateTime: new Date().toISOString(),
      data: [],
    };
  }
};
