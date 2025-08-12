export type CategoryKey = "tech" | "media" | "news" | "finance";

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  tech: "科技",
  media: "新媒体",
  news: "实时新闻",
  finance: "财经",
};

// 可根据需要增删；若某些源不存在会在聚合时自动跳过
export const CATEGORY_ROUTES: Record<CategoryKey, string[]> = {
  tech: [
    "36kr",
    "ithome",
    "ithome-xijiayi",
    "csdn",
    "juejin",
    "geekpark",
    "ifanr",
    "hellogithub",
    "nodeseek",
    "linuxdo",
    "github",
    "producthunt",
  ],
  media: [
    "weibo",
    "zhihu",
    "zhihu-daily",
    "douyin",
    "kuaishou",
    "bilibili",
    "acfun",
    "tieba",
    "v2ex",
    "smzdm",
    "coolapk",
    "douban-group",
    "douban-movie",
    "weread",
    "yystv",
    "hupu",
  ],
  news: [
    "qq-news",
    "sina-news",
    "sina",
    "netease-news",
    "thepaper",
    "nytimes",
    "baidu",
    "weatheralarm",
    "earthquake",
  ],
  finance: [
    "36kr",
    "thepaper",
    "huxiu",
  ],
};

export const ALL_CATEGORIES: CategoryKey[] = ["tech", "media", "news", "finance"];



