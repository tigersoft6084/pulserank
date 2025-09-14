import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { SERPCollectionService } from "@/lib/services/serp-collection.service";
import { handleAPIError, AuthenticationError } from "@/lib/utils/error-handler";

export async function POST(req: NextRequest) {
  try {
    const session = await getUser();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    await req.json(); // Consume request body

    const serpService = new SERPCollectionService();

    try {
      const result = await serpService.collectSERPDataForKeywords();

      return NextResponse.json({
        success: true,
        message: "SERP data collection completed",
        result,
      });
    } finally {
      await serpService.cleanup();
    }
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}

// Endpoint for cron jobs (no authentication required)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get("secret");

    // Verify cron secret
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const serpService = new SERPCollectionService();

    try {
      const result = await serpService.collectSERPDataForKeywords();

      return NextResponse.json({
        success: true,
        message: "SERP data collection completed",
        result,
        timestamp: new Date().toISOString(),
      });
    } finally {
      await serpService.cleanup();
    }
  } catch (error) {
    console.error("Cron SERP collection error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
