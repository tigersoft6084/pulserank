import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { CachedSEMrushClient } from "@/lib/api/cached-semrush";
import { CacheService } from "@/lib/services/cache.service";
import {
  handleAPIError,
  ValidationError,
  AuthenticationError,
} from "@/lib/utils/error-handler";

const cacheService = new CacheService();
const semrush = new CachedSEMrushClient(cacheService);

export async function GET(
  req: NextRequest,
  { params }: { params: { domain: string } },
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
    const database = searchParams.get("database") || "us";

    // SEMrush subdomain_organic_unique endpoint doesn't support pagination
    // We'll fetch a larger dataset and handle pagination on our side
    const maxResults = 1000; // Maximum results to fetch from SEMrush
    const displayLimit = Math.min(maxResults, limit * 10); // Fetch more data to allow pagination

    // Fetch subdomain organic data
    const subdomainData = await semrush.getSubdomainOrganicUnique(
      domain,
      database,
      displayLimit,
      {
        userId: session.user.id,
      },
    );

    // Handle pagination on our side
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedData = subdomainData.slice(startIndex, endIndex);

    const totalResults = subdomainData.length;
    const totalPages = Math.ceil(totalResults / limit);
    const hasMoreResults = page < totalPages;

    return NextResponse.json({
      data: paginatedData,
      pagination: {
        page,
        limit,
        total: totalResults,
        pages: totalPages,
        hasMore: hasMoreResults,
      },
    });
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
