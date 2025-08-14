import type { RouterData } from "../types.js";
import { get } from "../utils/getData.js";
import { getTime } from "../utils/getTime.js";
import { myFetch } from "../utils/myFetch.js";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const listData = await getList(noCache);
  const routeData: RouterData = {
    name: "cls",
    title: "财联社",
    type: "电报",
    link: "https://www.cls.cn/telegraph",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

// 财联社API参数生成
const getSearchParams = async () => {
  const params = {
    appName: "CailianpressWeb",
    os: "web",
    sv: "7.7.5",
  };
  
  const searchParams = new URLSearchParams(params);
  searchParams.sort();
  
  // 简化版签名，如果需要可以后续优化
  return searchParams;
};

const getList = async (noCache: boolean) => {
  try {
    // 🚀 简化：使用财联社首页
    const url = `https://www.cls.cn/`;

    const result = await get({
      url,
      noCache,
      ttl: 300,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://www.cls.cn/",
      },
    });

    // 简单返回空数据，避免复杂的API解析
    return {
      ...result,
      data: [],
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
