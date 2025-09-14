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

    const data = await semrush.getDomainOverview(domain, "us", {
      userId: session.user.id,
    });

    // Filter to last 2 years and sort by date
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    const filteredData = data
      .filter((item) => new Date(item.date) >= twoYearsAgo)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return NextResponse.json(filteredData);
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
