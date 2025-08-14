import type { RouterData, ListItem } from "../types.js";
import type { ListContext } from "../types.js";
import { ALL_CATEGORIES, CATEGORY_LABELS, CATEGORY_ROUTES, type CategoryKey } from "../categories.js";
import { get } from "../utils/getData.js";
import { extractSummary } from "../utils/fetchSummary.js";

type AggregatedCategory = {
  key: CategoryKey;
  label: string;
  total: number;
  data: ListItem[];
};

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

const fetchRoute = async (route: string, noCache: boolean, retries = 2): Promise<RoutePayload | null> => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await get({
        url: `http://localhost:${process.env.PORT || 6688}/${route}`,
        noCache: attempt === 0 ? noCache : true, // 重试时强制不使用缓存
        ttl: 300 // 5分钟缓存
      });
      if (result?.data?.code === 200) return result.data as RoutePayload;
      return null;
    } catch (error) {
      console.warn(`⚠️ [${route}] Attempt ${attempt + 1} failed:`, error instanceof Error ? error.message : 'Unknown error');
      if (attempt === retries) {
        console.error(`❌ [${route}] All ${retries + 1} attempts failed`);
        return null;
      }
      // 重试前等待一小段时间
      await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)));
    }
  }
  return null;
};

const enrichSummary = async (item: ListItem): Promise<ListItem> => {
  if (item.desc || !item.url) return item;
  try {
    const resp = await get({ url: item.url, responseType: "text" as any, noCache: true, ttl: 300 });
    const html = typeof resp?.data === "string" ? resp.data : (resp?.data?.toString?.() || "");
    const summary = extractSummary(html);
    if (summary) return { ...item, desc: summary };
    return item;
  } catch {
    return item;
  }
};

export const handleRoute = async (c: ListContext, noCache: boolean) => {
  const categoryQuery = (c.req.query("category") || "").split(",").filter(Boolean) as CategoryKey[];
  const categories = categoryQuery.length > 0 ? categoryQuery : ALL_CATEGORIES;
  const limit = c.req.query("limit") ? parseInt(c.req.query("limit")!) : undefined;
  const withSummary = c.req.query("summary") === "true";
  const group = c.req.query("group") || "flat"; // flat | source
  const per = c.req.query("per") ? parseInt(c.req.query("per")!) : 10; // 默认改为10条

  const aggregated: AggregatedCategory[] = [];
  const groups: Array<{
    route: string;
    title: string;
    category: CategoryKey;
    updateTime?: string | number;
    data: ListItem[];
    total: number;
  }> = [];

  // 🚀 性能优化：并发处理所有数据源
  console.time('⏱️ [AGGREGATE] Total fetch time');

  // 收集所有需要处理的路由，避免重复
  const allRoutes = new Set<string>();
  const routeToCategory = new Map<string, CategoryKey>();

  for (const key of categories) {
    const routes = CATEGORY_ROUTES[key] || [];
    for (const route of routes) {
      allRoutes.add(route);
      if (!routeToCategory.has(route)) {
        routeToCategory.set(route, key); // 记录第一次出现的分类
      }
    }
  }

  // 并发获取所有数据源
  const routePromises = Array.from(allRoutes).map(async (route) => {
    const startTime = Date.now();
    const result = await fetchRoute(route, noCache);
    const endTime = Date.now();
    const itemCount = result?.data?.length || 0;

    if (itemCount > 0) {
      console.log(`✅ [${route}] SUCCESS - Fetched in ${endTime - startTime}ms, items: ${itemCount}`);
    } else {
      console.log(`❌ [${route}] FAILED - Fetched in ${endTime - startTime}ms, items: 0`);
    }

    return { route, result, category: routeToCategory.get(route)! };
  });

  const routeResults = await Promise.allSettled(routePromises);
  console.timeEnd('⏱️ [AGGREGATE] Total fetch time');

  // 统计成功和失败的数据源
  const successfulRoutes: string[] = [];
  const failedRoutes: string[] = [];

  for (const promiseResult of routeResults) {
    if (promiseResult.status === 'fulfilled') {
      const { route, result } = promiseResult.value;
      if (result?.data && result.data.length > 0) {
        successfulRoutes.push(route);
      } else {
        failedRoutes.push(route);
      }
    } else {
      // 这里无法获取route名称，因为Promise被rejected了
      failedRoutes.push('unknown');
    }
  }

  console.log(`📈 [AGGREGATE] SUCCESS SOURCES (${successfulRoutes.length}): ${successfulRoutes.join(', ')}`);
  console.log(`📉 [AGGREGATE] FAILED SOURCES (${failedRoutes.length}): ${failedRoutes.join(', ')}`);
  console.log(`📊 [AGGREGATE] Overall success rate: ${successfulRoutes.length}/${routeResults.length} (${Math.round(successfulRoutes.length/routeResults.length*100)}%)`);

  // 处理结果
  const categoryItems = new Map<CategoryKey, ListItem[]>();

  for (const promiseResult of routeResults) {
    if (promiseResult.status === 'rejected') {
      console.warn('❌ [AGGREGATE] Route failed:', promiseResult.reason);
      continue;
    }

    const { route, result, category } = promiseResult.value;
    if (!result?.data?.length) continue;

    // 处理按数据源分组的情况
    if (group === "source") {
      let data = deduplicate(result.data.map((x) => ({ ...x })));
      if (per && data.length > per) data = data.slice(0, per);
      if (withSummary) {
        const enriched: ListItem[] = [];
        for (const it of data) enriched.push(await enrichSummary(it));
        data = enriched;
      }
      groups.push({
        route,
        title: result.title || route,
        category,
        updateTime: result.updateTime,
        data,
        total: result.total || data.length,
      });
    }

    // 收集分类数据
    if (!categoryItems.has(category)) {
      categoryItems.set(category, []);
    }
    categoryItems.get(category)!.push(...result.data.map((x) => ({ ...x })));
  }

  // 处理分类聚合数据
  for (const key of categories) {
    const items = categoryItems.get(key) || [];
    let deduped = deduplicate(items);
    if (limit && deduped.length > limit) deduped = deduped.slice(0, limit);
    if (withSummary) {
      const enriched: ListItem[] = [];
      for (const it of deduped) enriched.push(await enrichSummary(it));
      deduped = enriched;
    }
    aggregated.push({ key, label: CATEGORY_LABELS[key], total: deduped.length, data: deduped });
  }

  const routeData: RouterData & { categories: AggregatedCategory[]; groups?: typeof groups } = {
    name: "aggregate",
    title: "聚合",
    type: "分类聚合",
    link: "/aggregate",
    total: aggregated.reduce((acc, cur) => acc + cur.total, 0),
    updateTime: new Date().toISOString(),
    data: aggregated.flatMap((x) => x.data),
    categories: aggregated,
    ...(group === "source" ? { groups } : {}),
  } as any;

  return routeData;
};


