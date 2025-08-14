/**
 * 🕒 时间解析工具 - 参考newsnow项目的时间处理
 * 
 * 支持多种时间格式的解析，包括相对时间、绝对时间等
 */

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import relativeTime from 'dayjs/plugin/relativeTime.js';
import customParseFormat from 'dayjs/plugin/customParseFormat.js';
import 'dayjs/locale/zh-cn.js';

// 扩展dayjs功能
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);
dayjs.locale('zh-cn');

/**
 * 解析相对时间 - 模仿newsnow的parseRelativeDate函数
 * @param dateStr 时间字符串
 * @param timezone 时区，默认为Asia/Shanghai
 * @returns dayjs对象
 */
export function parseRelativeDate(dateStr: string, timezone: string = 'Asia/Shanghai') {
  if (!dateStr) return dayjs();
  
  const now = dayjs().tz(timezone);
  const cleanStr = dateStr.trim().toLowerCase();
  
  // 处理中文相对时间
  if (cleanStr.includes('分钟前') || cleanStr.includes('分钟前')) {
    const minutes = parseInt(cleanStr.match(/(\d+)/)?.[1] || '0');
    return now.subtract(minutes, 'minute');
  }
  
  if (cleanStr.includes('小时前')) {
    const hours = parseInt(cleanStr.match(/(\d+)/)?.[1] || '0');
    return now.subtract(hours, 'hour');
  }
  
  if (cleanStr.includes('天前') || cleanStr.includes('日前')) {
    const days = parseInt(cleanStr.match(/(\d+)/)?.[1] || '0');
    return now.subtract(days, 'day');
  }
  
  if (cleanStr.includes('周前') || cleanStr.includes('星期前')) {
    const weeks = parseInt(cleanStr.match(/(\d+)/)?.[1] || '0');
    return now.subtract(weeks, 'week');
  }
  
  if (cleanStr.includes('月前')) {
    const months = parseInt(cleanStr.match(/(\d+)/)?.[1] || '0');
    return now.subtract(months, 'month');
  }
  
  if (cleanStr.includes('年前')) {
    const years = parseInt(cleanStr.match(/(\d+)/)?.[1] || '0');
    return now.subtract(years, 'year');
  }
  
  // 处理英文相对时间
  if (cleanStr.includes('minute') && cleanStr.includes('ago')) {
    const minutes = parseInt(cleanStr.match(/(\d+)/)?.[1] || '0');
    return now.subtract(minutes, 'minute');
  }
  
  if (cleanStr.includes('hour') && cleanStr.includes('ago')) {
    const hours = parseInt(cleanStr.match(/(\d+)/)?.[1] || '0');
    return now.subtract(hours, 'hour');
  }
  
  if (cleanStr.includes('day') && cleanStr.includes('ago')) {
    const days = parseInt(cleanStr.match(/(\d+)/)?.[1] || '0');
    return now.subtract(days, 'day');
  }
  
  // 处理今天、昨天等
  if (cleanStr.includes('今天') || cleanStr.includes('today')) {
    return now.startOf('day');
  }
  
  if (cleanStr.includes('昨天') || cleanStr.includes('yesterday')) {
    return now.subtract(1, 'day').startOf('day');
  }
  
  if (cleanStr.includes('前天')) {
    return now.subtract(2, 'day').startOf('day');
  }
  
  // 处理具体时间格式
  const formats = [
    'YYYY-MM-DD HH:mm:ss',
    'YYYY-MM-DD HH:mm',
    'YYYY-MM-DD',
    'MM-DD HH:mm',
    'MM-DD',
    'HH:mm',
    'YYYY/MM/DD HH:mm:ss',
    'YYYY/MM/DD HH:mm',
    'YYYY/MM/DD',
    'MM/DD HH:mm',
    'MM/DD',
    'YYYY年MM月DD日 HH:mm:ss',
    'YYYY年MM月DD日 HH:mm',
    'YYYY年MM月DD日',
    'MM月DD日 HH:mm',
    'MM月DD日',
  ];
  
  for (const format of formats) {
    const parsed = dayjs.tz(dateStr, format, timezone);
    if (parsed.isValid()) {
      return parsed;
    }
  }
  
  // 尝试ISO格式和其他标准格式
  const isoDate = dayjs.tz(dateStr, timezone);
  if (isoDate.isValid()) {
    return isoDate;
  }
  
  // 如果都无法解析，返回当前时间
  console.warn(`无法解析时间字符串: ${dateStr}`);
  return now;
}

/**
 * 格式化时间为相对时间
 * @param date 时间
 * @returns 相对时间字符串
 */
export function formatRelativeTime(date: dayjs.Dayjs | Date | string | number): string {
  const target = dayjs(date);
  if (!target.isValid()) return '未知时间';
  
  return target.fromNow();
}

/**
 * 格式化时间为标准格式
 * @param date 时间
 * @param format 格式，默认为'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化的时间字符串
 */
export function formatDateTime(date: dayjs.Dayjs | Date | string | number, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  const target = dayjs(date);
  if (!target.isValid()) return '未知时间';
  
  return target.format(format);
}

/**
 * 获取时间戳
 * @param date 时间
 * @returns 时间戳（毫秒）
 */
export function getTimestamp(date: dayjs.Dayjs | Date | string | number): number {
  const target = dayjs(date);
  if (!target.isValid()) return Date.now();
  
  return target.valueOf();
}

/**
 * 检查时间是否在指定范围内
 * @param date 要检查的时间
 * @param start 开始时间
 * @param end 结束时间
 * @returns 是否在范围内
 */
export function isInTimeRange(
  date: dayjs.Dayjs | Date | string | number,
  start: dayjs.Dayjs | Date | string | number,
  end: dayjs.Dayjs | Date | string | number
): boolean {
  const target = dayjs(date);
  const startTime = dayjs(start);
  const endTime = dayjs(end);
  
  return target.isAfter(startTime) && target.isBefore(endTime);
}

/**
 * 获取今天的开始和结束时间
 * @param timezone 时区
 * @returns 今天的开始和结束时间
 */
export function getTodayRange(timezone: string = 'Asia/Shanghai') {
  const now = dayjs().tz(timezone);
  return {
    start: now.startOf('day'),
    end: now.endOf('day')
  };
}

/**
 * 解析各种时间格式的通用函数
 * @param timeStr 时间字符串
 * @param timezone 时区
 * @returns 解析后的时间戳
 */
export function parseTime(timeStr: string, timezone: string = 'Asia/Shanghai'): number {
  return parseRelativeDate(timeStr, timezone).valueOf();
}

// 导出dayjs实例供其他地方使用
export { dayjs };

// 常用时间格式常量
export const TIME_FORMATS = {
  FULL: 'YYYY-MM-DD HH:mm:ss',
  DATE: 'YYYY-MM-DD',
  TIME: 'HH:mm:ss',
  DATETIME: 'YYYY-MM-DD HH:mm',
  CHINESE_FULL: 'YYYY年MM月DD日 HH:mm:ss',
  CHINESE_DATE: 'YYYY年MM月DD日',
  ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ'
} as const;
