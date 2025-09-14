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

    const backlinkData = await majestic.getBacklinkData(
      url,
      "fresh",
      0,
      undefined,
      1,
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
        DiscoverDate: item.FirstIndexedDate,
        Flags: item.Flags,
        LastSeenDate: item.LastSeenDate,
        SourceTopicalTrustFlow_Topic_0: item.SourceTopicalTrustFlow_Topic_0,
        SourceTopicalTrustFlow_Value_0: item.SourceTopicalTrustFlow_Value_0,
      }))
      .sort(
        (a, b) =>
          (a.SourceTopicalTrustFlow_Value_0 as number) -
          (b.SourceTopicalTrustFlow_Value_0 as number),
      );
    return NextResponse.json({
      data,
    });
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
