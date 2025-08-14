import { myFetch } from "./myFetch.js";
import { getCache, setCache } from "./cache.js";
import logger from "./logger.js";
import { parseRSS } from "./parseRSS.js";

/**
 * 🚀 基于newsnow项目的成功模式 - 统一数据源定义工具
 * 
 * 核心优势：
 * 1. 简化数据源创建 - 只需关注数据提取逻辑
 * 2. 统一错误处理 - 自动重试和缓存
 * 3. 标准化数据结构 - 一致的NewsItem格式
 * 4. 高可维护性 - 减少重复代码
 */

// 标准化的新闻项数据结构（参考newsnow）
export interface NewsItem {
  id: string | number;
  title: string;
  desc?: string;
  url: string;
  hot?: string | number;
  pubDate?: number | string;
  extra?: {
    info?: string;
    hover?: string;
    [key: string]: any;
  };
  [key: string]: any; // 允许扩展字段
}

// 数据源获取函数类型
export type SourceGetter = () => Promise<NewsItem[]>;

// 数据源选项
export interface SourceOption {
  hiddenDate?: boolean;
  cache?: boolean;
  cacheTTL?: number;
}

// RSS选项
export interface RSSOption extends SourceOption {
  limit?: number;
}

// RSSHub选项
export interface RSSHubOption {
  sorted?: boolean;
  limit?: number;
  [key: string]: any;
}

/**
 * 定义数据源 - 核心函数（模仿newsnow的defineSource）
 * @param getter 数据获取函数
 * @param options 选项配置
 */
