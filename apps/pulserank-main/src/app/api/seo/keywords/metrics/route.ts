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
    if (!keyword) {
      throw new ValidationError("Keyword is required");
    }

    // Get location and language codes from the selected base
    const baseConfig = BASE_DATA[base as keyof typeof BASE_DATA];
    if (!baseConfig) {
      throw new ValidationError("Invalid base selected");
    }

    // Get keyword metrics from DataForSEO
    const metrics = await dataForSEO.getKeywordMetrics(
      keyword,
      baseConfig.location_code,
      baseConfig.language_code,
      {
        userId: session.user.id,
      }
    );

    return NextResponse.json({
      searchVolume: metrics.search_volume || 0,
      cpc: metrics.cpc || 0,
      competition: metrics.competition || 0,
      interest: 0, // Will be populated by trends if needed
    });
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
