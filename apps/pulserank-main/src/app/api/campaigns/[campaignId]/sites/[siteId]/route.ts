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
  { params }: { params: { campaignId: string; siteId: string } }
) {
  try {
    const session = await getUser();
    if (!session?.user) {
      throw new AuthenticationError();
    }
    const { campaignId, siteId } = await params;
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

    const site = await prisma.siteForCampaign.findFirst({
      where: {
        id: siteId,
        campaign_id: campaignId,
      },
    });

    if (!site) {
      throw new NotFoundError("Site not found");
    }

    return NextResponse.json(site);
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { campaignId: string; siteId: string } }
) {
  try {
    const session = await getUser();
    if (!session?.user) {
      throw new AuthenticationError();
    }
    const { campaignId, siteId } = await params;
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

    const { type } = await req.json();

    // Verify site exists in this campaign
    const existingSite = await prisma.siteForCampaign.findFirst({
      where: {
        id: siteId,
        campaign_id: campaignId,
      },
    });

    if (!existingSite) {
      throw new NotFoundError("Site not found");
    }

    // Validate type
    const validSiteTypes = ["page", "subdomain", "domain"];
    if (type && !validSiteTypes.includes(type)) {
      throw new ValidationError("Invalid site type");
    }

    const updatedSite = await prisma.siteForCampaign.update({
      where: {
        id: siteId,
      },
      data: {
        type: type || existingSite.type,
      },
    });

    return NextResponse.json(updatedSite);
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { campaignId: string; siteId: string } }
) {
  try {
    const session = await getUser();
    if (!session?.user) {
      throw new AuthenticationError();
    }
    const { campaignId, siteId } = await params;
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

    // Verify site exists in this campaign
    const site = await prisma.siteForCampaign.findFirst({
      where: {
        id: siteId,
        campaign_id: campaignId,
      },
    });

    if (!site) {
      throw new NotFoundError("Site not found");
    }

    // Delete site
    await prisma.siteForCampaign.delete({
      where: {
        id: siteId,
      },
    });

    return NextResponse.json({ message: "Site deleted successfully" });
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
