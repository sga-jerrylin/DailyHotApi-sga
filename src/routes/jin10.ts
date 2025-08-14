import type { RouterData } from "../types.js";
import { get } from "../utils/getData.js";
import { getTime } from "../utils/getTime.js";
import { simpleFetch } from "../utils/simpleFetch.js";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const listData = await getList(noCache);
  const routeData: RouterData = {
    name: "jin10",
    title: "金十数据",
    type: "财经快讯",
    link: "https://www.jin10.com/",
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
  // 🚀 使用简化的fetch，完全模仿newsnow的实现
  const timestamp = Date.now();
  const url = `https://www.jin10.com/flash_newest.js?t=${timestamp}`;

  const result = await simpleFetch(url, {
    noCache,
    ttl: 300,
  });

  // 解析JS变量
  const jsonStr = (result.data as string)
    .replace(/^var\s+newest\s*=\s*/, "") // 移除开头的变量声明
    .replace(/;*$/, "") // 移除末尾可能存在的分号
    .trim(); // 移除首尾空白字符

  const data = JSON.parse(jsonStr);

  return {
    ...result,
    data: data
      .filter((k: any) => (k.data.title || k.data.content) && !k.channel?.includes(5)) // 过滤无标题和广告
      .map((k: any) => {
        const text = (k.data.title || k.data.content).replace(/<\/?b>/g, "");
        const match = text.match(/^【([^】]*)】(.*)$/);
        const title = match ? match[1] : text;
        const desc = match ? match[2] : "";

        return {
          id: k.id,
          title: title,
          desc: desc,
          timestamp: getTime(parseRelativeTime(k.time).getTime()),
          url: `https://flash.jin10.com/detail/${k.id}`,
          mobileUrl: `https://flash.jin10.com/detail/${k.id}`,
          hot: k.important ? 1 : 0, // 重要新闻标记
        };
      }),
  };
};
