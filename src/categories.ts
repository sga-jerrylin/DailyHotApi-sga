export type CategoryKey = "tech" | "media" | "news" | "finance" | "community" | "entertainment";

export const CATEGORY_LABELS: Record<CategoryKey, string> = {
  tech: "科技",
  media: "新媒体",
  news: "实时新闻",
  finance: "财经",
  community: "社区论坛",
  entertainment: "娱乐游戏",
};

// 重新归纳所有78个数据源到6个分类
export const CATEGORY_ROUTES: Record<CategoryKey, string[]> = {
  tech: [
    // 科技媒体和开发者社区
    "ithome",           // IT之家 - 中国最大科技媒体
    "36kr",             // 36氪 - 创投科技
    "csdn",             // CSDN - 开发者社区
    "juejin",           // 掘金 - 技术社区
    "geekpark",         // 极客公园
    "ifanr",            // 爱范儿
    "hellogithub",      // HelloGitHub
    "github",           // GitHub Trending
    "nodeseek",         // NodeSeek
    "linuxdo",          // LinuxDo
    "producthunt",      // Product Hunt
    "sspai",            // 少数派 - 数字生活
    "solidot",          // Solidot - 开源资讯
    "hackernews",       // Hacker News - 技术新闻
    "51cto",            // 51CTO - 技术社区
    "dgtle",            // 数字尾巴
    "ghxi",             // GitHub中文社区
    "pcbeta",           // 远景论坛
  ],
  media: [
    // 社交媒体和内容平台
    "douyin",           // 抖音 - 中国最大短视频平台
    "weibo",            // 微博 - 中国最大社交媒体
    "bilibili",         // B站 - 年轻人聚集地
    "zhihu",            // 知乎 - 知识问答社区
    "zhihu-daily",      // 知乎日报
    "kuaishou",         // 快手 - 短视频平台
    "tieba",            // 百度贴吧
    "douban-movie",     // 豆瓣电影
    "douban-group",     // 豆瓣小组
    "smzdm",            // 什么值得买
    "acfun",            // AcFun
    "coolapk",          // 酷安
    "weread",           // 微信读书
    "jianshu",          // 简书
    "guokr",            // 果壳网
  ],
  news: [
    // 新闻媒体和时事
    "baidu",            // 百度热搜 - 中国最大搜索引擎
    "qq-news",          // 腾讯新闻 - 中国最大新闻平台
    "sina-news",        // 新浪新闻
    "sina",             // 新浪
    "netease-news",     // 网易新闻
    "thepaper",         // 澎湃新闻 - 专业新闻媒体
    "nytimes",          // 纽约时报中文网
    "weatheralarm",     // 天气预警
    "earthquake",       // 地震速报
    "cankaoxiaoxi",     // 参考消息
    "ifeng",            // 凤凰网
    "kaopu",            // 靠谱新闻
    "sputniknewscn",    // 俄罗斯卫星通讯社中文网
    "zaobao",           // 联合早报
    "toutiao",          // 今日头条
  ],
  finance: [
    // 财经和商业
    "huxiu",            // 虎嗅 - 商业科技媒体
    "cls",              // 财联社 - 专业财经媒体
    "xueqiu",           // 雪球 - 热门股票
    "jin10",            // 金十数据 - 财经快讯
    "wallstreetcn",     // 华尔街见闻 - 实时快讯
    "gelonghui",        // 格隆汇 - 财经事件
    "fastbull",         // 快牛财经
    "mktnews",          // MarketNews
  ],
  community: [
    // 社区论坛和技术讨论
    "v2ex",             // V2EX
    "hupu",             // 虎扑
    "hostloc",          // 全球主机交流论坛
    "52pojie",          // 吾爱破解
    "chongbuluo",       // 虫部落
    "newsmth",          // 水木社区
    "ngabbs",           // NGA玩家社区
    "nowcoder",         // 牛客网
    "yystv",            // 游研社
  ],
  entertainment: [
    // 娱乐游戏和二次元
    "genshin",          // 原神
    "honkai",           // 崩坏
    "starrail",         // 崩坏：星穹铁道
    "miyoushe",         // 米游社
    "lol",              // 英雄联盟
  ],
};

export const ALL_CATEGORIES: CategoryKey[] = ["tech", "media", "news", "finance", "community", "entertainment"];



