import type { RouterData } from "../types.js";
import { load } from "cheerio";
import { get } from "../utils/getData.js";
import { getTime } from "../utils/getTime.js";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const listData = await getList(noCache);
  const routeData: RouterData = {
    name: "douban-group",
    title: "豆瓣讨论",
    type: "讨论精选",
    link: "https://www.douban.com/group/explore",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

// 数据处理
const getNumbers = (text: string | undefined) => {
  if (!text) return 100000000;
  const regex = /\d+/;
  const match = text.match(regex);
  if (match) {
    return Number(match[0]);
  } else {
    return 100000000;
  }
};

const getList = async (noCache: boolean) => {
  try {
    const url = `https://www.douban.com/group/explore`;
    const result = await get({
      url,
      noCache,
      ttl: 1800, // 30分钟缓存
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
        "Cache-Control": "no-cache",
      }
    });
  const $ = load(result.data);
  const listDom = $(".article .channel-item");
  const listData = listDom.toArray().map((item) => {
    const dom = $(item);
    const url = dom.find("h3 a").attr("href") || undefined;
    return {
      id: getNumbers(url),
      title: dom.find("h3 a").text().trim(),
      cover: dom.find(".pic-wrap img").attr("src"),
      desc: dom.find(".block p").text().trim(),
      timestamp: getTime(dom.find("span.pubtime").text().trim()),
      hot: 0,
      url: url || `https://www.douban.com/group/topic/${getNumbers(url)}`,
      mobileUrl: `https://m.douban.com/group/topic/${getNumbers(url)}/`,
    };
  });
    return {
      ...result,
      data: listData,
    };
  } catch (error) {
    // 如果请求失败，返回空数据
    return {
      fromCache: false,
      updateTime: new Date().toISOString(),
      data: [],
    };
  }
};
