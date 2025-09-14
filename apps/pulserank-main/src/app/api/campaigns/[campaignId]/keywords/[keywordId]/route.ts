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
  { params }: { params: { campaignId: string; keywordId: string } }
) {
  try {
    const session = await getUser();
    if (!session?.user) {
      throw new AuthenticationError();
    }
    const { campaignId, keywordId } = await params;
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

    const keyword = await prisma.keyword.findFirst({
      where: {
        id: keywordId,
        campaign_id: campaignId,
      },
      include: {
        history: {
          orderBy: {
            date: "desc",
          },
        },
      },
    });

    if (!keyword) {
      throw new NotFoundError("Keyword not found");
    }

    return NextResponse.json(keyword);
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { campaignId: string; keywordId: string } }
) {
  try {
    const session = await getUser();
    if (!session?.user) {
      throw new AuthenticationError();
    }
    const { campaignId, keywordId } = await params;
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

    const { tags, frequency } = await req.json();

    // Verify keyword exists in this campaign
    const existingKeyword = await prisma.keyword.findFirst({
      where: {
        id: keywordId,
        campaign_id: campaignId,
      },
    });

    if (!existingKeyword) {
      throw new NotFoundError("Keyword not found");
    }

    // Validate frequency
    if (frequency && (typeof frequency !== "number" || frequency < 1)) {
      throw new ValidationError("Frequency must be a positive number");
    }

    const updatedKeyword = await prisma.keyword.update({
      where: {
        id: keywordId,
      },
      data: {
        tags: tags || existingKeyword.tags,
        frequency: frequency || existingKeyword.frequency,
      },
      include: {
        history: {
          orderBy: {
            date: "desc",
          },
          take: 1,
        },
      },
    });

    return NextResponse.json(updatedKeyword);
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { campaignId: string; keywordId: string } }
) {
  try {
    const session = await getUser();
    if (!session?.user) {
      throw new AuthenticationError();
    }
    const { campaignId, keywordId } = await params;
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

    // Verify keyword exists in this campaign
    const keyword = await prisma.keyword.findFirst({
      where: {
        id: keywordId,
        campaign_id: campaignId,
      },
    });

    if (!keyword) {
      throw new NotFoundError("Keyword not found");
    }

    // Delete keyword (history will be deleted via cascade)
    await prisma.keyword.delete({
      where: {
        id: keywordId,
      },
    });

    return NextResponse.json({ message: "Keyword deleted successfully" });
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
