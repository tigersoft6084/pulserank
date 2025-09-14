import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@repo/db";
import {
  handleAPIError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
} from "@/lib/utils/error-handler";
import { BASE_DATA } from "@/lib/config";
import { SERPBase } from "@repo/db";

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

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {
      campaign_id: campaignId,
      ...(search && {
        keyword: {
          contains: search,
          mode: "insensitive" as const,
        },
      }),
    };

    // Get keywords with latest history
    const [keywords, total] = await Promise.all([
      prisma.keyword.findMany({
        where,
        include: {
          history: {
            orderBy: {
              date: "desc",
            },
            take: 1,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.keyword.count({ where }),
    ]);

    return NextResponse.json({
      keywords,
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
    if (
      session.user.credits.keywordsCount?.used &&
      session.user.credits.keywordsCount?.used >=
        session.user.credits.keywordsCount?.limit
    ) {
      throw new ValidationError("You have reached the limit of keywords");
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

    const { keywords, base, tags, frequency } = await req.json();

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      throw new ValidationError("Keywords array is required");
    }

    if (!base || !Object.keys(BASE_DATA).includes(base)) {
      throw new ValidationError("Valid base is required");
    }

    if (frequency && (typeof frequency !== "number" || frequency < 1)) {
      throw new ValidationError("Frequency must be a positive number");
    }

    // Process keywords (trim, lowercase, remove duplicates)
    const processedKeywords = [
      ...new Set(
        keywords
          .map((k: string) => k.trim().toLowerCase())
          .filter((k: string) => k.length > 0)
      ),
    ];

    if (processedKeywords.length === 0) {
      throw new ValidationError("No valid keywords provided");
    }

    // Check for existing keywords in this campaign
    const existingKeywords = await prisma.keyword.findMany({
      where: {
        campaign_id: campaignId,
        keyword: {
          in: processedKeywords,
        },
      },
      select: {
        keyword: true,
      },
    });

    const existingKeywordSet = new Set(
      existingKeywords.map((k: { keyword: string }) => k.keyword)
    );
    const newKeywords = processedKeywords.filter(
      (k: string) => !existingKeywordSet.has(k)
    );

    if (newKeywords.length === 0) {
      throw new ValidationError("All keywords already exist in this campaign");
    }

    // Create keywords
    const createdKeywords = await Promise.all(
      newKeywords.map((keyword) =>
        prisma.keyword.create({
          data: {
            keyword,
            base: base as SERPBase,
            tags: tags || [],
            frequency: frequency || 1,
            campaign_id: campaignId,
            user_id: session.user.id,
          },
          include: {
            history: {
              orderBy: {
                date: "desc",
              },
              take: 1,
            },
          },
        })
      )
    );

    return NextResponse.json({
      created: createdKeywords,
      skipped: processedKeywords.length - newKeywords.length,
      total: createdKeywords.length,
    });
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    console.log("error body", body);
    return NextResponse.json(body, { status: statusCode });
  }
}
