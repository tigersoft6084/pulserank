import { NextRequest, NextResponse } from "next/server";
import { CacheService } from "@/services/cache.service";

// This route should be protected by a cron job service like Vercel Cron
export async function GET(request: NextRequest) {
  const secret = request.headers.get("Authorization");
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const cacheService = new CacheService();

    // Clean up expired cache entries
    await cacheService.cleanupExpiredCache();

    return NextResponse.json({
      message: "Cache cleanup completed successfully",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in cache cleanup:", error);
    return NextResponse.json(
      { error: "Cache cleanup failed" },
      { status: 500 },
    );
  }
}
