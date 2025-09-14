import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@repo/db";
import {
  handleAPIError,
  AuthenticationError,
  ValidationError,
  NotFoundError,
} from "@/lib/utils/error-handler";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      throw new AuthenticationError();
    }

    if (
      session.user.credits.unlockedDomainsCount?.used &&
      session.user.credits.unlockedDomainsCount?.used >=
        session.user.credits.unlockedDomainsCount?.limit
    ) {
      throw new ValidationError(
        "You have reached the limit of unlocked domains"
      );
    }
    const { domain } = await request.json();

    if (!domain) {
      throw new ValidationError("Domain is required");
    }

    // Get current user to check if domain is already unlocked
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { unlockedDomains: true },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Check if domain is already unlocked
    if (user.unlockedDomains.includes(domain)) {
      return NextResponse.json(
        {
          success: true,
          message: "Domain already unlocked",
          unlockedDomains: user.unlockedDomains,
        },
        { status: 200 }
      );
    }

    // Add domain to unlockedDomains array
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        unlockedDomains: {
          push: domain,
        },
      },
      select: { unlockedDomains: true },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Domain unlocked successfully",
        unlockedDomains: updatedUser.unlockedDomains,
      },
      { status: 200 }
    );
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      throw new AuthenticationError();
    }

    const { searchParams } = new URL(request.url);
    const domain = searchParams.get("domain");

    if (!domain) {
      throw new ValidationError("Domain parameter is required");
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { unlockedDomains: true },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    const isUnlocked = user.unlockedDomains.includes(domain);

    return NextResponse.json(
      {
        success: true,
        isUnlocked,
        unlockedDomains: user.unlockedDomains,
      },
      { status: 200 }
    );
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
