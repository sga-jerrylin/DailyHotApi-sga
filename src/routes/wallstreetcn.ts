import type { RouterData } from "../types.js";
import { get } from "../utils/getData.js";
import { getTime } from "../utils/getTime.js";
import { myFetch } from "../utils/myFetch.js";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const listData = await getList(noCache);
  const routeData: RouterData = {
    name: "wallstreetcn",
    title: "华尔街见闻",
    type: "实时快讯",
    link: "https://wallstreetcn.com/",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

const getList = async (noCache: boolean) => {
  try {
    // 🚀 优化：使用华尔街见闻实时快讯API
    const apiUrl = `https://api-one.wallstcn.com/apiv1/content/lives?channel=global-channel&limit=30`;
    
    const res = await myFetch(apiUrl);
    
    return {
      fromCache: false,
      updateTime: new Date().toISOString(),
      data: res.data.items.map((k: any) => ({
        id: k.id,
        title: k.title || k.content_text,
        desc: k.content_short || "",
        timestamp: getTime(k.display_time * 1000),
        url: k.uri,
        mobileUrl: k.uri,
      })),
    };
  } catch (error) {
    // 降级到原有方法
    const result = await get({
      url: "https://wallstreetcn.com/",
      noCache,
      ttl: 300, // 5分钟缓存，财经新闻更新频繁
    });
    
    // 如果API失败，返回空数据但不报错
    return {
      ...result,
      data: [],
    };
  }
};
