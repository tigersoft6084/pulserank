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

    const { url, maxUrlsPerDomain = "all" } = await req.json();
    if (!url) {
      throw new ValidationError("URL is required");
    }

    // Convert maxUrlsPerDomain to number or undefined
    const maxSourceURLsPerRefDomain =
      maxUrlsPerDomain === "all" ? undefined : parseInt(maxUrlsPerDomain, 10);

    const backlinkData = await majestic.getBacklinkData(
      url,
      "fresh",
      1, // Mode = 1 to exclude deleted backlinks
      undefined,
      maxSourceURLsPerRefDomain,
      100,
      0,
      {
        userId: session.user.id,
      },
    );

    const data = backlinkData
      .map((item) => ({
        SourceURL: item.SourceURL,
        AnchorText: item.AnchorText,
        Flags: item.Flags,
        SourceTrustFlow: item.SourceTrustFlow,
        SourceCitationFlow: item.SourceCitationFlow,
        SourceTopicalTrustFlow_Topic_0: item.SourceTopicalTrustFlow_Topic_0,
        SourceTopicalTrustFlow_Value_0: item.SourceTopicalTrustFlow_Value_0,
        LastSeenDate: item.LastSeenDate,
        FirstIndexedDate: item.FirstIndexedDate,
      }))
      .sort((a, b) => b.SourceTrustFlow - a.SourceTrustFlow); // Sort by Trust Flow descending

    return NextResponse.json({
      data,
    });
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
