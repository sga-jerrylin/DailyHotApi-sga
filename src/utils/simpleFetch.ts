import { myFetch } from "./myFetch.js";
import { getCache, setCache } from "./cache.js";
import logger from "./logger.js";

// 🚀 简化的数据获取工具 - 模仿newsnow的成功模式
export const simpleFetch = async (url: string, options?: {
  noCache?: boolean;
  ttl?: number;
  headers?: Record<string, string>;
}) => {
  const { noCache = false, ttl = 600, headers = {} } = options || {};
  
  try {
    // 检查缓存（简化版）
    if (!noCache) {
      const cachedData = await getCache(url);
      if (cachedData) {
        return {
          fromCache: true,
          updateTime: cachedData.updateTime,
          data: cachedData.data,
        };
      }
    }

    // 直接使用myFetch获取数据
    const data = await myFetch(url, { headers });
    
    // 缓存数据
    const updateTime = new Date().toISOString();
    await setCache(url, { data, updateTime }, ttl);
    
    return {
      fromCache: false,
      updateTime,
      data,
    };
  } catch (error) {
    logger.error(`❌ [SIMPLE FETCH ERROR] ${url}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
};

// 为了兼容现有代码，创建一个get函数的简化版本
export const simpleGet = async (options: {
  url: string;
  noCache?: boolean;
  ttl?: number;
  headers?: Record<string, string>;
}) => {
  return simpleFetch(options.url, {
    noCache: options.noCache,
    ttl: options.ttl,
    headers: options.headers,
  });
};
