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

export async function POST(
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

    const { refDomain, count = 10 } = await req.json();
    if (!refDomain) {
      throw new ValidationError("RefDomain is required");
    }

    // Get backlinks with RefDomains set
    const backlinksData = await majestic.getBacklinkData(
      domain,
      "fresh",
      1, // Mode = 1 to exclude deleted backlinks
      refDomain, // RefDomain - specific referring domain
      undefined, // MaxSourceURLsPerRefDomain = 1
      count, // Count
      0, // From
      {
        userId: session.user.id,
      },
    );

    // Transform the data to match the expected format
    const transformedBacklinks = backlinksData.map((item) => ({
      URL: item.SourceURL,
      Anchor: item.AnchorText,
      Flags: item.Flags,
      TF: item.SourceTrustFlow,
      CF: item.SourceCitationFlow,
      LastSeen: item.LastSeenDate,
      Theme: [
        item.SourceTopicalTrustFlow_Topic_0 || "N/A",
        item.SourceTopicalTrustFlow_Value_0 || 0,
      ] as [string, number],
    }));

    return NextResponse.json({
      data: transformedBacklinks,
    });
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
