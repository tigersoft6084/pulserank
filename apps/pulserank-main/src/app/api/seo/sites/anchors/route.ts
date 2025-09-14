import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { CachedMajesticClient } from "@/lib/api/cached-majestic";
import { CacheService } from "@/lib/services/cache.service";
import {
  handleAPIError,
  ValidationError,
  AuthenticationError,
} from "@/lib/utils/error-handler";

const cacheService = new CacheService();
const majestic = new CachedMajesticClient(cacheService);

export async function POST(req: NextRequest) {
  try {
    const session = await getUser();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    const { url } = await req.json();
    if (!url) {
      throw new ValidationError("URL is required");
    }

    const anchorTextData = await majestic.getAnchorText(url, "fresh", 1000, {
      userId: session.user.id,
    });

    // Sort the anchors by RefDomains in descending order
    const sortedAnchors = anchorTextData.anchors.sort((a, b) => {
      return b.RefDomains - a.RefDomains;
    });

    return NextResponse.json({
      data: sortedAnchors,
      totalBacklinks: anchorTextData.TotalBacklinks,
      totalRefDomains: anchorTextData.TotalRefDomains,
    });
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
