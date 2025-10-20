import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { CachedSEMrushClient } from "@/lib/api/cached-semrush";
import { CacheService } from "@/lib/services/cache.service";
import {
  handleAPIError,
  ValidationError,
  AuthenticationError,
} from "@/lib/utils/error-handler";

const cacheService = CacheService.getInstance();
const semrush = new CachedSEMrushClient(cacheService);

export async function GET(
  req: NextRequest,
  { params }: { params: { domain: string } }
) {
  try {
    const session = await getUser();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    const { domain } = await params;
    if (!domain) {
      throw new ValidationError("Domain is required");
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const database = searchParams.get("database") || "us";

    // Calculate offset and limit for SEMrush API
    // For SEMrush, we need to accumulate the limit as we go through pages
    const offset = (page - 1) * limit;
    const displayLimit = page * limit; // Accumulate the limit

    // Use the new SEMrush client method for gross keywords
    const keywords = await semrush.getDomainOrganicGross(
      domain,
      database,
      displayLimit,
      offset,
      search || undefined,
      {
        userId: session.user.id,
      }
    );

    // For SEMrush, we don't get total count from the API
    // We'll assume 1000 results are available
    const totalResults = 1000;
    const hasMoreResults = page * limit < totalResults;

    return NextResponse.json({
      data: keywords,
      pagination: {
        page,
        limit,
        total: totalResults,
        pages: Math.ceil(totalResults / limit),
        hasMore: hasMoreResults,
      },
    });
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
