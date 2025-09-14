import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { handleAPIError, AuthenticationError } from "@/lib/utils/error-handler";
import { prisma } from "@repo/db";
import { BacklinkData } from "@repo/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getUser();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    const { page = 1, limit = 50, flagFilters = [] } = await req.json();
    const skip = (page - 1) * limit;

    // Get domains that the current user is tracking
    const userTrackingSites = await prisma.trackingSite.findMany({
      where: { user_id: session.user.id },
      select: { url: true },
    });

    const trackedDomains = userTrackingSites.map(
      (site: { url: string }) => site.url
    );

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
      .filter(Boolean) as Array<{ flags: { path: string[]; equals: boolean } }>;

    // Final where clause
    const whereClause = {
      AND: [
        {
          backlink_history: {
            domain: { in: trackedDomains },
          },
        },
        ...flagConditions,
      ],
    };

    // Fetch backlink data only for tracked domains + flag filters
    const dbBacklinks = await prisma.backlinkData.findMany({
      where: whereClause,
      include: {
        backlink_history: {
          select: { domain: true, date: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    });

    const total = await prisma.backlinkData.count({
      where: whereClause,
    });

    // Transform database data to match expected format
    const processedBacklinks = dbBacklinks.map(
      (
        backlink: BacklinkData & {
          backlink_history: { domain: string; date: Date };
        }
      ) => ({
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
        domain: backlink.backlink_history.domain,
        historyDate: backlink.backlink_history.date,
        type: backlink.type ? "new" : "lost",
      })
    );

    return NextResponse.json({
      data: processedBacklinks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
