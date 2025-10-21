import { prisma } from "@repo/db";

export interface ApiUsageStats {
  serviceName: string;
  endpoint: string;
  totalCalls: number;
  totalCreditsUsed: number;
  totalCost: number;
  averageResponseTime: number;
  cacheHits: number;
  cacheMisses: number;
  errors: number;
  uniqueUsers: number;
  hitRate: number;
  errorRate: number;
  averageCreditsPerCall: number;
  averageCostPerCall: number;
  // Service-specific credit totals
  majesticCredits: {
    indexItemResUnits: number;
    retrievalResUnits: number;
    analysisResUnits: number;
  };
  dataforseoCredits: {
    balanceUsed: number;
  };
  semrushCredits: {
    apiUnitsUsed: number;
  };
}

export interface UserApiUsageStats {
  userId: string;
  userName: string;
  userEmail: string;
  userImage?: string | null;
  totalCalls: number;
  totalCreditsUsed: number;
  totalCost: number;
  services: {
    serviceName: string;
    totalCalls: number;
    majesticCredits?: {
      indexItemResUnits: number;
      retrievalResUnits: number;
      analysisResUnits: number;
    };
    dataforseoCredits?: {
      balanceUsed: number;
    };
    semrushCredits?: {
      apiUnitsUsed: number;
    };
  }[];
  lastActiveAt: Date;
  isActive: boolean;
}

export interface ApiUsageTimeframe {
  startDate: Date;
  endDate: Date;
  timeframe: string;
}

