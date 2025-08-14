import type { RouterData } from "../types.js";
import type { RouterType } from "../router.types.js";
import { get } from "../utils/getData.js";
import { getTime } from "../utils/getTime.js";
import { config } from "../config.js";
import { myFetch } from "../utils/myFetch.js";
import { simpleFetch } from "../utils/simpleFetch.js";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const listData = await getList(noCache);
  const routeData: RouterData = {
    name: "zhihu",
    title: "知乎",
    type: "热榜",
    link: "https://www.zhihu.com/hot",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

const getList = async (noCache: boolean) => {
  // 🚀 使用简化的fetch，完全模仿newsnow的实现
  const url = `https://www.zhihu.com/api/v3/feed/topstory/hot-list-web?limit=20&desktop=true`;

  const result = await simpleFetch(url, {
    noCache,
    ttl: 600,
    headers: {
      "Referer": "https://www.zhihu.com/",
      ...(config.ZHIHU_COOKIE && {
        Cookie: config.ZHIHU_COOKIE
      })
    }
  });

  return {
    ...result,
    data: result.data.data.map((k: any) => ({
      id: k.target.link.url.match(/(\d+)$/)?.[1] ?? k.target.link.url,
      title: k.target.title_area.text,
      desc: k.target.excerpt_area?.text || "",
      cover: k.target.image_area?.url,
      timestamp: getTime(Date.now()),
      hot: k.target.metrics_area?.text || "",
      url: k.target.link.url,
      mobileUrl: k.target.link.url,
    })),
  };
};
