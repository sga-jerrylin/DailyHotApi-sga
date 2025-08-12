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

const fetchRoute = async (route: string, noCache: boolean): Promise<RoutePayload | null> => {
  try {
    const result = await get({ url: `http://localhost:${process.env.PORT || 6688}/${route}`, noCache });
    if (result?.data?.code === 200) return result.data as RoutePayload;
    return null;
  } catch {
    return null;
  }
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
  const per = c.req.query("per") ? parseInt(c.req.query("per")!) : 10;

  const aggregated: AggregatedCategory[] = [];
  const groups: Array<{
    route: string;
    title: string;
    updateTime?: string | number;
    data: ListItem[];
    total: number;
  }> = [];

  for (const key of categories) {
    const routes = CATEGORY_ROUTES[key] || [];
    const items: ListItem[] = [];
    for (const route of routes) {
      const res = await fetchRoute(route, noCache);
      if (!res?.data?.length) continue;
      if (group === "source") {
        let data = deduplicate(res.data.map((x) => ({ ...x })));
        if (per && data.length > per) data = data.slice(0, per);
        if (withSummary) {
          const enriched: ListItem[] = [];
          for (const it of data) enriched.push(await enrichSummary(it));
          data = enriched;
        }
        groups.push({
          route,
          title: res.title || route,
          updateTime: res.updateTime,
          data,
          total: res.total || data.length,
        });
      }
      items.push(...res.data.map((x) => ({ ...x })));
    }
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


