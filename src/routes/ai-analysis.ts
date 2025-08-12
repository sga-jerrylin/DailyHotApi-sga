import type { RouterData, ListItem } from "../types.js";
import type { ListContext } from "../types.js";
import { ALL_CATEGORIES, CATEGORY_LABELS, CATEGORY_ROUTES, type CategoryKey } from "../categories.js";
import { get } from "../utils/getData.js";

// 简单去重：按 url 或 title 去重
const deduplicate = (items: ListItem[]): ListItem[] => {
  const seen = new Set<string>();
  const result: ListItem[] = [];
  for (const item of items) {
    const key = (item.url || item.title || "").toLowerCase();
    if (!key) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
};

type RoutePayload = RouterData & { code?: number };

const fetchRoute = async (route: string, noCache: boolean): Promise<RoutePayload | null> => {
  try {
    const result = await get({ url: `http://localhost:${process.env.PORT || 6688}/${route}`, noCache });
    if (result?.data?.code === 200) return result.data as RoutePayload;
    return null;
  } catch {
    return null;
  }
};

export const handleRoute = async (c: ListContext, noCache: boolean) => {
  // AI分析模式：获取所有数据源的前5条数据
  const allSources: Array<{
    route: string;
    title: string;
    category: string;
    updateTime?: string | number;
    data: ListItem[];
    total: number;
  }> = [];
  
  // 遍历所有分类
  for (const categoryKey of ALL_CATEGORIES) {
    const routes = CATEGORY_ROUTES[categoryKey] || [];
    
    // 遍历该分类下的所有数据源
    for (const route of routes) {
      const res = await fetchRoute(route, noCache);
      if (!res?.data?.length) continue;
      
      // 取前5条数据并去重
      const data = deduplicate(res.data.map((x) => ({ ...x }))).slice(0, 5);
      
      allSources.push({
        route,
        title: res.title || route,
        category: CATEGORY_LABELS[categoryKey],
        updateTime: res.updateTime,
        data,
        total: res.total || data.length,
      });
    }
  }

  return {
    name: "ai-analysis",
    title: "AI分析数据",
    type: "AI分析",
    description: "为AI分析准备的热点数据，每个数据源取前5条",
    total: allSources.reduce((acc, source) => acc + source.data.length, 0),
    updateTime: new Date().toISOString(),
    fromCache: false,
    data: allSources.flatMap(source => source.data),
    sources: allSources,
  };
};
