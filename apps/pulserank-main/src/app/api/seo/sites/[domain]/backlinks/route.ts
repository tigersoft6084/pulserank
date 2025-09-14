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
import { BacklinkData } from "@repo/db";

const cacheService = new CacheService();
const majestic = new CachedMajesticClient(cacheService);

export async function POST(
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

    const {
      type = "new",
      page = 1,
      limit = 50,
      flagFilters = [],
    } = await req.json();
    if (!["new", "lost"].includes(type)) {
      throw new ValidationError("Type must be 'new' or 'lost'");
    }

    const skip = (page - 1) * limit;

    // For lost backlinks, just fetch and return without storing
    if (type === "lost") {
      // Mode 1 for lost backlinks
      const backlinksData = await majestic.getNewLostBacklinks(
        domain,
        "fresh",
        1, // Mode 1 for lost backlinks
        {
          userId: session.user.id,
        }
      );

      // Process lost backlinks
      const processedBacklinks = (backlinksData || []).map((item) => {
        // Calculate percentage (TF/CF)
        const percentage =
          item.SourceTrustFlow > 0 && item.SourceCitationFlow > 0
            ? Math.round((item.SourceTrustFlow / item.SourceCitationFlow) * 100)
            : 0;

        return {
          url: item.SourceURL,
          cms: "Unknown",
          anchor: item.AnchorText,
          Flags: {
            doFollow: Boolean(!item.FlagNoFollow),
            redirect: Boolean(item.FlagRedirect),
            frame: Boolean(item.FlagFrame),
            noFollow: Boolean(item.FlagNoFollow),
            images: Boolean(item.FlagImages),
            deleted: Boolean(item.FlagDeleted),
            altText: Boolean(item.FlagAltText),
            mention: Boolean(item.FlagMention),
          },
          targetUrl: item.TargetURL,
          ip: "N/A",
          tf: item.SourceTrustFlow || 0,
          cf: item.SourceCitationFlow || 0,
          percentage,
          foundDate: item.Date || "N/A",
          seen: item.LastSeenDate || "N/A",
          backlinkLeft: 10,
          lastCrawl: item.ReasonLost || "N/A",
        };
      });

      // Apply pagination to the results
      const paginatedBacklinks = processedBacklinks.slice(skip, skip + limit);
      const total = processedBacklinks.length;

      return NextResponse.json({
        data: paginatedBacklinks,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    }

    // For new backlinks: only return data from database, no API calls
    if (type === "new") {
      // Define flag keys by index order
      const flagKeys = [
        "doFollow",
        "redirect",
        "frame",
        "noFollow",
        "images",
        "deleted",
        "altText",
        "mention",
      ];

      // Build flag filter conditions
      const flagConditions = flagFilters
        .map((flagIndex: number) => {
          const flagKey = flagKeys[flagIndex];
          if (!flagKey) return null;
          return {
            flags: {
              path: [flagKey], // ✅ Correct syntax for Prisma JSON filtering
              equals: true,
            },
          };
        })
        .filter(Boolean) as Array<{
        flags: { path: string[]; equals: boolean };
      }>;

      // Final where clause
      const whereClause = {
        AND: [
          {
            type: true, // true for new backlinks
            backlink_history: {
              domain: domain,
            },
          },
          ...flagConditions,
        ],
      };

      // Query database for stored backlinks
      const dbBacklinks = await prisma.backlinkData.findMany({
        where: whereClause,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      });

      const total = await prisma.backlinkData.count({
        where: whereClause,
      });

      // Transform database data to match the expected format
      const processedBacklinks = dbBacklinks.map((backlink: BacklinkData) => ({
        url: backlink.source_url,
        cms: backlink.cms,
        anchor: backlink.anchor,
        Flags: backlink.flags,
        targetUrl: backlink.target_url,
        ip: backlink.ip,
        tf: backlink.trust_flow,
        cf: backlink.citation_flow,
        percentage:
          backlink.trust_flow > 0 && backlink.citation_flow > 0
            ? Math.round((backlink.trust_flow / backlink.citation_flow) * 100)
            : 0,
        foundDate: backlink.found_date,
        seen: backlink.seen,
        lastCrawl: backlink.last_crawl,
      }));

      return NextResponse.json({
        data: processedBacklinks,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    }

    return NextResponse.json({
      data: [],
      pagination: {
        page: 1,
        limit: 50,
        total: 0,
        pages: 0,
      },
    });
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
