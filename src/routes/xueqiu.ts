import type { RouterData } from "../types.js";
import { get } from "../utils/getData.js";
import { myFetch } from "../utils/myFetch.js";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const listData = await getList(noCache);
  const routeData: RouterData = {
    name: "xueqiu",
    title: "雪球",
    type: "热门股票",
    link: "https://xueqiu.com/hq",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

const getList = async (noCache: boolean) => {
  try {
    // 🚀 优化：使用雪球热门股票API
    const url = "https://stock.xueqiu.com/v5/stock/hot_stock/list.json?size=30&_type=10&type=10";
    
    // 🚀 修复：使用newsnow的cookie获取方法
    const cookieResponse = await myFetch.raw("https://xueqiu.com/hq");
    const cookies = cookieResponse.headers.getSetCookie();

    const res = await myFetch(url, {
      headers: {
        cookie: cookies.join("; "),
        "Referer": "https://xueqiu.com/",
      },
    });
    
    return {
      fromCache: false,
      updateTime: new Date().toISOString(),
      data: res.data.items
        .filter((k: any) => !k.ad) // 过滤广告
        .map((k: any) => ({
          id: k.code,
          title: k.name,
          desc: `${k.percent}% ${k.exchange}`,
          timestamp: Date.now(),
          url: `https://xueqiu.com/s/${k.code}`,
          mobileUrl: `https://xueqiu.com/s/${k.code}`,
          hot: Math.abs(k.percent), // 使用涨跌幅作为热度
        })),
    };
  } catch (error) {
    // 降级到原有方法
    const result = await get({
      url: "https://xueqiu.com/hq",
      noCache,
      ttl: 300, // 5分钟缓存，股票数据更新频繁
    });
    
    // 如果API失败，返回空数据但不报错
    return {
      ...result,
      data: [],
    };
  }
};
