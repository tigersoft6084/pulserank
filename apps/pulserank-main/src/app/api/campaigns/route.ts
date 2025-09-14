import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import {
  handleAPIError,
  ValidationError,
  AuthenticationError,
} from "@/lib/utils/error-handler";
import { getUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getUser();
    if (!session) {
      throw new AuthenticationError();
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    // Build where clause
    const where = {
      user_id: session.user.id,
      ...(search && {
        name: {
          contains: search,
          mode: "insensitive" as const,
        },
      }),
    };

    // Get campaigns with counts
    const campaigns = await prisma.campaign.findMany({
      where,
      include: {
        keywords: {
          select: {
            id: true,
            keyword: true,
            tags: true,
          },
        },
        sites: {
          select: {
            id: true,
            url: true,
            tags: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform data to include counts
    // const campaignsWithCounts = campaigns.map((campaign: Campaign) => ({
    //   id: campaign.id,
    //   name: campaign.name,
    //   keywords: campaign.keywords.length,
    //   sites: campaign.sites.length,
    //   createdAt: campaign.createdAt,
    //   updatedAt: campaign.updatedAt,
    // }));

    return NextResponse.json({
      campaigns,
    });
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getUser();
    if (!session) {
      throw new AuthenticationError();
    }

    const { name } = await req.json();
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      throw new ValidationError("Campaign name is required");
    }

    // Check if campaign name already exists for this user
    const existingCampaign = await prisma.campaign.findFirst({
      where: {
        user_id: session.user.id,
        name: name.trim(),
      },
    });

    if (existingCampaign) {
      throw new ValidationError("Campaign name already exists");
    }

    const campaign = await prisma.campaign.create({
      data: {
        name: name.trim(),
        user_id: session.user.id,
      },
    });

    return NextResponse.json({
      id: campaign.id,
      name: campaign.name,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
    });
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
