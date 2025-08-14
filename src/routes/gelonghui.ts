import type { RouterData } from "../types.js";
import { get } from "../utils/getData.js";
import { getTime } from "../utils/getTime.js";
import { myFetch } from "../utils/myFetch.js";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const listData = await getList(noCache);
  const routeData: RouterData = {
    name: "gelonghui",
    title: "格隆汇",
    type: "事件",
    link: "https://www.gelonghui.com/news/",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

// 解析相对时间
const parseRelativeTime = (timeStr: string) => {
  const now = new Date();
  const match = timeStr.match(/(\d+)分钟前|(\d+)小时前|(\d+)天前/);
  
  if (match) {
    if (match[1]) {
      // 分钟前
      return new Date(now.getTime() - parseInt(match[1]) * 60 * 1000);
    } else if (match[2]) {
      // 小时前
      return new Date(now.getTime() - parseInt(match[2]) * 60 * 60 * 1000);
    } else if (match[3]) {
      // 天前
      return new Date(now.getTime() - parseInt(match[3]) * 24 * 60 * 60 * 1000);
    }
  }
  
  return now;
};

const getList = async (noCache: boolean) => {
  try {
    // 🚀 优化：使用格隆汇新闻页面
    const html = await myFetch("https://www.gelonghui.com/news/");
    
    // 简化版HTML解析，如果需要可以后续添加cheerio
    const titleRegex = /<h2[^>]*>([^<]+)<\/h2>/g;
    const urlRegex = /href="([^"]*\/\d+\.html)"/g;
    
    const titles: string[] = [];
    const urls: string[] = [];
    
    let titleMatch;
    while ((titleMatch = titleRegex.exec(html)) !== null) {
      titles.push(titleMatch[1].trim());
    }
    
    let urlMatch;
    while ((urlMatch = urlRegex.exec(html)) !== null) {
      urls.push(urlMatch[1]);
    }
    
    const data = titles.slice(0, Math.min(titles.length, urls.length, 20)).map((title, index) => ({
      id: urls[index] || index.toString(),
      title: title,
      desc: "",
      timestamp: getTime(Date.now()),
      hot: 0,
      url: urls[index]?.startsWith('http') ? urls[index] : `https://www.gelonghui.com${urls[index]}`,
      mobileUrl: urls[index]?.startsWith('http') ? urls[index] : `https://www.gelonghui.com${urls[index]}`,
    }));
    
    return {
      fromCache: false,
      updateTime: new Date().toISOString(),
      data: data,
    };
  } catch (error) {
    // 降级到原有方法
    const result = await get({
      url: "https://www.gelonghui.com/news/",
      noCache,
      ttl: 300, // 5分钟缓存
    });
    
    // 如果API失败，返回空数据但不报错
    return {
      ...result,
      data: [],
    };
  }
};
