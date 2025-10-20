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

    const { count = 10, item, refdomain } = await req.json();

    if (!item) {
      throw new ValidationError("Item (domain) is required");
    }

    if (!refdomain) {
      throw new ValidationError("Refdomain is required");
    }

    const backlinkData = await majestic.getBacklinkData(
      item,
      "fresh",
      1, // Mode = 1 to exclude deleted backlinks
      refdomain,
      undefined,
      count,
      0,
      {
        userId: session.user.id,
      },
    );

    const data = backlinkData.map((item) => ({
      URL: item.SourceURL,
      Anchor: item.AnchorText,
      Flags: item.Flags,
      TF: item.SourceTrustFlow,
      CF: item.SourceCitationFlow,
      LastSeen: item.LastSeenDate,
      Theme: [
        item.SourceTopicalTrustFlow_Topic_0,
        item.SourceTopicalTrustFlow_Value_0,
      ],
    }));

    return NextResponse.json({ data });
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
