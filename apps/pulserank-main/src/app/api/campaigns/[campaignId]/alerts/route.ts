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

    const alerts = await prisma.alert.findMany({
      where: {
        campaign_id: campaignId,
      },
      select: {
        id: true,
        email: true,
        frequency: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      alerts,
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

    const { email, frequency } = await req.json();

    if (!email || typeof email !== "string") {
      throw new ValidationError("Email is required");
    }

    if (!frequency || typeof frequency !== "number") {
      throw new ValidationError("Frequency is required");
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError("Invalid email format");
    }

    const alert = await prisma.alert.create({
      data: {
        email: email,
        frequency: frequency,
        campaign_id: campaignId,
      },
    });

    return NextResponse.json({
      message: "Email alert added successfully",
      alert,
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

    const { alertId } = await req.json();

    const alert = await prisma.alert.delete({
      where: {
        id: alertId,
      },
    });

    return NextResponse.json({
      message: "Email alert removed successfully",
      alert,
    });
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
