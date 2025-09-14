import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import {
  handleAPIError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
} from "@/lib/utils/error-handler";
import { getUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { campaignId: string } }
) {
  try {
    const session = await getUser();
    if (!session) {
      throw new AuthenticationError();
    }

    const { campaignId } = await params;

    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        user_id: session.user.id,
      },
      include: {
        keywords: {
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
        },
        sites: {
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            url: true,
            type: true,
            tags: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        alerts: {
          orderBy: {
            createdAt: "desc",
          },
          select: {
            id: true,
            email: true,
            frequency: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!campaign) {
      throw new NotFoundError("Campaign not found");
    }

    return NextResponse.json(campaign);
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { campaignId: string } }
) {
  try {
    const session = await getUser();
    if (!session) {
      throw new AuthenticationError();
    }
    const { campaignId } = await params;
    const { name } = await req.json();
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      throw new ValidationError("Campaign name is required");
    }

    // Check if campaign exists and belongs to user
    const existingCampaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        user_id: session.user.id,
      },
    });

    if (!existingCampaign) {
      throw new NotFoundError("Campaign not found");
    }

    // Check if new name already exists for this user
    const duplicateCampaign = await prisma.campaign.findFirst({
      where: {
        user_id: session.user.id,
        name: name.trim(),
        id: {
          not: campaignId,
        },
      },
    });

    if (duplicateCampaign) {
      throw new ValidationError("Campaign name already exists");
    }

    const campaign = await prisma.campaign.update({
      where: {
        id: campaignId,
      },
      data: {
        name: name.trim(),
      },
      include: {
        keywords: {
          select: {
            id: true,
          },
        },
        sites: {
          select: {
            id: true,
          },
        },
      },
    });

    return NextResponse.json({
      id: campaign.id,
      name: campaign.name,
      keywords: campaign.keywords.length,
      sites: campaign.sites.length,
      createdAt: campaign.createdAt,
      updatedAt: campaign.updatedAt,
    });
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { campaignId: string } }
) {
  try {
    const session = await getUser();
    if (!session) {
      throw new AuthenticationError();
    }
    const { campaignId } = await params;
    // Check if campaign exists and belongs to user
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        user_id: session.user.id,
      },
    });

    if (!campaign) {
      throw new NotFoundError("Campaign not found");
    }

    // Delete campaign (keywords and sites will be deleted via cascade)
    await prisma.campaign.delete({
      where: {
        id: campaignId,
      },
    });

    return NextResponse.json({ message: "Campaign deleted successfully" });
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
