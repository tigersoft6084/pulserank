import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@repo/db";
import {
  handleAPIError,
  AuthenticationError,
  NotFoundError,
} from "@/lib/utils/error-handler";

export async function PUT(
  req: NextRequest,
  { params }: { params: { trackingSiteId: string } }
) {
  try {
    const session = await getUser();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    const { trackingSiteId } = await params;
    const { emailAlert } = await req.json();

    // Verify tracking site exists and belongs to user
    const existingTrackingSite = await prisma.trackingSite.findFirst({
      where: {
        id: trackingSiteId,
        user_id: session.user.id,
      },
    });

    if (!existingTrackingSite) {
      throw new NotFoundError("Tracking site not found");
    }

    // Update tracking site
    const updatedTrackingSite = await prisma.trackingSite.update({
      where: {
        id: trackingSiteId,
      },
      data: {
        email_alert: emailAlert,
      },
    });

    return NextResponse.json(updatedTrackingSite);
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { trackingSiteId: string } }
) {
  try {
    const session = await getUser();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    const { trackingSiteId } = await params;

    // Verify tracking site exists and belongs to user
    const trackingSite = await prisma.trackingSite.findFirst({
      where: {
        id: trackingSiteId,
        user_id: session.user.id,
      },
    });

    if (!trackingSite) {
      throw new NotFoundError("Tracking site not found");
    }

    // Delete tracking site (backlink histories will be deleted via cascade)
    await prisma.trackingSite.delete({
      where: {
        id: trackingSiteId,
      },
    });

    return NextResponse.json({ message: "Tracking site deleted successfully" });
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
