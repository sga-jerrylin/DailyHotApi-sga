import type { Get, Post } from "../types.js";
import { config } from "../config.js";
import { getCache, setCache, delCache } from "./cache.js";
import logger from "./logger.js";
import axios from "axios";

// 基础配置
const request = axios.create({
  // 请求超时设置
  timeout: config.REQUEST_TIMEOUT,
  withCredentials: true,
});

// 请求拦截
request.interceptors.request.use(
  (request) => {
    if (!request.params) request.params = {};
    // 发送请求
    return request;
  },
  (error) => {
    logger.error("❌ [ERROR] request failed");
    return Promise.reject(error);
  },
);

// 响应拦截
request.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 继续传递错误
    return Promise.reject(error);
  },
);

// GET
export const get = async (options: Get) => {
  const {
    url,
    headers,
    params,
    noCache,
    ttl = config.CACHE_TTL,
    originaInfo = false,
    responseType = "json",
  } = options;
  logger.info(`🌐 [GET] ${url}`);
  try {
    // 检查缓存
    if (noCache) await delCache(url);
    else {
      const cachedData = await getCache(url);
      if (cachedData) {
        logger.info("💾 [CHCHE] The request is cached");
        return {
          fromCache: true,
          updateTime: cachedData.updateTime,
          data: cachedData.data,
        };
      }
    }

    // 🚀 性能优化：为不同类型的请求设置不同的超时时间
    const isAggregateRequest = url.includes('/aggregate') || url.includes('localhost:');
    const isGitHubRequest = url.includes('github.com');
    const isBilibiliRequest = url.includes('bilibili.com');
    const isWeiboRequest = url.includes('weibo.cn');

    let requestTimeout = config.REQUEST_TIMEOUT;
    if (isAggregateRequest) {
      requestTimeout = Math.min(config.REQUEST_TIMEOUT, 8000); // 聚合请求8秒超时
    } else if (isGitHubRequest) {
      requestTimeout = 15000; // GitHub 15秒超时
    } else if (isBilibiliRequest) {
      requestTimeout = 10000; // B站 10秒超时
    } else if (isWeiboRequest) {
      requestTimeout = 8000; // 微博 8秒超时
    }

    // 缓存不存在时请求接口
    const response = await request.get(url, {
      headers,
      params,
      responseType,
      timeout: requestTimeout
    });
    const responseData = response?.data || response;
    // 存储新获取的数据到缓存
    const updateTime = new Date().toISOString();
    const data = originaInfo ? response : responseData;
    await setCache(url, { data, updateTime }, ttl);
    // 返回数据
    logger.info(`✅ [${response?.status}] request was successful`);
    return { fromCache: false, updateTime, data };
  } catch (error) {
    logger.error(`❌ [ERROR] request failed for ${url}:`, error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
};

// POST
export const post = async (options: Post) => {
  const { url, headers, body, noCache, ttl = config.CACHE_TTL, originaInfo = false } = options;
  logger.info(`🌐 [POST] ${url}`);
  try {
    // 检查缓存
    if (noCache) await delCache(url);
    else {
      const cachedData = await getCache(url);
      if (cachedData) {
        logger.info("💾 [CHCHE] The request is cached");
        return { fromCache: true, updateTime: cachedData.updateTime, data: cachedData.data };
      }
    }
    // 缓存不存在时请求接口
    const response = await request.post(url, body, { headers });
    const responseData = response?.data || response;
    // 存储新获取的数据到缓存
    const updateTime = new Date().toISOString();
    const data = originaInfo ? response : responseData;
    if (!noCache) {
      await setCache(url, { data, updateTime }, ttl);
    }
    // 返回数据
    logger.info(`✅ [${response?.status}] request was successful`);
    return { fromCache: false, updateTime, data };
  } catch (error) {
    logger.error("❌ [ERROR] request failed");
    throw error;
  }
};
