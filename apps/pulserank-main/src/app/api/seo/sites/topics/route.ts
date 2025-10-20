import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { CachedMajesticClient } from "@/lib/api/cached-majestic";
import { CacheService } from "@/lib/services/cache.service";
import {
  handleAPIError,
  ValidationError,
  AuthenticationError,
} from "@/lib/utils/error-handler";

const cacheService = CacheService.getInstance();
const majestic = new CachedMajesticClient(cacheService);

export async function POST(req: NextRequest) {
  try {
    const session = await getUser();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    const { url } = await req.json();
    if (!url) {
      throw new ValidationError("URL is required");
    }

    const topicsData = await majestic.getTopics(url, "fresh", 100, {
      userId: session.user.id,
    });
    const data = topicsData.map((item) => ({
      Topic: item.Topic,
      RefDomains: item.RefDomains,
      isGroup: item.isGroup,
    }));

    return NextResponse.json({
      data,
    });
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
