import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { CachedMajesticClient } from "@/lib/api/cached-majestic";
import { CacheService } from "@/lib/services/cache.service";
import {
  handleAPIError,
  ValidationError,
  AuthenticationError,
} from "@/lib/utils/error-handler";

const cacheService = new CacheService();
const majestic = new CachedMajesticClient(cacheService);

export async function POST(req: NextRequest) {
  try {
    const session = await getUser();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    const { urls } = await req.json();
    if (!urls || !Array.isArray(urls)) {
      throw new ValidationError("URLs array is required");
    }

    if (urls.length === 0) {
      return NextResponse.json({ data: [] });
    }

    // Fetch bulk index item info from Majestic
    const indexItemInfo = await majestic.getIndexItemInfo(urls, "fresh", {
      userId: session.user.id,
    });

    return NextResponse.json({ data: indexItemInfo });
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
