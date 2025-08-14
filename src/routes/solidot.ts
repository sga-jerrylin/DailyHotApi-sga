import type { RouterData } from "../types.js";
import { get } from "../utils/getData.js";
import { getTime } from "../utils/getTime.js";
import { myFetch } from "../utils/myFetch.js";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const listData = await getList(noCache);
  const routeData: RouterData = {
    name: "solidot",
    title: "Solidot",
    type: "最新",
    link: "https://www.solidot.org/",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

const getList = async (noCache: boolean) => {
  try {
    // 🚀 优化：使用Solidot首页
    const html = await myFetch("https://www.solidot.org/");
    
    // 简化版HTML解析
    const titleRegex = /<div class="bg_htit"[^>]*>.*?<a[^>]*href="([^"]*)"[^>]*>([^<]+)<\/a>/g;
    const timeRegex = /<div class="talk_time"[^>]*>发表于([^<]+)<\/div>/g;
    
    const items: Array<{url: string, title: string, time?: string}> = [];
    
    let match;
    while ((match = titleRegex.exec(html)) !== null) {
      items.push({
        url: match[1],
        title: match[2].trim(),
      });
    }
    
    // 获取时间信息
    const times: string[] = [];
    let timeMatch;
    while ((timeMatch = timeRegex.exec(html)) !== null) {
      times.push(timeMatch[1].trim());
    }
    
    const data = items.slice(0, 20).map((item, index) => ({
      id: item.url,
      title: item.title,
      desc: "",
      timestamp: getTime(Date.now()),
      hot: 0,
      url: item.url.startsWith('http') ? item.url : `https://www.solidot.org${item.url}`,
      mobileUrl: item.url.startsWith('http') ? item.url : `https://www.solidot.org${item.url}`,
    }));
    
    return {
      fromCache: false,
      updateTime: new Date().toISOString(),
      data: data,
    };
  } catch (error) {
    // 降级到原有方法
    const result = await get({
      url: "https://www.solidot.org/",
      noCache,
      ttl: 3600, // 1小时缓存，Solidot更新不频繁
    });
    
    // 如果API失败，返回空数据但不报错
    return {
      ...result,
      data: [],
    };
  }
};
