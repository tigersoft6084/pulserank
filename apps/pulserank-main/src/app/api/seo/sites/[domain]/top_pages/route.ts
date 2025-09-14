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

const cacheService = new CacheService();
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

    // Get top pages for the domain with pagination
    const topPagesData = await majestic.getTopPages(
      domain,
      "fresh",
      from,
      count,
      {
        userId: session.user.id,
      }
    );

    // Process each top page to add keywords count
    const processedTopPages = await Promise.all(
      topPagesData.map(async (topPage) => {
        // Get keywords count for this URL
        const keywordsCount = await getKeywordsCountForUrl(
          topPage.URL,
          session.user.id
        );

        return {
          URL: topPage.URL,
          TrustFlow: topPage.TrustFlow,
          CitationFlow: topPage.CitationFlow,
          RefDomains: topPage.RefDomains,
          RefIPs: topPage.RefIPs,
          TopicalTrustFlow_Topic_0: topPage.TopicalTrustFlow_Topic_0,
          Keywords: keywordsCount,
          LastCrawlResult: topPage.LastCrawlResult,
          LastCrawlDate: topPage.Date,
        };
      })
    );

    // Sort by TrustFlow (descending)
    const sortedTopPages = processedTopPages.sort(
      (a, b) => b.TrustFlow - a.TrustFlow
    );

    // For pagination, we need to return total count
    // Since Majestic API doesn't provide total count, we'll use a fixed value
    const totalCount = 1000; // Fixed total as requested

    return NextResponse.json({
      data: sortedTopPages,
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