export class ApiUsageService {
  private static instance: ApiUsageService;
  private prisma = prisma;

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): ApiUsageService {
    if (!ApiUsageService.instance) {
      ApiUsageService.instance = new ApiUsageService();
    }
    return ApiUsageService.instance;
  }

  /**
   * Get API usage statistics grouped by service
   */
  async getServiceUsageStats(
    timeframe: ApiUsageTimeframe
  ): Promise<ApiUsageStats[]> {
    try {
      const stats = await this.prisma.apiUsageStats.findMany({
        where: {
          date: {
            gte: timeframe.startDate,
            lte: timeframe.endDate,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Group by service and endpoint
      const serviceMap = new Map<string, ApiUsageStats>();

      stats.forEach((stat) => {
        const key = `${stat.serviceName}-${stat.endpoint}`;
        const existing = serviceMap.get(key);

        if (existing) {
          existing.totalCalls += stat.totalCalls;
          existing.totalCreditsUsed += this.calculateTotalCredits(stat);
          existing.totalCost += this.calculateTotalCost(stat);
          existing.cacheHits += stat.cacheHits;
          existing.cacheMisses += stat.cacheMisses;
          existing.errors += stat.errors;
          existing.averageResponseTime =
            (existing.averageResponseTime + stat.averageResponseTime) / 2;
        } else {
          serviceMap.set(key, {
            serviceName: stat.serviceName,
            endpoint: stat.endpoint,
            totalCalls: stat.totalCalls,
            totalCreditsUsed: this.calculateTotalCredits(stat),
            totalCost: this.calculateTotalCost(stat),
            averageResponseTime: stat.averageResponseTime,
            cacheHits: stat.cacheHits,
            cacheMisses: stat.cacheMisses,
            errors: stat.errors,
            uniqueUsers: 1,
            hitRate: stat.totalCalls > 0 ? stat.cacheHits / stat.totalCalls : 0,
            errorRate: stat.totalCalls > 0 ? stat.errors / stat.totalCalls : 0,
            averageCreditsPerCall:
              this.calculateTotalCredits(stat) / stat.totalCalls,
            averageCostPerCall: this.calculateTotalCost(stat) / stat.totalCalls,
            majesticCredits: {
              indexItemResUnits: stat.totalMajesticIndexItemResUnitsUsed,
              retrievalResUnits: stat.totalMajesticRetrievalResUnitsUsed,
              analysisResUnits: stat.totalMajesticAnalysisResUnitsUsed,
            },
            dataforseoCredits: {
              balanceUsed: stat.totalDataforseoBalanceUsed,
            },
            semrushCredits: {
              apiUnitsUsed: stat.totalSemrushApiUnitsUsed,
            },
          });
        }
      });

      // Calculate unique users for each service
      const uniqueUsersMap = new Map<string, Set<string>>();
      stats.forEach((stat) => {
        const key = `${stat.serviceName}-${stat.endpoint}`;
        if (!uniqueUsersMap.has(key)) {
          uniqueUsersMap.set(key, new Set());
        }
        if (stat.userId) {
          uniqueUsersMap.get(key)!.add(stat.userId);
        }
      });

      // Update unique users count
      uniqueUsersMap.forEach((userSet, key) => {
        const stat = serviceMap.get(key);
        if (stat) {
          stat.uniqueUsers = userSet.size;
        }
      });

      return Array.from(serviceMap.values()).sort(
        (a, b) => b.totalCalls - a.totalCalls
      );
    } catch (error) {
      console.error("Error getting service usage stats:", error);
      return [];
    }
  }

  /**
   * Get API usage statistics grouped by user
   */
  async getUserUsageStats(
    timeframe: ApiUsageTimeframe
  ): Promise<UserApiUsageStats[]> {
    try {
      const stats = await this.prisma.apiUsageStats.findMany({
        where: {
          date: {
            gte: timeframe.startDate,
            lte: timeframe.endDate,
          },
          userId: {
            not: "",
          },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
              lastActiveAt: true,
              userOrders: {
                where: {
                  status: "ACTIVE",
                },
                select: {
                  id: true,
                },
              },
            },
          },
        },
      });

      // Group by user
      const userMap = new Map<string, UserApiUsageStats>();

      stats.forEach((stat) => {
        if (!stat.user || !stat.userId) return;

        const existing = userMap.get(stat.userId);

        if (existing) {
          existing.totalCalls += stat.totalCalls;
          existing.totalCreditsUsed += this.calculateTotalCredits(stat);
          existing.totalCost += this.calculateTotalCost(stat);

          // Update or add service
          const existingService = existing.services.find(
            (s) => s.serviceName === stat.serviceName
          );
          if (existingService) {
            existingService.totalCalls += stat.totalCalls;
            // Update credits
            if (stat.serviceName === "Majestic") {
              existingService.majesticCredits = {
                indexItemResUnits:
                  (existingService.majesticCredits?.indexItemResUnits || 0) +
                  (stat.totalMajesticIndexItemResUnitsUsed || 0),
                retrievalResUnits:
                  (existingService.majesticCredits?.retrievalResUnits || 0) +
                  (stat.totalMajesticRetrievalResUnitsUsed || 0),
                analysisResUnits:
                  (existingService.majesticCredits?.analysisResUnits || 0) +
                  (stat.totalMajesticAnalysisResUnitsUsed || 0),
              };
            } else if (stat.serviceName === "DataForSeo") {
              existingService.dataforseoCredits = {
                balanceUsed:
                  (existingService.dataforseoCredits?.balanceUsed || 0) +
                  (stat.totalDataforseoBalanceUsed || 0),
              };
            } else if (stat.serviceName === "SEMRush") {
              existingService.semrushCredits = {
                apiUnitsUsed:
                  (existingService.semrushCredits?.apiUnitsUsed || 0) +
                  (stat.totalSemrushApiUnitsUsed || 0),
              };
            }
          } else {
            // Add new service
            const newService: {
              serviceName: string;
              totalCalls: number;
              majesticCredits?: {
                indexItemResUnits: number;
                retrievalResUnits: number;
                analysisResUnits: number;
              };
              dataforseoCredits?: {
                balanceUsed: number;
              };
              semrushCredits?: {
                apiUnitsUsed: number;
              };
            } = {
              serviceName: stat.serviceName,
              totalCalls: stat.totalCalls,
            };

            if (stat.serviceName === "Majestic") {
              newService.majesticCredits = {
                indexItemResUnits: stat.totalMajesticIndexItemResUnitsUsed || 0,
                retrievalResUnits: stat.totalMajesticRetrievalResUnitsUsed || 0,
                analysisResUnits: stat.totalMajesticAnalysisResUnitsUsed || 0,
              };
            } else if (stat.serviceName === "DataForSeo") {
              newService.dataforseoCredits = {
                balanceUsed: stat.totalDataforseoBalanceUsed || 0,
              };
            } else if (stat.serviceName === "SEMRush") {
              newService.semrushCredits = {
                apiUnitsUsed: stat.totalSemrushApiUnitsUsed || 0,
              };
            }

            existing.services.push(newService);
          }
        } else {
          // Create new user entry
          const services: {
            serviceName: string;
            totalCalls: number;
            majesticCredits?: {
              indexItemResUnits: number;
              retrievalResUnits: number;
              analysisResUnits: number;
            };
            dataforseoCredits?: {
              balanceUsed: number;
            };
            semrushCredits?: {
              apiUnitsUsed: number;
            };
          }[] = [];
          const newService: {
            serviceName: string;
            totalCalls: number;
            majesticCredits?: {
              indexItemResUnits: number;
              retrievalResUnits: number;
              analysisResUnits: number;
            };
            dataforseoCredits?: {
              balanceUsed: number;
            };
            semrushCredits?: {
              apiUnitsUsed: number;
            };
          } = {
            serviceName: stat.serviceName,
            totalCalls: stat.totalCalls,
          };

          if (stat.serviceName === "Majestic") {
            newService.majesticCredits = {
              indexItemResUnits: stat.totalMajesticIndexItemResUnitsUsed || 0,
              retrievalResUnits: stat.totalMajesticRetrievalResUnitsUsed || 0,
              analysisResUnits: stat.totalMajesticAnalysisResUnitsUsed || 0,
            };
          } else if (stat.serviceName === "DataForSeo") {
            newService.dataforseoCredits = {
              balanceUsed: stat.totalDataforseoBalanceUsed || 0,
            };
          } else if (stat.serviceName === "SEMRush") {
            newService.semrushCredits = {
              apiUnitsUsed: stat.totalSemrushApiUnitsUsed || 0,
            };
          }

          services.push(newService);

          userMap.set(stat.userId, {
            userId: stat.userId,
            userName: stat.user.name || stat.user.email,
            userEmail: stat.user.email,
            userImage: stat.user.image,
            totalCalls: stat.totalCalls,
            totalCreditsUsed: this.calculateTotalCredits(stat),
            totalCost: this.calculateTotalCost(stat),
            services,
            lastActiveAt: stat.user.lastActiveAt,
            isActive: (stat.user.userOrders?.length || 0) > 0,
          });
        }
      });

      return Array.from(userMap.values()).sort(
        (a, b) => b.totalCalls - a.totalCalls
      );
    } catch (error) {
      console.error("Error getting user usage stats:", error);
      return [];
    }
  }

  /**
   * Get detailed API usage logs for a specific user
   */
  async getUserApiLogs(
    userId: string,
    timeframe: ApiUsageTimeframe,
    limit: number = 100
  ): Promise<
    Array<{
      id: string;
      userId: string | null;
      serviceName: string;
      endpoint: string;
      requestParams: unknown;
      responseTime: number;
      success: boolean;
      errorMessage: string | null;
      cacheHit: boolean;
      majesticIndexItemResUnitsUsed: number | null;
      majesticRetrievalResUnitsUsed: number | null;
      majesticAnalysisResUnitsUsed: number | null;
      dataforseoBalanceUsed: number | null;
      semrushApiUnitsUsed: number | null;
      createdAt: Date;
    }>
  > {
    try {
      const logs = await this.prisma.apiUsageLog.findMany({
        where: {
          userId,
          createdAt: {
            gte: timeframe.startDate,
            lte: timeframe.endDate,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit,
      });

      return logs;
    } catch (error) {
      console.error("Error getting user API logs:", error);
      return [];
    }
  }

  /**
   * Get API usage summary for dashboard
   */
  async getUsageSummary(timeframe: ApiUsageTimeframe): Promise<{
    totalCalls: number;
    totalCreditsUsed: number;
    totalCost: number;
    totalUsers: number;
    activeUsers: number;
    services: number;
    averageResponseTime: number;
    cacheHitRate: number;
    errorRate: number;
  }> {
    try {
      const stats = await this.prisma.apiUsageStats.findMany({
        where: {
          date: {
            gte: timeframe.startDate,
            lte: timeframe.endDate,
          },
        },
        include: {
          user: {
            select: {
              id: true,
              userOrders: {
                where: {
                  status: "ACTIVE",
                },
                select: {
                  id: true,
                },
              },
            },
          },
        },
      });

      const summary = stats.reduce(
        (acc, stat) => {
          acc.totalCalls += stat.totalCalls;
          acc.totalCreditsUsed += this.calculateTotalCredits(stat);
          acc.totalCost += this.calculateTotalCost(stat);
          acc.averageResponseTime += stat.averageResponseTime;
          acc.cacheHits += stat.cacheHits;
          acc.cacheMisses += stat.cacheMisses;
          acc.errors += stat.errors;
          return acc;
        },
        {
          totalCalls: 0,
          totalCreditsUsed: 0,
          totalCost: 0,
          averageResponseTime: 0,
          cacheHits: 0,
          cacheMisses: 0,
          errors: 0,
        }
      );

      // Calculate unique users
      const uniqueUsers = new Set<string>();
      const activeUsers = new Set<string>();
      stats.forEach((stat) => {
        if (stat.userId) {
          uniqueUsers.add(stat.userId);
          if (stat.user?.userOrders && stat.user.userOrders.length > 0) {
            activeUsers.add(stat.userId);
          }
        }
      });

      // Calculate unique services
      const uniqueServices = new Set<string>();
      stats.forEach((stat) => {
        uniqueServices.add(stat.serviceName);
      });

      return {
        totalCalls: summary.totalCalls,
        totalCreditsUsed: summary.totalCreditsUsed,
        totalCost: summary.totalCost,
        totalUsers: uniqueUsers.size,
        activeUsers: activeUsers.size,
        services: uniqueServices.size,
        averageResponseTime:
          stats.length > 0 ? summary.averageResponseTime / stats.length : 0,
        cacheHitRate:
          summary.totalCalls > 0 ? summary.cacheHits / summary.totalCalls : 0,
        errorRate:
          summary.totalCalls > 0 ? summary.errors / summary.totalCalls : 0,
      };
    } catch (error) {
      console.error("Error getting usage summary:", error);
      return {
        totalCalls: 0,
        totalCreditsUsed: 0,
        totalCost: 0,
        totalUsers: 0,
        activeUsers: 0,
        services: 0,
        averageResponseTime: 0,
        cacheHitRate: 0,
        errorRate: 0,
      };
    }
  }

  /**
   * Calculate total credits used from API usage stats
   */
  private calculateTotalCredits(stat: {
    totalMajesticIndexItemResUnitsUsed: number;
    totalMajesticRetrievalResUnitsUsed: number;
    totalMajesticAnalysisResUnitsUsed: number;
    totalSemrushApiUnitsUsed: number;
    totalDataforseoBalanceUsed: number;
  }): number {
    return (
      stat.totalMajesticIndexItemResUnitsUsed +
      stat.totalMajesticRetrievalResUnitsUsed +
      stat.totalMajesticAnalysisResUnitsUsed +
      stat.totalSemrushApiUnitsUsed +
      stat.totalDataforseoBalanceUsed
    );
  }

  /**
   * Calculate total cost from API usage stats
   * This is a simplified calculation - in reality, you'd need to apply
   * actual pricing per service
   */
  private calculateTotalCost(stat: {
    totalMajesticIndexItemResUnitsUsed: number;
    totalMajesticRetrievalResUnitsUsed: number;
    totalMajesticAnalysisResUnitsUsed: number;
    totalSemrushApiUnitsUsed: number;
    totalDataforseoBalanceUsed: number;
  }): number {
    // Simplified cost calculation
    // Majestic: ~$0.01 per credit
    // DataForSEO: ~$0.01 per credit
    // Semrush: ~$0.01 per API unit
    const majesticCost =
      (stat.totalMajesticIndexItemResUnitsUsed +
        stat.totalMajesticRetrievalResUnitsUsed +
        stat.totalMajesticAnalysisResUnitsUsed) *
      0.01;

    const dataforseoCost = stat.totalDataforseoBalanceUsed * 0.01;
    const semrushCost = stat.totalSemrushApiUnitsUsed * 0.01;

    return majesticCost + dataforseoCost + semrushCost;
  }

  /**
   * Parse timeframe string to date range
   */
  static parseTimeframe(timeframe: string): ApiUsageTimeframe {
    const now = new Date();
    let startDate: Date;

    switch (timeframe) {
      case "1d":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    return {
      startDate,
      endDate: now,
      timeframe,
    };
  }

  /**
   * Close database connection
   */
  async disconnect(): Promise<void> {
    await this.prisma.$disconnect();
  }
}
