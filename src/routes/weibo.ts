import type { RouterData } from "../types.js";
import type { RouterType } from "../router.types.js";
import { get } from "../utils/getData.js";
import { getTime } from "../utils/getTime.js";
import { simpleFetch } from "../utils/simpleFetch.js";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const listData = await getList(noCache);
  const routeData: RouterData = {
    name: "weibo",
    title: "微博",
    type: "热搜榜",
    description: "实时热点，每分钟更新一次",
    link: "https://s.weibo.com/top/summary/",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

const getList = async (noCache: boolean) => {
  // 🚀 使用简化的fetch，完全模仿newsnow的实现
  const url = "https://m.weibo.cn/api/container/getIndex?containerid=106003type%3D25%26t%3D3%26disable_hot%3D1%26filter_type%3Drealtimehot";

  const result = await simpleFetch(url, {
    noCache,
    ttl: 120,
    headers: {
      "Referer": "https://m.weibo.cn/",
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
      "Accept": "application/json, text/plain, */*",
      "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    }
  });

  const list = result.data.cards[0].card_group
    .filter((k: any, i: number) => i !== 0 && k.desc && !k.actionlog?.ext.includes("ads_word"));

  return {
    ...result,
    data: list.map((k: any) => ({
      id: k.desc,
      title: k.desc,
      desc: `#${k.desc}#`,
      timestamp: getTime(Date.now()),
      url: `https://s.weibo.com/weibo?q=${encodeURIComponent(`#${k.desc}#`)}`,
      mobileUrl: k.scheme,
    })),
  };
};
