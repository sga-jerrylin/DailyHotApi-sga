import type { RouterData, RouterResType } from "../types.js";
import type { RouterType } from "../router.types.js";
import { get } from "../utils/getData.js";
import { getTime } from "../utils/getTime.js";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const listData = await getList(noCache);
  const routeData: RouterData = {
    name: "csdn",
    title: "CSDN",
    type: "排行榜",
    description: "专业开发者社区",
    link: "https://www.csdn.net/",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

const getList = async (noCache: boolean): Promise<RouterResType> => {
  try {
    // 🚀 优化：使用CSDN热榜API
    const url = "https://blog.csdn.net/phoenix/web/blog/hot-rank?page=0&pageSize=30";
    const result = await get({
      url,
      noCache,
      ttl: 600,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://www.csdn.net/",
        "Accept": "application/json, text/plain, */*",
      }
    });

    const list = result.data?.data || [];
    return {
      ...result,
      data: list.map((v: any) => ({
        id: v.productId || v.id,
        title: v.articleTitle || v.title,
        cover: v.picList?.[0] || undefined,
        desc: v.summary || "",
        author: v.nickName || v.author,
        timestamp: getTime(v.period || Date.now()),
        hot: Number(v.hotRankScore || v.viewCount || 0),
        url: v.articleDetailUrl || v.url,
        mobileUrl: v.articleDetailUrl || v.url,
      })),
    };
  } catch (error) {
    // 如果API失败，返回空数据
    return {
      fromCache: false,
      updateTime: new Date().toISOString(),
      data: [],
    };
  }
};
