import type { RouterData, ListContext, Options, RouterResType } from "../types.js";
import type { RouterType } from "../router.types.js";
import { get } from "../utils/getData.js";
import { simpleFetch } from "../utils/simpleFetch.js";

const typeMap: Record<string, string> = {
  realtime: "热搜",
  novel: "小说",
  movie: "电影",
  teleplay: "电视剧",
  car: "汽车",
  game: "游戏",
};

export const handleRoute = async (c: ListContext, noCache: boolean) => {
  const type = c.req.query("type") || "realtime";
  const listData = await getList({ type }, noCache);
  const routeData: RouterData = {
    name: "baidu",
    title: "百度",
    type: typeMap[type],
    params: {
      type: {
        name: "热搜类别",
        type: typeMap,
      },
    },
    link: "https://top.baidu.com/board",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

const getList = async (options: Options, noCache: boolean): Promise<RouterResType> => {
  // 🚀 修复：使用newsnow的固定参数
  const url = `https://top.baidu.com/board?tab=realtime`;

  const result = await simpleFetch(url, {
    noCache,
    ttl: 600,
    headers: {
      "Referer": "https://www.baidu.com/",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
      "Cache-Control": "no-cache",
    }
  });

  // 解析百度热搜数据
  const jsonStr = (result.data as string).match(/<!--s-data:(.*?)-->/s);
  const data = JSON.parse(jsonStr![1]);

  return {
    ...result,
    data: data.data.cards[0].content
      .filter((k: any) => !k.isTop)
      .map((k: any) => ({
        id: k.rawUrl,
        title: k.word,
        desc: k.desc || "",
        url: k.rawUrl,
        mobileUrl: k.rawUrl,
        hot: Number(k.hotScore || 0),
        timestamp: 0,
      })),
  };
};
