import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { CachedMajesticClient } from "@/lib/api/cached-majestic";
import { CacheService } from "@/lib/services/cache.service";
import {
  handleAPIError,
  ValidationError,
  AuthenticationError,
} from "@/lib/utils/error-handler";
import { prisma } from "@repo/db";
import { DomainTopBacklink } from "@/types/backlinks";

const cacheService = CacheService.getInstance();
const majestic = new CachedMajesticClient(cacheService);

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

    // Get query parameters
    const { searchParams } = new URL(req.url);

    const from = parseInt(searchParams.get("from") || "0", 10);
    const count = parseInt(searchParams.get("count") || "100", 10);

    // Get top backlinks for the domain with pagination
    // Mode = 1 to exclude deleted backlinks
    const backlinkData = await majestic.getBacklinkData(
      domain,
      "fresh",
      1, // Mode parameter to exclude deleted backlinks
      undefined, // refDomain
      1, // maxSourceURLsPerRefDomain
      count,
      from,
      {
        userId: session.user.id,
      }
    );

    // Process each backlink to add keywords count (without Google indexing for now)
    const processedBacklinks = await Promise.all(
      backlinkData.map(async (backlink) => {
        // Get keywords count for this URL
        const keywordsCount = await getKeywordsCountForUrl(
          backlink.SourceURL,
          session.user.id
        );

        return {
          SourceURL: backlink.SourceURL,
          AnchorText: backlink.AnchorText,
          Flags: backlink.Flags,
          LastSeenDate: backlink.LastSeenDate,
          SourceTopicalTrustFlow_Topic_0:
            backlink.SourceTopicalTrustFlow_Topic_0,
          SourceTopicalTrustFlow_Value_0:
            backlink.SourceTopicalTrustFlow_Value_0,
          keywordsCount,
          // Google indexing will be loaded lazily
          googleIndexed: null,
          lastIndexationCheck: null,
          indexedURL: null,
        } as DomainTopBacklink;
      })
    );

    // Sort by TTF value (descending)
    const sortedBacklinks = processedBacklinks.sort(
      (a: DomainTopBacklink, b: DomainTopBacklink) =>
        b.SourceTopicalTrustFlow_Value_0 - a.SourceTopicalTrustFlow_Value_0
    );

    // For pagination, we need to return total count
    // Since Majestic API doesn't provide total count, we'll use a fixed value
    const totalCount = 1000; // Fixed total as requested

    return NextResponse.json({
      data: sortedBacklinks,
      totalCount,
    });
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}

/**
 * Get the count of keywords that rank this URL in SERP results
 */
async function getKeywordsCountForUrl(
  url: string,
  userId: string
): Promise<number> {
  try {
    // Get all keywords from campaigns that belong to this user
    const keywords = await prisma.keyword.findMany({
      where: {
        campaign: {
          user_id: userId,
        },
      },
      include: {
        history: {
          orderBy: {
            date: "desc",
          },
          take: 1,
          include: {
            serp_data: {
              where: {
                url: {
                  contains: url,
                },
              },
            },
          },
        },
      },
    });

    // Count keywords where this URL appears in SERP results
    let count = 0;
    for (const keyword of keywords) {
      if (
        keyword.history.length > 0 &&
        keyword.history[0].serp_data.length > 0
      ) {
        count++;
      }
    }

    return count;
  } catch (error) {
    console.error("Error getting keywords count for URL:", error);
    return 0;
  }
}
