import { prisma } from "@repo/db";
import crypto from "crypto";

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  forceRefresh?: boolean; // Force refresh cache
  userId?: string; // User-specific caching
  maxHits?: number; // Max hits before refresh
}

export interface CacheStats {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  apiCalls: number;
  hitRate: number;
  averageResponseTime: number;
}

export interface CacheConfig {
  endpoint: string;
  ttl: number;
  maxHits?: number | null;
  isActive: boolean;
  priority: number;
}

export class CacheService {
  private static instance: CacheService;
  private prisma = prisma;

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  /**
   * Generate a unique cache key from endpoint and parameters
   */
  generateCacheKey(endpoint: string, params: Record<string, unknown>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce(
        (result, key) => {
          result[key] = params[key];
          return result;
        },
        {} as Record<string, unknown>
      );

    const paramString = JSON.stringify(sortedParams);
    const hash = crypto
      .createHash("md5")
      .update(`${endpoint}:${paramString}`)
      .digest("hex");
    return `${endpoint}:${hash}`;
  }

  /**
   * Get cached data if it exists and is valid
   */
  async getCachedData(
    cacheKey: string,
    options: CacheOptions = {}
  ): Promise<unknown | null> {
    try {
      const cacheEntry = await this.prisma.aPICache.findUnique({
        where: { cacheKey },
      });

      if (!cacheEntry) {
        await this.recordCacheMiss(cacheKey);
        return null;
      }

      // Check if cache is expired
      if (new Date() > cacheEntry.expiresAt) {
        await this.prisma.aPICache.delete({ where: { cacheKey } });
        await this.recordCacheMiss(cacheKey);
        return null;
      }

      // Check if max hits reached
      if (options.maxHits && cacheEntry.hitCount >= options.maxHits) {
        await this.prisma.aPICache.delete({ where: { cacheKey } });
        await this.recordCacheMiss(cacheKey);
        return null;
      }

      // Update hit count and last accessed
      await this.prisma.aPICache.update({
        where: { cacheKey },
        data: {
          hitCount: { increment: 1 },
          lastAccessed: new Date(),
        },
      });

      await this.recordCacheHit(cacheKey);
      return cacheEntry.response;
    } catch (error) {
      console.error("Error getting cached data:", error);
      return null;
    }
  }

