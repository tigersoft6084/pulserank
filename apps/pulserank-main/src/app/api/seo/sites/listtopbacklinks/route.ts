import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { CachedMajesticClient } from "@/lib/api/cached-majestic";
import { CacheService } from "@/lib/services/cache.service";
import {
  handleAPIError,
  ValidationError,
  AuthenticationError,
} from "@/lib/utils/error-handler";

const cacheService = CacheService.getInstance();
const majestic = new CachedMajesticClient(cacheService);

export async function POST(req: NextRequest) {
  try {
    const session = await getUser();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    const { items } = await req.json();
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new ValidationError("Items array is required");
    }

    // Fetch backlink data for all domains
    const allBacklinkData = [];

    for (const item of items) {
      const backlinkData = await majestic.getBacklinkData(
        item,
        "fresh",
        1, // Mode = 1 to exclude deleted backlinks
        undefined,
        1,
        100,
        0,
        {
          userId: session.user.id,
        },
      );

      const domainData = backlinkData.map((item) => ({
        SourceURL: item.SourceURL,
        AnchorText: item.AnchorText,
        TargetURL: item.TargetURL,
        Flags: item.Flags,
        LastSeenDate: item.LastSeenDate,
        SourceTrustFlow: item.SourceTrustFlow,
        SourceTopicalTrustFlow_Topic_0: item.SourceTopicalTrustFlow_Topic_0,
        SourceTopicalTrustFlow_Value_0: item.SourceTopicalTrustFlow_Value_0,
        Domain: new URL(item.TargetURL).hostname, // Extract domain from TargetURL
      }));

      allBacklinkData.push(...domainData);
    }

    // Sort all data by TTF value (descending)
    const data = allBacklinkData.sort(
      (a, b) => b.SourceTrustFlow - a.SourceTrustFlow,
    );

    return NextResponse.json({
      data,
    });
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
