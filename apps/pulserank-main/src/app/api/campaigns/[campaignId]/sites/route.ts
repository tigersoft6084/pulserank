import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@repo/db";
import {
  handleAPIError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
} from "@/lib/utils/error-handler";

export async function GET(
  req: NextRequest,
  { params }: { params: { campaignId: string } }
) {
  try {
    const session = await getUser();
    if (!session?.user) {
      throw new AuthenticationError();
    }
    const { campaignId } = await params;
    // Verify campaign exists and belongs to user
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        user_id: session.user.id,
      },
    });

    if (!campaign) {
      throw new NotFoundError("Campaign not found");
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {
      campaign_id: campaignId,
      ...(search && {
        url: {
          contains: search,
          mode: "insensitive" as const,
        },
      }),
      ...(type && {
        type: type as "domain" | "subdomain" | "page",
      }),
    };

    // Get sites
    const [sites, total] = await Promise.all([
      prisma.siteForCampaign.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.siteForCampaign.count({ where }),
    ]);

    return NextResponse.json({
      sites,
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

export async function POST(
  req: NextRequest,
  { params }: { params: { campaignId: string } }
) {
  try {
    const session = await getUser();
    if (!session?.user) {
      throw new AuthenticationError();
    }
    const { campaignId } = await params;

    // Verify campaign exists and belongs to user
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        user_id: session.user.id,
      },
    });

    if (!campaign) {
      throw new NotFoundError("Campaign not found");
    }

    const { sites } = await req.json();

    if (!sites || !Array.isArray(sites) || sites.length === 0) {
      throw new ValidationError("Sites array is required");
    }

    // Validate and process sites
    const validSiteTypes = ["domain", "subdomain", "page"];
    const processedSites = sites
      .map((site: { url: string; type: string; tags: string[] }) => {
        if (!site.url || typeof site.url !== "string") {
          return null;
        }

        const url = site.url.trim().toLowerCase();
        if (url.length === 0) {
          return null;
        }

        // Validate type
        const type =
          site.type && validSiteTypes.includes(site.type)
            ? site.type
            : "domain";

        return {
          url: url,
          type: type as "domain" | "subdomain" | "page",
          tags: site.tags,
        };
      })
      .filter(Boolean);

    if (processedSites.length === 0) {
      throw new ValidationError("No valid sites provided");
    }

    // Check for existing sites in this campaign
    const existingSites = await prisma.siteForCampaign.findMany({
      where: {
        campaign_id: campaignId,
        url: {
          in: processedSites.map((s) => s?.url).filter(Boolean) as string[],
        },
      },
      select: {
        url: true,
      },
    });

    const existingUrlSet = new Set(
      existingSites.map((s: { url: string }) => s.url)
    );
    const newSites = processedSites.filter(
      (s) => s && !existingUrlSet.has(s.url)
    ) as { url: string; type: string; tags: string[] }[];

    if (newSites.length === 0) {
      throw new ValidationError("All sites already exist in this campaign");
    }

    // Create sites
    const createdSites = await Promise.all(
      newSites.map((site) =>
        prisma.siteForCampaign.create({
          data: {
            url: site.url,
            type: site.type as "domain" | "subdomain" | "page",
            campaign_id: campaignId,
            tags: site.tags,
          },
        })
      )
    );

    return NextResponse.json({
      created: createdSites,
      skipped: processedSites.length - newSites.length,
      total: createdSites.length,
    });
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
