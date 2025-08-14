import type { RouterData } from "../types.js";
import { get } from "../utils/getData.js";
import { getTime } from "../utils/getTime.js";
import { parseRSS } from "../utils/parseRSS.js";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const listData = await getList(noCache);
  const routeData: RouterData = {
    name: "nodeseek",
    title: "NodeSeek",
    type: "最新",
    params: {
      type: {
        name: "分类",
        type: {
          all: "所有",
        },
      },
    },
    link: "https://www.nodeseek.com/",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

const getList = async (noCache: boolean) => {
  try {
    const url = `https://rss.nodeseek.com/`;
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
  const list = await parseRSS(result.data);
    return {
      ...result,
      data: list.map((v, i) => ({
        id: v.guid || i,
        title: v.title || "",
        desc: v.content?.trim() || "",
        author: v.author,
        timestamp: getTime(v.pubDate || 0),
        hot: 0,
        url: v.link || "",
        mobileUrl: v.link || "",
      })),
    };
  } catch (error) {
    return {
      fromCache: false,
      updateTime: new Date().toISOString(),
      data: [],
    };
  }
};
