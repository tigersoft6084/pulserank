import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { getUser } from "@/lib/auth";
import { ApiUsageService } from "../../../../../pulserank-main/src/lib/services/api-usage.service";

const apiUsageService = ApiUsageService.getInstance();

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

    // Parse timeframe
    const timeRange = ApiUsageService.parseTimeframe(timeframe);

    if (groupBy === "service") {
      // Get service-level usage statistics with enhanced data
      const serviceStats =
        await apiUsageService.getServiceUsageStats(timeRange);
      const summary = await apiUsageService.getUsageSummary(timeRange);

      // Transform data to match the expected format for the admin dashboard
      const transformedData = serviceStats.map((stat) => ({
        serviceName: stat.serviceName,
        totalCalls: stat.totalCalls,
        averageResponseTime: stat.averageResponseTime,
        cacheHits: stat.cacheHits,
        cacheMisses: stat.cacheMisses,
        errors: stat.errors,
        uniqueUsers: stat.uniqueUsers,
        endpoints: [stat.endpoint], // Single endpoint per stat
        hitRate: stat.hitRate,
        errorRate: stat.errorRate,
        // Service-specific credit breakdown
        majesticCredits: stat.majesticCredits,
        dataforseoCredits: stat.dataforseoCredits,
        semrushCredits: stat.semrushCredits,
      }));

      return NextResponse.json({
        success: true,
        data: transformedData,
        timeframe,
        groupBy,
        summary: {
          totalCalls: summary.totalCalls,
          totalUsers: summary.totalUsers,
          activeUsers: summary.activeUsers,
          services: summary.services,
          averageResponseTime: summary.averageResponseTime,
          cacheHitRate: summary.cacheHitRate,
          errorRate: summary.errorRate,
        },
      });
    } else if (groupBy === "user") {
      // Get user-level usage statistics
      const userStats = await apiUsageService.getUserUsageStats(timeRange);
      const summary = await apiUsageService.getUsageSummary(timeRange);

      // Transform data to match the expected format for the admin dashboard
      const transformedData = userStats.map((stat) => ({
        userId: stat.userId,
        userName: stat.userName,
        userEmail: stat.userEmail,
        estimatedApiCalls: stat.totalCalls, // Map to expected field name
        keywordCount: 0, // This would need to be calculated from actual data
        siteCount: 0, // This would need to be calculated from actual data
        planName: stat.isActive ? "Pro" : "Free", // This would need to be fetched from user orders
        lastActiveAt: stat.lastActiveAt.toISOString(),
        isActive: stat.isActive,
        totalCreditsUsed: stat.totalCreditsUsed,
        totalCost: stat.totalCost,
        services: stat.services,
      }));

      return NextResponse.json({
        success: true,
        data: transformedData,
        timeframe,
        groupBy,
        totalApiCalls: summary.totalCalls,
        totalUsers: summary.totalUsers,
        activeUsers: summary.activeUsers,
        summary: {
          totalCalls: summary.totalCalls,
          totalCreditsUsed: summary.totalCreditsUsed,
          totalCost: summary.totalCost,
          totalUsers: summary.totalUsers,
          activeUsers: summary.activeUsers,
        },
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

// Additional endpoint for getting detailed logs for a specific user
export async function POST(request: NextRequest) {
  try {
    const session = await getUser();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, timeframe = "7d", limit = 100 } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId is required" },
        { status: 400 }
      );
    }

    const timeRange = ApiUsageService.parseTimeframe(timeframe);
    const logs = await apiUsageService.getUserApiLogs(userId, timeRange, limit);

    return NextResponse.json({
      success: true,
      data: logs,
      timeframe,
      userId,
    });
  } catch (error) {
    console.error("Error fetching user API logs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch user API logs" },
      { status: 500 }
    );
  }
}
