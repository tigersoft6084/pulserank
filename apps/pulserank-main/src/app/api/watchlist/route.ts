import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@repo/db";
import {
  handleAPIError,
  ValidationError,
  AuthenticationError,
} from "@/lib/utils/error-handler";

export async function GET(req: NextRequest) {
  try {
    const session = await getUser();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";

    const skip = (page - 1) * limit;

    // Build where clause
    const where = {
      user_id: session.user.id,
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

    // Get tracking sites
    const [trackingSites, total] = await Promise.all([
      prisma.trackingSite.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.trackingSite.count({ where }),
    ]);

    return NextResponse.json({
      trackingSites,
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

export async function POST(req: NextRequest) {
  try {
    const session = await getUser();
    if (!session?.user) {
      throw new AuthenticationError();
    }
    if (
      session.user.credits.trackingSitesCount?.used &&
      session.user.credits.trackingSitesCount?.used >=
        session.user.credits.trackingSitesCount?.limit
    ) {
      throw new ValidationError("You have reached the limit of tracking sites");
    }
    const { url, type, emailAlert = false } = await req.json();

    if (!url || typeof url !== "string" || url.trim().length === 0) {
      throw new ValidationError("URL is required");
    }

    // Validate type
    const validSiteTypes = ["domain", "subdomain", "page"];
    const validatedType =
      type && validSiteTypes.includes(type) ? type : "domain";

    // Clean the URL
    const cleanUrl = url.trim().toLowerCase();

    // Check if tracking site already exists for this user
    const existingTrackingSite = await prisma.trackingSite.findFirst({
      where: {
        user_id: session.user.id,
        url: cleanUrl,
      },
    });

    if (existingTrackingSite) {
      throw new ValidationError("URL is already being tracked");
    }

    // Create tracking site
    const trackingSite = await prisma.trackingSite.create({
      data: {
        url: cleanUrl,
        type: validatedType as "domain" | "subdomain" | "page",
        email_alert: emailAlert,
        user_id: session.user.id,
      },
    });

    return NextResponse.json(trackingSite);
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
