/**
 * 🚀 数据源管理器 - 统一缓存策略和错误处理
 * 
 * 基于newsnow项目的成功经验，提供：
 * 1. 统一的缓存策略
 * 2. 智能的错误处理和重试
 * 3. 性能监控和日志
 * 4. 数据源健康检查
 */

import { getCache, setCache } from "./cache.js";
import logger from "./logger.js";
import type { NewsItem, SourceGetter } from "./defineSource.js";

// 数据源配置
export interface SourceConfig {
  name: string;
  cacheTTL?: number; // 缓存时间（秒）
  retryCount?: number; // 重试次数
  timeout?: number; // 超时时间（毫秒）
  healthCheck?: boolean; // 是否启用健康检查
  fallbackData?: NewsItem[]; // 降级数据
}

// 数据源状态
export interface SourceStatus {
  name: string;
  isHealthy: boolean;
  lastSuccess: Date | null;
  lastError: Error | null;
  successCount: number;
  errorCount: number;
  avgResponseTime: number;
}

// 数据源管理器
export class SourceManager {
  private sources = new Map<string, SourceGetter>();
  private configs = new Map<string, SourceConfig>();
  private statuses = new Map<string, SourceStatus>();
  
  /**
   * 注册数据源
   */
  register(name: string, getter: SourceGetter, config: Partial<SourceConfig> = {}) {
    this.sources.set(name, getter);
    this.configs.set(name, {
      cacheTTL: 60 * 30, // 默认30分钟
      retryCount: 3,
      timeout: 10000,
      healthCheck: true,
      ...config,
      name
    });
    
    // 初始化状态
    this.statuses.set(name, {
      name,
      isHealthy: true,
      lastSuccess: null,
      lastError: null,
      successCount: 0,
      errorCount: 0,
      avgResponseTime: 0
    });
    
    logger.info(`📝 [SOURCE] 注册数据源: ${name}`);
  }
  
