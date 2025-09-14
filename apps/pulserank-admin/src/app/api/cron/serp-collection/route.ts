import { NextRequest, NextResponse } from "next/server";
import { SERPCollectionService } from "@/services/serp-collection.service";

export async function GET(request: NextRequest) {
  const secret = request.headers.get("Authorization");
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    console.log("Starting automated SERP data collection...");

    const serpService = new SERPCollectionService();

    try {
      const result = await serpService.collectSERPDataForKeywords();

      console.log("Automated SERP collection completed:", result);

      return NextResponse.json({
        success: true,
        message: "Automated SERP data collection completed",
        result,
        timestamp: new Date().toISOString(),
      });
    } finally {
      await serpService.cleanup();
    }
  } catch (error) {
    console.error("Automated SERP collection error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