  /**
   * Store API response in cache
   */
  async setCachedData(
    cacheKey: string,
    data: unknown,
    endpoint: string,
    params: Record<string, unknown>,
    options: CacheOptions = {}
  ): Promise<void> {
    try {
      const ttl = options.ttl || (await this.getDefaultTTL(endpoint));
      const expiresAt = new Date(Date.now() + ttl * 1000);

      await this.prisma.aPICache.upsert({
        where: { cacheKey },
        update: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          response: data as any,
          expiresAt,
          hitCount: 0,
          lastAccessed: new Date(),
        },
        create: {
          cacheKey,
          endpoint,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          parameters: params as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          response: data as any,
          expiresAt,
          userId: options.userId,
        },
      });
    } catch (error) {
      console.error("Error setting cached data:", error);
    }
  }

  /**
   * Invalidate cache entries by pattern
   */
  async invalidateCache(pattern: string): Promise<void> {
    try {
      await this.prisma.aPICache.deleteMany({
        where: {
          endpoint: {
            contains: pattern,
          },
        },
      });
    } catch (error) {
      console.error("Error invalidating cache:", error);
    }
  }

  /**
   * Clean up expired cache entries
   */
  async cleanupExpiredCache(): Promise<void> {
    try {
      await this.prisma.aPICache.deleteMany({
        where: {
          expiresAt: {
            lt: new Date(),
          },
        },
      });
    } catch (error) {
      console.error("Error cleaning up expired cache:", error);
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(endpoint?: string, date?: Date): Promise<CacheStats> {
    try {
      const whereClause: Record<string, unknown> = {};
      if (endpoint) whereClause.endpoint = endpoint;
      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        whereClause.date = { gte: startOfDay, lte: endOfDay };
      }

      const stats = await this.prisma.cacheStats.findMany({
        where: whereClause,
      });

      const totalStats = stats.reduce(
        (acc, stat) => ({
          totalRequests: acc.totalRequests + stat.totalRequests,
          cacheHits: acc.cacheHits + stat.cacheHits,
          cacheMisses: acc.cacheMisses + stat.cacheMisses,
          apiCalls: acc.apiCalls + stat.apiCalls,
          averageResponseTime:
            acc.averageResponseTime + stat.averageResponseTime,
        }),
        {
          totalRequests: 0,
          cacheHits: 0,
          cacheMisses: 0,
          apiCalls: 0,
          averageResponseTime: 0,
        }
      );

      return {
        ...totalStats,
        hitRate:
          totalStats.totalRequests > 0
            ? totalStats.cacheHits / totalStats.totalRequests
            : 0,
        averageResponseTime:
          stats.length > 0 ? totalStats.averageResponseTime / stats.length : 0,
      };
    } catch (error) {
      console.error("Error getting cache stats:", error);
      return {
        totalRequests: 0,
        cacheHits: 0,
        cacheMisses: 0,
        apiCalls: 0,
        hitRate: 0,
        averageResponseTime: 0,
      };
    }
  }

  /**
   * Get or create cache configuration for an endpoint
   */
  async getCacheConfig(endpoint: string): Promise<CacheConfig> {
    try {
      let config = await this.prisma.cacheConfig.findUnique({
        where: { endpoint },
      });

      if (!config) {
        // Create default config
        config = await this.prisma.cacheConfig.create({
          data: {
            endpoint,
            ttl: this.getDefaultTTLForEndpoint(endpoint),
            isActive: true,
            priority: 5,
          },
        });
      }

      return config;
    } catch (error) {
      console.error("Error getting cache config:", error);
      return {
        endpoint,
        ttl: this.getDefaultTTLForEndpoint(endpoint),
        isActive: true,
        priority: 5,
      };
    }
  }

  /**
   * Update cache configuration
   */
  async updateCacheConfig(
    config: Partial<CacheConfig> & { endpoint: string }
  ): Promise<void> {
    try {
      await this.prisma.cacheConfig.upsert({
        where: { endpoint: config.endpoint },
        update: config,
        create: {
          endpoint: config.endpoint,
          ttl: config.ttl || this.getDefaultTTLForEndpoint(config.endpoint),
          maxHits: config.maxHits,
          isActive: config.isActive ?? true,
          priority: config.priority || 5,
        },
      });
    } catch (error) {
      console.error("Error updating cache config:", error);
    }
  }

  /**
   * Record cache hit for statistics
   */
  private async recordCacheHit(cacheKey: string): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await this.prisma.cacheStats.upsert({
        where: {
          date_endpoint: {
            date: today,
            endpoint: cacheKey.split(":")[0],
          },
        },
        update: {
          totalRequests: { increment: 1 },
          cacheHits: { increment: 1 },
        },
        create: {
          date: today,
          endpoint: cacheKey.split(":")[0],
          totalRequests: 1,
          cacheHits: 1,
          cacheMisses: 0,
          apiCalls: 0,
          averageResponseTime: 0,
        },
      });
    } catch (error) {
      console.error("Error recording cache hit:", error);
    }
  }

  /**
   * Record cache miss for statistics
   */
  private async recordCacheMiss(cacheKey: string): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      await this.prisma.cacheStats.upsert({
        where: {
          date_endpoint: {
            date: today,
            endpoint: cacheKey.split(":")[0],
          },
        },
        update: {
          totalRequests: { increment: 1 },
          cacheMisses: { increment: 1 },
        },
        create: {
          date: today,
          endpoint: cacheKey.split(":")[0],
          totalRequests: 1,
          cacheHits: 0,
          cacheMisses: 1,
          apiCalls: 0,
          averageResponseTime: 0,
        },
      });
    } catch (error) {
      console.error("Error recording cache miss:", error);
    }
  }

  /**
   * Record API call for statistics with actual credit tracking
   */
  async recordAPICall(
    endpoint: string,
    responseTime: number,
    userId?: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    success: boolean = true,
    errorMessage?: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    cacheHit: boolean = false,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    requestParams?: Record<string, unknown>
  ): Promise<void> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Calculate the new average response time first
      const newAverage = await this.calculateNewAverage(endpoint, responseTime);

      // Update legacy CacheStats for backward compatibility
      await this.prisma.cacheStats.upsert({
        where: {
          date_endpoint: {
            date: today,
            endpoint,
          },
        },
        update: {
          apiCalls: { increment: 1 },
          averageResponseTime: newAverage,
        },
        create: {
          date: today,
          endpoint,
          totalRequests: 0,
          cacheHits: 0,
          cacheMisses: 0,
          apiCalls: 1,
          averageResponseTime: responseTime,
        },
      });

      // Note: Credit tracking is now handled by EnhancedCacheService
      // Use recordApiUsage method for accurate credit consumption tracking
    } catch (error) {
      console.error("💥 Error recording API call:", error);
    }
  }

  /**
   * Get service name from endpoint
   */
  private getServiceNameFromEndpoint(endpoint: string): string {
    if (endpoint.startsWith("majestic.")) return "Majestic";
    if (endpoint.startsWith("dataforseo.")) return "DataForSeo";
    if (endpoint.startsWith("semrush.")) return "SEMRush";
    return "unknown";
  }

  /**
   * Calculate new average response time
   */
  private async calculateNewAverage(
    endpoint: string,
    newResponseTime: number
  ): Promise<number> {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const stats = await this.prisma.cacheStats.findUnique({
        where: {
          date_endpoint: {
            date: today,
            endpoint,
          },
        },
      });

      if (!stats) return newResponseTime;

      const currentAvg = stats.averageResponseTime;
      const currentCalls = stats.apiCalls;
      const newCalls = currentCalls + 1;

      return (currentAvg * currentCalls + newResponseTime) / newCalls;
    } catch (error) {
      console.error("Error calculating new average:", error);
      return newResponseTime;
    }
  }

  /**
   * Get default TTL for an endpoint
   */
  private async getDefaultTTL(endpoint: string): Promise<number> {
    const config = await this.getCacheConfig(endpoint);
    return config.ttl;
  }

  /**
   * Get default TTL for endpoint type
   */
  private getDefaultTTLForEndpoint(endpoint: string): number {
    const ttlMap: Record<string, number> = {
      // Majestic endpoints
      "majestic.backlinkData": 24 * 60 * 60, // 24 hours
      "majestic.indexItemInfo": 7 * 24 * 60 * 60, // 7 days
      "majestic.refDomains": 24 * 60 * 60, // 24 hours
      "majestic.anchorText": 7 * 24 * 60 * 60, // 7 days
      "majestic.topics": 7 * 24 * 60 * 60, // 7 days
      "majestic.topPages": 24 * 60 * 60, // 24 hours
      "majestic.newLostBacklinks": 6 * 60 * 60, // 6 hours
      "majestic.hostedDomains": 24 * 60 * 60, // 24 hours

      // DataForSEO endpoints
      "dataforseo.serpData": 6 * 60 * 60, // 6 hours
      "dataforseo.keywordMetrics": 30 * 24 * 60 * 60, // 30 days
      "dataforseo.trends": 24 * 60 * 60, // 24 hours
      "dataforseo.keywordOverview": 7 * 24 * 60 * 60, // 7 days
      "dataforseo.relatedKeywords": 7 * 24 * 60 * 60, // 7 days
      "dataforseo.domainTechnologies": 30 * 24 * 60 * 60, // 30 days
      "dataforseo.keywordsForSite": 7 * 24 * 60 * 60, // 7 days

      // SEMrush endpoints
      "semrush.domainOverview": 24 * 60 * 60, // 24 hours
      "semrush.domainOrganic": 24 * 60 * 60, // 24 hours
      "semrush.domainOrganicGross": 24 * 60 * 60, // 24 hours
      "semrush.keywordAnalytics": 30 * 24 * 60 * 60, // 30 days
      "semrush.keywordSuggestions": 7 * 24 * 60 * 60, // 7 days
    };

    return ttlMap[endpoint] || 24 * 60 * 60; // Default 24 hours
  }

  /**
   * Close database connection
   */
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
