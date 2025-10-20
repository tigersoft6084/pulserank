import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { CachedMajesticClient } from "@/lib/api/cached-majestic";
import { CacheService } from "@/lib/services/cache.service";
import {
  handleAPIError,
  ValidationError,
  AuthenticationError,
} from "@/lib/utils/error-handler";
import { LatestBacklink } from "@/types/backlinks";

const cacheService = CacheService.getInstance();
const majestic = new CachedMajesticClient(cacheService);

export async function POST(req: NextRequest) {
  try {
    const session = await getUser();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    const { urls } = await req.json();

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      throw new ValidationError("URLs array is required");
    }

    // Fetch backlink data for all URLs
    const allBacklinkData: LatestBacklink[] = [];

    for (const url of urls) {
      try {
        const backlinkData = await majestic.getBacklinkData(
          url,
          "fresh",
          1, // Mode = 1 to exclude deleted backlinks
          undefined,
          1,
          50,
          0,
          {
            userId: session.user.id,
          },
        );

        const urlData = backlinkData.map((item) => {
          return {
            SourceURL: item.SourceURL,
            Anchor: item.AnchorText,
            TargetURL: item.TargetURL,
            Flags: item.Flags,
            TF: item.SourceTrustFlow,
            CF: item.SourceCitationFlow,
            Theme: [
              item.SourceTopicalTrustFlow_Topic_0,
              item.SourceTopicalTrustFlow_Value_0,
            ] as [string, number],
            Discovered: item.FirstIndexedDate,
          };
        });

        allBacklinkData.push(...urlData);
      } catch (error) {
        console.error(`Error fetching backlinks for ${url}:`, error);
        // Continue with other URLs even if one fails
      }
    }

    // Sort all data by Discovered date (descending - newest first)
    const sortedData = allBacklinkData.sort((a, b) => {
      const dateA = new Date(a.Discovered).getTime();
      const dateB = new Date(b.Discovered).getTime();
      return dateB - dateA;
    });

    // Return top 300 results
    const top300Data = sortedData.slice(0, 300);

    return NextResponse.json(top300Data);
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
