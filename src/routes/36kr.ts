import type { RouterData, ListContext, Options, RouterResType } from "../types.js";
import type { RouterType } from "../router.types.js";
import { get, post } from "../utils/getData.js";
import { getTime } from "../utils/getTime.js";

const typeMap: Record<string, string> = {
  hot: "人气榜",
  video: "视频榜",
  comment: "热议榜",
  collect: "收藏榜",
};

export const handleRoute = async (c: ListContext, noCache: boolean) => {
  const type = c.req.query("type") || "hot";
  const listData = await getList({ type }, noCache);
  const routeData: RouterData = {
    name: "36kr",
    title: "36氪",
    type: typeMap[type],
    params: {
      type: {
        name: "热榜分类",
        type: typeMap,
      },
    },
    link: "https://m.36kr.com/hot-list-m",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

const getList = async (options: Options, noCache: boolean): Promise<RouterResType> => {
  try {
    // 🚀 修复：简化为GET请求，使用更稳定的API
    const url = `https://36kr.com/api/search-column/mainsite/flow`;
    const result = await get({
      url,
      noCache,
      ttl: 600,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://36kr.com/",
      },
    });
    const list = result.data?.data?.items || [];
    return {
      ...result,
      data: list.slice(0, 20).map((v: any) => ({
        id: v.id || v.itemId,
        title: v.title || v.templateMaterial?.widgetTitle,
        cover: v.cover || v.templateMaterial?.widgetImage,
        desc: v.summary || v.templateMaterial?.widgetDescription,
        author: v.author?.name || v.templateMaterial?.authorName,
        timestamp: getTime(v.published_at || v.publishTime || Date.now()),
        hot: Number(v.stats?.view || v.statRead || 0),
        url: `https://36kr.com/p/${v.id || v.itemId}`,
        mobileUrl: `https://36kr.com/p/${v.id || v.itemId}`,
      })),
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
