import type { RouterData } from "../types.js";
import type { RouterType } from "../router.types.js";
import { get } from "../utils/getData.js";
import { getTime } from "../utils/getTime.js";

export const handleRoute = async (_: undefined, noCache: boolean) => {
  const listData = await getList(noCache);
  const routeData: RouterData = {
    name: "huxiu",
    title: "虎嗅",
    type: "24小时",
    link: "https://www.huxiu.com/moment/",
    total: listData.data?.length || 0,
    ...listData,
  };
  return routeData;
};

// 标题处理
const titleProcessing = (text: string) => {
  const paragraphs = text.split("<br><br>");
  const title = paragraphs.shift()?.replace(/。$/, "");
  const intro = paragraphs.join("<br><br>");
  return { title, intro };
};

const getList = async (noCache: boolean) => {
  try {
    const url = `https://www.huxiu.com/moment/`;
    const result = await get({
      url,
      noCache,
      ttl: 600,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://www.huxiu.com/",
      }
    });
    // 正则查找
    const pattern =
      /<script>[\s\S]*?window\.__INITIAL_STATE__\s*=\s*(\{[\s\S]*?\});[\s\S]*?<\/script>/;
    const matchResult = result.data.match(pattern);
    if (!matchResult) {
      throw new Error("Failed to parse huxiu data");
    }
    const jsonObject = JSON.parse(matchResult[1]).moment.momentList.moment_list.datalist;
    return {
      ...result,
      data: jsonObject.map((v: any) => ({
        id: v.object_id,
        title: titleProcessing(v.content).title,
        desc: titleProcessing(v.content).intro,
        author: v.user_info.username,
        timestamp: getTime(v.publish_time),
        hot: 0,
        url: v.url || `https://www.huxiu.com/moment/${v.object_id}.html`,
        mobileUrl: v.url || `https://m.huxiu.com/moment/${v.object_id}.html`,
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
