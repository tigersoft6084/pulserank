import { NextRequest, NextResponse } from "next/server";
import { BacklinksCollectionService } from "@/services/backlinks-collection.service";
export async function GET(request: NextRequest) {
  const secret = request.headers.get("Authorization");
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const backlinksService = new BacklinksCollectionService();

    try {
      const result = await backlinksService.collectBacklinksForWatchlist();

      return NextResponse.json({
        success: true,
        message: "Automated backlinks collection completed",
        result,
        timestamp: new Date().toISOString(),
      });
    } finally {
      await backlinksService.cleanup();
    }
  } catch (error) {
    console.error("Automated backlinks collection error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
