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
    const groupBy = searchParams.get("groupBy") || "service"; // "service" or "user"
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
      // Group by third-party service
      const serviceStats = await prisma.cacheStats.findMany({
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

      // Group by service name (extract from endpoint)
      const serviceMap = new Map<
        string,
        {
          serviceName: string;
          totalApiCalls: number;
          totalRequests: number;
          totalCacheHits: number;
          totalCacheMisses: number;
          averageResponseTime: number;
          endpoints: string[];
          dailyBreakdown: Array<{
            date: string;
            apiCalls: number;
            requests: number;
            cacheHits: number;
            cacheMisses: number;
          }>;
        }
      >();

      serviceStats.forEach((stat) => {
        const serviceName = stat.endpoint.split(".")[0]; // Extract service name
        const existing = serviceMap.get(serviceName) || {
          serviceName,
          totalApiCalls: 0,
          totalRequests: 0,
          totalCacheHits: 0,
          totalCacheMisses: 0,
          averageResponseTime: 0,
          endpoints: [],
          dailyBreakdown: [],
        };

        existing.totalApiCalls += stat.apiCalls;
        existing.totalRequests += stat.totalRequests;
        existing.totalCacheHits += stat.cacheHits;
        existing.totalCacheMisses += stat.cacheMisses;
        existing.averageResponseTime += stat.averageResponseTime;

        if (!existing.endpoints.includes(stat.endpoint)) {
          existing.endpoints.push(stat.endpoint);
        }

        // Add to daily breakdown
        const dateStr = stat.date.toISOString().split("T")[0];
        let dayData = existing.dailyBreakdown.find((d) => d.date === dateStr);
        if (!dayData) {
          dayData = {
            date: dateStr,
            apiCalls: 0,
            requests: 0,
            cacheHits: 0,
            cacheMisses: 0,
          };
          existing.dailyBreakdown.push(dayData);
        }
        dayData.apiCalls += stat.apiCalls;
        dayData.requests += stat.totalRequests;
        dayData.cacheHits += stat.cacheHits;
        dayData.cacheMisses += stat.cacheMisses;

        serviceMap.set(serviceName, existing);
      });

      // Calculate averages and sort
      const serviceData = Array.from(serviceMap.values())
        .map((service) => ({
          ...service,
          averageResponseTime:
            service.totalApiCalls > 0
              ? service.averageResponseTime / service.totalApiCalls
              : 0,
          hitRate:
            service.totalRequests > 0
              ? service.totalCacheHits / service.totalRequests
              : 0,
          dailyBreakdown: service.dailyBreakdown.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          ),
        }))
        .sort((a, b) => b.totalApiCalls - a.totalApiCalls);

      return NextResponse.json({
        success: true,
        data: serviceData,
        timeframe,
        groupBy,
        totalApiCalls: serviceData.reduce(
          (sum, service) => sum + service.totalApiCalls,
          0
        ),
        totalRequests: serviceData.reduce(
          (sum, service) => sum + service.totalRequests,
          0
        ),
      });
    } else if (groupBy === "user") {
      // Group by user - this would require user tracking in API calls
      // For now, return a message that user tracking needs to be implemented
      return NextResponse.json({
        success: false,
        message:
          "User-level API usage tracking is not yet implemented. API calls are not currently associated with specific users.",
        suggestion:
          "To enable user-level tracking, modify the recordAPICall method to include userId parameter.",
      });
    }

    return NextResponse.json({
      success: false,
      error: "Invalid groupBy parameter. Use 'service' or 'user'",
    });
  } catch (error) {
    console.error("Error fetching API usage stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch API usage statistics" },
      { status: 500 }
    );
  }
}