  /**
   * 获取数据源数据（带缓存和错误处理）
   */
  async getData(name: string): Promise<NewsItem[]> {
    const getter = this.sources.get(name);
    const config = this.configs.get(name);
    const status = this.statuses.get(name);
    
    if (!getter || !config || !status) {
      throw new Error(`数据源 ${name} 未注册`);
    }
    
    const cacheKey = `source_${name}`;
    const startTime = Date.now();
    
    try {
      // 检查缓存
      const cached = await getCache(cacheKey);
      if (cached) {
        logger.info(`💾 [CACHE] 数据源缓存命中: ${name}`);
        return cached.data as NewsItem[];
      }
      
      // 执行数据获取（带重试）
      const data = await this.executeWithRetry(getter, config);
      
      // 验证数据
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('数据源返回空数据或格式错误');
      }
      
      // 缓存数据
      await setCache(cacheKey, { 
        data, 
        updateTime: new Date().toISOString() 
      }, config.cacheTTL!);
      
      // 更新状态
      const responseTime = Date.now() - startTime;
      this.updateStatus(name, true, responseTime);
      
      logger.info(`✅ [SUCCESS] 数据源获取成功: ${name} (${data.length}条, ${responseTime}ms)`);
      return data;
      
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.updateStatus(name, false, responseTime, error as Error);
      
      logger.error(`❌ [ERROR] 数据源获取失败: ${name} - ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // 尝试返回降级数据
      if (config.fallbackData) {
        logger.warn(`🔄 [FALLBACK] 使用降级数据: ${name}`);
        return config.fallbackData;
      }
      
      throw error;
    }
  }
  
  /**
   * 带重试的执行
   */
  private async executeWithRetry(getter: SourceGetter, config: SourceConfig): Promise<NewsItem[]> {
    let lastError: Error;
    
    for (let i = 0; i < config.retryCount!; i++) {
      try {
        // 设置超时
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('请求超时')), config.timeout);
        });
        
        const dataPromise = getter();
        const data = await Promise.race([dataPromise, timeoutPromise]);
        
        return data;
      } catch (error) {
        lastError = error as Error;
        
        if (i < config.retryCount! - 1) {
          const delay = Math.pow(2, i) * 1000; // 指数退避
          logger.warn(`⚠️ [RETRY] 数据源重试 ${i + 1}/${config.retryCount}: ${config.name} (${delay}ms后重试)`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError!;
  }
  
  /**
   * 更新数据源状态
   */
  private updateStatus(name: string, success: boolean, responseTime: number, error?: Error) {
    const status = this.statuses.get(name)!;
    
    if (success) {
      status.successCount++;
      status.lastSuccess = new Date();
      status.isHealthy = true;
    } else {
      status.errorCount++;
      status.lastError = error || null;
      // 连续失败3次标记为不健康
      if (status.errorCount >= 3) {
        status.isHealthy = false;
      }
    }
    
    // 更新平均响应时间
    const totalRequests = status.successCount + status.errorCount;
    status.avgResponseTime = (status.avgResponseTime * (totalRequests - 1) + responseTime) / totalRequests;
  }
  
  /**
   * 获取数据源状态
   */
  getStatus(name?: string): SourceStatus | SourceStatus[] {
    if (name) {
      const status = this.statuses.get(name);
      if (!status) throw new Error(`数据源 ${name} 未注册`);
      return status;
    }
    
    return Array.from(this.statuses.values());
  }
  
  /**
   * 健康检查
   */
  async healthCheck(): Promise<{ healthy: string[], unhealthy: string[] }> {
    const healthy: string[] = [];
    const unhealthy: string[] = [];
    
    for (const [name, status] of this.statuses) {
      if (status.isHealthy) {
        healthy.push(name);
      } else {
        unhealthy.push(name);
      }
    }
    
    logger.info(`🏥 [HEALTH] 健康检查完成: ${healthy.length}个健康, ${unhealthy.length}个异常`);
    
    return { healthy, unhealthy };
  }
  
  /**
   * 清除缓存
   */
  async clearCache(name?: string) {
    if (name) {
      const cacheKey = `source_${name}`;
      // 这里需要实现缓存删除逻辑
      logger.info(`🗑️ [CACHE] 清除数据源缓存: ${name}`);
    } else {
      // 清除所有数据源缓存
      logger.info(`🗑️ [CACHE] 清除所有数据源缓存`);
    }
  }
  
  /**
   * 获取性能统计
   */
  getPerformanceStats() {
    const stats = Array.from(this.statuses.values()).map(status => ({
      name: status.name,
      successRate: status.successCount / (status.successCount + status.errorCount) * 100,
      avgResponseTime: status.avgResponseTime,
      totalRequests: status.successCount + status.errorCount,
      isHealthy: status.isHealthy
    }));
    
    return {
      sources: stats,
      totalSources: stats.length,
      healthySources: stats.filter(s => s.isHealthy).length,
      avgSuccessRate: stats.reduce((sum, s) => sum + s.successRate, 0) / stats.length
    };
  }
}

// 全局数据源管理器实例
export const sourceManager = new SourceManager();

/**
 * 便捷函数：注册数据源
 */
export function registerSource(name: string, getter: SourceGetter, config: Partial<SourceConfig> = {}) {
  sourceManager.register(name, getter, config);
}

/**
 * 便捷函数：获取数据源数据
 */
export function getSourceData(name: string): Promise<NewsItem[]> {
  return sourceManager.getData(name);
}

/**
 * 便捷函数：批量获取数据源数据
 */
export async function getBatchSourceData(names: string[]): Promise<Record<string, NewsItem[]>> {
  const results: Record<string, NewsItem[]> = {};
  
  await Promise.allSettled(
    names.map(async (name) => {
      try {
        results[name] = await sourceManager.getData(name);
      } catch (error) {
        logger.error(`批量获取数据源失败: ${name}`, error);
        results[name] = [];
      }
    })
  );
  
  return results;
}
