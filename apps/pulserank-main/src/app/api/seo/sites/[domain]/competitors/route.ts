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
    const limit = parseInt(searchParams.get("limit") || "5");
    const database = searchParams.get("database") || "us";

    const competitors = await semrush.getDomainCompetitors(
      domain,
      database,
      limit,
      {
        userId: session.user.id,
      }
    );

    return NextResponse.json({
      data: competitors,
      totalCount: competitors.length,
    });
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
