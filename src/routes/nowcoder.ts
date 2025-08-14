/**
 * 🚀 牛客网数据源 - 直接复用newsnow项目的成功实现
 * 
 * 特点：
 * 1. 完全基于newsnow的成功模式
 * 2. 支持不同类型的内容（讨论、动态）
 * 3. 简洁高效的实现
 * 4. 统一的错误处理和缓存
 */

import type { ListContext } from "../types.js";
import { defineAPISource, type NewsItem } from "../utils/defineSource.js";

// 牛客网API响应类型
interface NowcoderResponse {
  data: {
    result: {
      id: string;
      title: string;
      type: number;
      uuid: string;
    }[];
  };
}

// 牛客网热搜数据源（完全复用newsnow的实现）
const nowcoderSource = defineAPISource(
  (() => {
    const timestamp = Date.now();
    return `https://gw-c.nowcoder.com/api/sparta/hot-search/top-hot-pc?size=20&_=${timestamp}&t=`;
  })(),
  (data: NowcoderResponse): NewsItem[] => {
    if (!data?.data?.result?.length) return [];
    
    return data.data.result
      .map((item, index) => {
        let url: string | undefined;
        let id: string | undefined;
        
        // 根据类型确定URL和ID（完全复用newsnow的逻辑）
        if (item.type === 74) {
          url = `https://www.nowcoder.com/feed/main/detail/${item.uuid}`;
          id = item.uuid;
        } else if (item.type === 0) {
          url = `https://www.nowcoder.com/discuss/${item.id}`;
          id = item.id;
        }
        
        // 只返回有效的项目
        if (!url || !id) return null;

        return {
          id,
          title: item.title,
          desc: item.type === 74 ? '动态' : '讨论',
          url,
          hot: index + 1, // 使用排序位置作为热度
          extra: {
            info: `#${index + 1}`,
            hover: `类型: ${item.type === 74 ? '动态' : '讨论'}`
          }
        };
      })
      .filter((item) => item !== null) as NewsItem[]; // 过滤掉null值
  },
  { cacheTTL: 60 * 15 } // 缓存15分钟
);

// 类型映射
const typeMap = {
  'hot': '热搜榜'
};

// 主路由处理函数
export const handleRoute = async (c: ListContext) => {
  const type = c.req.query("type") || "hot";
  
  // 获取数据
  const data = await nowcoderSource();
  
  const routeData = {
    name: "nowcoder",
    title: "牛客网",
    type: typeMap[type as keyof typeof typeMap] || "热搜榜",
    params: {
      type: {
        name: "榜单分类",
        type: typeMap,
      },
    },
    link: "https://www.nowcoder.com/",
    total: data.length,
    updateTime: new Date().toISOString(),
    data: data.map((item, index) => ({
      id: item.id,
      title: item.title,
      desc: item.desc,
      hot: item.hot,
      timestamp: undefined, // 牛客网API不提供时间戳
      url: item.url,
      mobileUrl: item.url
    }))
  };
  
  return routeData;
};

// 导出数据源定义
export const nowcoderDataSource = nowcoderSource;
