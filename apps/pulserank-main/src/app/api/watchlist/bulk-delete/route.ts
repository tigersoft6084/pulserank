import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@repo/db";
import {
  handleAPIError,
  ValidationError,
  AuthenticationError,
} from "@/lib/utils/error-handler";

export async function POST(req: NextRequest) {
  try {
    const session = await getUser();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    const { trackingSiteIds } = await req.json();

    if (
      !trackingSiteIds ||
      !Array.isArray(trackingSiteIds) ||
      trackingSiteIds.length === 0
    ) {
      throw new ValidationError("Tracking site IDs array is required");
    }

    // Verify all tracking sites exist and belong to user
    const existingTrackingSites = await prisma.trackingSite.findMany({
      where: {
        id: {
          in: trackingSiteIds,
        },
        user_id: session.user.id,
      },
      select: {
        id: true,
      },
    });

    if (existingTrackingSites.length !== trackingSiteIds.length) {
      throw new ValidationError(
        "Some tracking sites not found or don't belong to you"
      );
    }

    // Delete tracking sites (backlink histories will be deleted via cascade)
    await prisma.trackingSite.deleteMany({
      where: {
        id: {
          in: trackingSiteIds,
        },
        user_id: session.user.id,
      },
    });

    return NextResponse.json({
      message: `${existingTrackingSites.length} tracking site(s) deleted successfully`,
    });
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
