/**
 * 🚀 远景论坛数据源 - 基于newsnow项目的成功实现
 */

import type { ListContext } from "../types.js";
import { defineRSSSource, type NewsItem } from "../utils/defineSource.js";

// Windows 11数据源
const windows11Source = defineRSSSource(
  "https://bbs.pcbeta.com/forum.php?mod=rss&fid=563&auth=0",
  { limit: 20, cacheTTL: 60 * 30 }
);

// Windows数据源
const windowsSource = defineRSSSource(
  "https://bbs.pcbeta.com/forum.php?mod=rss&fid=521&auth=0",
  { limit: 20, cacheTTL: 60 * 30 }
);

const typeMap = {
  'windows11': 'Windows 11',
  'windows': 'Windows'
};

export const handleRoute = async (c: ListContext) => {
  const type = c.req.query("type") || "windows11";
  
  let data: NewsItem[];
  if (type === 'windows') {
    data = await windowsSource();
  } else {
    data = await windows11Source();
  }
  
  return {
    name: "pcbeta",
    title: "远景论坛",
    type: typeMap[type as keyof typeof typeMap] || "Windows 11",
    params: {
      type: {
        name: "榜单分类",
        type: typeMap,
      },
    },
    link: "https://bbs.pcbeta.com/",
    total: data.length,
    updateTime: new Date().toISOString(),
    data: data.map((item, index) => ({
      ...item,
      hot: index + 1,
      timestamp: item.pubDate,
      mobileUrl: item.url
    }))
  };
};

export const pcbetaDataSource = { windows11: windows11Source, windows: windowsSource };
