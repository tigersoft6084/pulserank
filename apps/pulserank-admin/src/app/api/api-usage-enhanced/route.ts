import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { getUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getUser();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get("timeframe") || "7d";
    const groupBy = searchParams.get("groupBy") || "service";
    const userId = searchParams.get("userId");

    // Calculate date range
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

    if (groupBy === "service") {
      // Get comprehensive service-level statistics
      const serviceStats = await prisma.apiUsageStats.findMany({
        where: {
          date: {
            gte: startDate,
            lte: now,
          },
        },
        orderBy: {
          date: "desc",
        },
      });

      // Group by service name
      const serviceMap = new Map<
        string,
        {
          serviceName: string;
          totalCalls: number;
          totalCreditsUsed: number;
          totalCost: number;
          averageResponseTime: number;
          cacheHits: number;
          cacheMisses: number;
          errors: number;
          uniqueUsers: Set<string>;
          endpoints: string[];
          dailyBreakdown: Array<{
            date: string;
            calls: number;
            credits: number;
            cost: number;
          }>;
        }
      >();

      serviceStats.forEach((stat) => {
        const serviceName = stat.serviceName;
        const existing = serviceMap.get(serviceName) || {
          serviceName,
          totalCalls: 0,
          totalCreditsUsed: 0,
          totalCost: 0,
          averageResponseTime: 0,
          cacheHits: 0,
          cacheMisses: 0,
          errors: 0,
          uniqueUsers: new Set<string>(),
          endpoints: [],
          dailyBreakdown: [],
        };

        existing.totalCalls += stat.totalCalls;
        existing.totalCreditsUsed += stat.totalCreditsUsed;
        existing.totalCost += stat.totalCost;
        existing.cacheHits += stat.cacheHits;
        existing.cacheMisses += stat.cacheMisses;
        existing.errors += stat.errors;

        if (stat.userId) {
          existing.uniqueUsers.add(stat.userId);
        }

        if (!existing.endpoints.includes(stat.endpoint)) {
          existing.endpoints.push(stat.endpoint);
        }

        // Add to daily breakdown
        const dateStr = stat.date.toISOString().split("T")[0];
        let dayData = existing.dailyBreakdown.find((d) => d.date === dateStr);
        if (!dayData) {
          dayData = {
            date: dateStr,
            calls: 0,
            credits: 0,
            cost: 0,
          };
          existing.dailyBreakdown.push(dayData);
        }
        dayData.calls += stat.totalCalls;
        dayData.credits += stat.totalCreditsUsed;
        dayData.cost += stat.totalCost;

        serviceMap.set(serviceName, existing);
      });

      // Calculate averages and sort
      const serviceData = Array.from(serviceMap.values())
        .map((service) => ({
          ...service,
          uniqueUsers: service.uniqueUsers.size,
          hitRate:
            service.cacheHits + service.cacheMisses > 0
              ? service.cacheHits / (service.cacheHits + service.cacheMisses)
              : 0,
          errorRate:
            service.totalCalls > 0 ? service.errors / service.totalCalls : 0,
          averageCreditsPerCall:
            service.totalCalls > 0
              ? service.totalCreditsUsed / service.totalCalls
              : 0,
          averageCostPerCall:
            service.totalCalls > 0 ? service.totalCost / service.totalCalls : 0,
          dailyBreakdown: service.dailyBreakdown.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          ),
        }))
        .sort((a, b) => b.totalCreditsUsed - a.totalCreditsUsed);

      return NextResponse.json({
        success: true,
        data: serviceData,
        timeframe,
        groupBy,
        totalCalls: serviceData.reduce(
          (sum, service) => sum + service.totalCalls,
          0
        ),
        totalCreditsUsed: serviceData.reduce(
          (sum, service) => sum + service.totalCreditsUsed,
          0
        ),
        totalCost: serviceData.reduce(
          (sum, service) => sum + service.totalCost,
          0
        ),
      });
    } else if (groupBy === "user") {
      // Get user-level statistics
      const userStats = await prisma.apiUsageStats.findMany({
        where: {
          date: {
            gte: startDate,
            lte: now,
          },
          userId: userId || undefined,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              lastActiveAt: true,
              userOrders: {
                where: {
                  status: "ACTIVE",
                },
                include: {
                  plan: true,
                },
              },
            },
          },
        },
        orderBy: {
          date: "desc",
        },
      });

      // Group by user
      const userMap = new Map<
        string,
        {
          userId: string;
          userName: string;
          userEmail: string;
          lastActiveAt: Date;
          planName: string;
          totalCalls: number;
          totalCreditsUsed: number;
          totalCost: number;
          averageResponseTime: number;
          cacheHits: number;
          cacheMisses: number;
          errors: number;
          services: string[];
          dailyBreakdown: Array<{
            date: string;
            calls: number;
            credits: number;
            cost: number;
          }>;
        }
      >();

      userStats.forEach((stat) => {
        if (!stat.user) return;

        const userId = stat.userId || "unknown";
        const existing = userMap.get(userId) || {
          userId,
          userName: stat.user.name,
          userEmail: stat.user.email,
          lastActiveAt: stat.user.lastActiveAt,
          planName: stat.user.userOrders[0]?.plan?.name || "No Plan",
          totalCalls: 0,
          totalCreditsUsed: 0,
          totalCost: 0,
          averageResponseTime: 0,
          cacheHits: 0,
          cacheMisses: 0,
          errors: 0,
          services: [],
          dailyBreakdown: [],
        };

        existing.totalCalls += stat.totalCalls;
        existing.totalCreditsUsed += stat.totalCreditsUsed;
        existing.totalCost += stat.totalCost;
        existing.cacheHits += stat.cacheHits;
        existing.cacheMisses += stat.cacheMisses;
        existing.errors += stat.errors;

        if (!existing.services.includes(stat.serviceName)) {
          existing.services.push(stat.serviceName);
        }

        // Add to daily breakdown
        const dateStr = stat.date.toISOString().split("T")[0];
        let dayData = existing.dailyBreakdown.find((d) => d.date === dateStr);
        if (!dayData) {
          dayData = {
            date: dateStr,
            calls: 0,
            credits: 0,
            cost: 0,
          };
          existing.dailyBreakdown.push(dayData);
        }
        dayData.calls += stat.totalCalls;
        dayData.credits += stat.totalCreditsUsed;
        dayData.cost += stat.totalCost;

        userMap.set(userId, existing);
      });

      // Calculate averages and sort
      const userData = Array.from(userMap.values())
        .map((user) => ({
          ...user,
          hitRate:
            user.cacheHits + user.cacheMisses > 0
              ? user.cacheHits / (user.cacheHits + user.cacheMisses)
              : 0,
          errorRate: user.totalCalls > 0 ? user.errors / user.totalCalls : 0,
          averageCreditsPerCall:
            user.totalCalls > 0 ? user.totalCreditsUsed / user.totalCalls : 0,
          averageCostPerCall:
            user.totalCalls > 0 ? user.totalCost / user.totalCalls : 0,
          dailyBreakdown: user.dailyBreakdown.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          ),
        }))
        .sort((a, b) => b.totalCreditsUsed - a.totalCreditsUsed);

      return NextResponse.json({
        success: true,
        data: userData,
        timeframe,
        groupBy,
        totalCalls: userData.reduce((sum, user) => sum + user.totalCalls, 0),
        totalCreditsUsed: userData.reduce(
          (sum, user) => sum + user.totalCreditsUsed,
          0
        ),
        totalCost: userData.reduce((sum, user) => sum + user.totalCost, 0),
        totalUsers: userData.length,
        activeUsers: userData.filter((user) => user.planName !== "No Plan")
          .length,
      });
    }

    return NextResponse.json({
      success: false,
      error: "Invalid groupBy parameter. Use 'service' or 'user'",
    });
  } catch (error) {
    console.error("Error fetching enhanced API usage stats:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch enhanced API usage statistics",
      },
      { status: 500 }
    );
  }
}
