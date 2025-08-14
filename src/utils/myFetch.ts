import { $fetch } from "ofetch";
import logger from "./logger.js";

// 🚀 完全模仿newsnow项目的fetch实现 - 简单但高效
export const myFetch = $fetch.create({
  headers: {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  },
  timeout: 10000,
  retry: 3,
});

// 为不同数据源创建专用的fetch实例
export const createSourceFetch = (sourceConfig: {
  timeout?: number;
  headers?: Record<string, string>;
  retry?: number;
}) => {
  return $fetch.create({
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "application/json, text/plain, */*",
      "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
      ...sourceConfig.headers,
    },
    timeout: sourceConfig.timeout || 10000,
    retry: sourceConfig.retry || 3,
    retryDelay: 1000,
  });
};

// 微博专用fetch
export const weiboFetch = createSourceFetch({
  timeout: 8000,
  headers: {
    "Referer": "https://s.weibo.com/top/summary?cate=realtimehot",
    "X-Requested-With": "XMLHttpRequest",
  },
});

// 知乎专用fetch
export const zhihuFetch = createSourceFetch({
  timeout: 10000,
  headers: {
    "Referer": "https://www.zhihu.com/",
    "Accept": "application/json, text/plain, */*",
  },
});

// B站专用fetch
export const bilibiliFetch = createSourceFetch({
  timeout: 10000,
  headers: {
    "Referer": "https://www.bilibili.com/",
    "Accept": "application/json, text/plain, */*",
  },
});

// GitHub专用fetch
export const githubFetch = createSourceFetch({
  timeout: 15000,
  headers: {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  },
});
