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
    const groupBy = searchParams.get("groupBy") || "service"; // "service" or "user"

    // Parse timeframe
    const timeRange = ApiUsageService.parseTimeframe(timeframe);

    if (groupBy === "service") {
      // Get service-level usage statistics
      const serviceStats =
        await apiUsageService.getServiceUsageStats(timeRange);
      const summary = await apiUsageService.getUsageSummary(timeRange);

      return NextResponse.json({
        success: true,
        data: serviceStats,
        timeframe,
        groupBy,
        summary: {
          totalCalls: summary.totalCalls,
          totalCreditsUsed: summary.totalCreditsUsed,
          totalCost: summary.totalCost,
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

      return NextResponse.json({
        success: true,
        data: userStats,
        timeframe,
        groupBy,
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
    console.error("Error fetching API usage stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch API usage statistics" },
      { status: 500 }
    );
  }
}