export function defineSource(getter: SourceGetter, options: SourceOption = {}): SourceGetter {
  return async () => {
    const cacheKey = `source_${getter.name || 'anonymous'}_${Date.now()}`;
    const cacheTTL = options.cacheTTL || 60 * 60; // 默认1小时缓存
    
    // 检查缓存
    if (options.cache !== false) {
      const cached = await getCache(cacheKey);
      if (cached) {
        logger.info(`💾 [CACHE] 数据源缓存命中: ${getter.name}`);
        return cached.data as NewsItem[];
      }
    }
    
    try {
      logger.info(`🌐 [FETCH] 获取数据源: ${getter.name}`);
      const data = await getter();
      
      // 验证数据格式
      if (!Array.isArray(data)) {
        throw new Error('数据源必须返回数组格式');
      }
      
      // 标准化数据格式
      const standardizedData = data.map((item, index) => ({
        ...item,
        id: item.id || index,
        title: item.title || '',
        desc: item.desc || '',
        url: item.url || '',
        hot: item.hot || '',
        pubDate: item.pubDate,
        extra: item.extra
      }));
      
      // 缓存数据
      if (options.cache !== false) {
        await setCache(cacheKey, { data: standardizedData, updateTime: new Date().toISOString() }, cacheTTL);
      }
      
      logger.info(`✅ [SUCCESS] 数据源获取成功: ${standardizedData.length} 条数据`);
      return standardizedData;
      
    } catch (error) {
      logger.error(`❌ [ERROR] 数据源获取失败: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  };
}

/**
 * 定义RSS数据源 - 快速创建RSS数据源（参考newsnow的defineRSSSource）
 * @param url RSS链接
 * @param options 选项配置
 */
export function defineRSSSource(url: string, options: RSSOption = {}): SourceGetter {
  return defineSource(async () => {
    logger.info(`📡 [RSS] 获取RSS数据: ${url}`);
    const rssData = await parseRSS(url);

    if (!rssData?.length) {
      throw new Error('无法获取RSS数据或数据为空');
    }

    const items = rssData.slice(0, options.limit || 50);

    return items.map((item: any, index: number) => ({
      id: item.link || index,
      title: item.title || '',
      desc: item.contentSnippet || item.content || '',
      url: item.link || '',
      pubDate: options.hiddenDate ? undefined : (item.pubDate ? new Date(item.pubDate).getTime() : undefined),
      extra: {
        info: item.author || '',
        hover: item.contentSnippet || item.content || ''
      }
    }));
  }, options);
}

/**
 * 定义RSSHub数据源 - 快速创建RSSHub数据源（参考newsnow的defineRSSHubSource）
 * @param route RSSHub路由
 * @param rssHubOptions RSSHub选项
 * @param sourceOptions 数据源选项
 */
export function defineRSSHubSource(
  route: string, 
  rssHubOptions: RSSHubOption = {}, 
  sourceOptions: SourceOption = {}
): SourceGetter {
  return defineSource(async () => {
    // 默认RSSHub实例（可配置）
    const rssHubBase = process.env.RSSHUB_BASE || "https://rsshub.app";
    const url = new URL(route, rssHubBase);
    
    // 设置默认参数
    url.searchParams.set("format", "json");
    
    // 应用RSSHub选项
    const defaultOptions = { sorted: true, ...rssHubOptions };
    Object.entries(defaultOptions).forEach(([key, value]) => {
      url.searchParams.set(key, value.toString());
    });
    
    logger.info(`🔗 [RSSHUB] 获取RSSHub数据: ${url.toString()}`);
    const data = await myFetch(url.toString());
    
    if (!data?.items?.length) {
      throw new Error('无法获取RSSHub数据或数据为空');
    }
    
    return data.items.map((item: any, index: number) => ({
      id: item.id || item.url || index,
      title: item.title || '',
      desc: item.summary || item.content_text || '',
      url: item.url || '',
      pubDate: sourceOptions.hiddenDate ? undefined : (item.date_published ? new Date(item.date_published).getTime() : undefined),
      extra: {
        info: item.author?.name || '',
        hover: item.summary || item.content_text || ''
      }
    }));
  }, sourceOptions);
}

/**
 * 创建API数据源 - 用于JSON API接口
 * @param url API地址
 * @param transformer 数据转换函数
 * @param options 选项配置
 */
export function defineAPISource(
  url: string,
  transformer: (data: any) => NewsItem[],
  options: SourceOption = {}
): SourceGetter {
  return defineSource(async () => {
    logger.info(`🔌 [API] 获取API数据: ${url}`);
    const data = await myFetch(url);
    return transformer(data);
  }, options);
}

/**
 * 创建HTML爬虫数据源 - 用于网页爬虫
 * @param url 网页地址
 * @param scraper 爬虫函数
 * @param options 选项配置
 */
export function defineHTMLSource(
  url: string,
  scraper: (html: string) => NewsItem[],
  options: SourceOption = {}
): SourceGetter {
  return defineSource(async () => {
    logger.info(`🕷️ [HTML] 爬取网页数据: ${url}`);
    const html = await myFetch(url);
    return scraper(html);
  }, options);
}

/**
 * 代理数据源 - 用于需要代理的场景（参考newsnow的proxySource）
 * @param proxyUrl 代理地址
 * @param source 原始数据源
 */
export function proxySource(proxyUrl: string, source: SourceGetter): SourceGetter {
  // 如果在特定环境下使用代理
  return process.env.USE_PROXY === 'true'
    ? defineSource(async () => {
        logger.info(`🔄 [PROXY] 使用代理获取数据: ${proxyUrl}`);
        const data = await myFetch(proxyUrl);
        return data.items || data;
      })
    : source;
}

/**
 * 组合多个数据源 - 合并多个数据源的结果
 * @param sources 数据源数组
 * @param options 选项配置
 */
export function combineSource(sources: SourceGetter[], options: SourceOption = {}): SourceGetter {
  return defineSource(async () => {
    logger.info(`🔗 [COMBINE] 组合 ${sources.length} 个数据源`);
    
    const results = await Promise.allSettled(sources.map(source => source()));
    const allData: NewsItem[] = [];
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allData.push(...result.value);
      } else {
        logger.warn(`⚠️ [WARN] 数据源 ${index} 获取失败: ${result.reason}`);
      }
    });
    
    // 按时间排序（如果有pubDate）
    return allData.sort((a, b) => {
      const aTime = typeof a.pubDate === 'number' ? a.pubDate : 0;
      const bTime = typeof b.pubDate === 'number' ? b.pubDate : 0;
      return bTime - aTime;
    });
  }, options);
}
