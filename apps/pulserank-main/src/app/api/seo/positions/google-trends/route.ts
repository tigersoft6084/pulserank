import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { CachedDataForSEOClient } from "@/lib/api/cached-dataforseo";
import { CacheService } from "@/lib/services/cache.service";
import {
  handleAPIError,
  ValidationError,
  AuthenticationError,
} from "@/lib/utils/error-handler";
import { BASE_DATA } from "@/lib/config";

const cacheService = CacheService.getInstance();
const dataForSEO = new CachedDataForSEOClient(cacheService);

export async function POST(req: NextRequest) {
  try {
    const session = await getUser();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    const { keyword, base = "com_en" } = await req.json();
    console.log("😊keyword", keyword);
    console.log("😊base", base);
    if (!keyword) {
      throw new ValidationError("Keyword is required");
    }

    // Get location and language codes from the selected base
    const baseConfig = BASE_DATA[base as keyof typeof BASE_DATA];
    if (!baseConfig) {
      throw new ValidationError("Invalid base selected");
    }

    // Get Google Trends data from DataForSEO
    const trendsData = await dataForSEO.getGoogleTrends(
      [keyword],
      baseConfig.location_code,
      baseConfig.language_code,
      undefined, // dateFrom - will use last 4 years
      undefined, // dateTo - will use today
      {
        userId: session.user.id,
      }
    );

    return NextResponse.json(trendsData);
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
