import { NextResponse } from "next/server";
import { CacheService } from "@/lib/services/cache.service";
import {
  handleAPIError,
  AuthenticationError,
  ValidationError,
} from "@/lib/utils/error-handler";
import { getUser } from "@/lib/auth";

const cacheService = CacheService.getInstance();

export async function GET(request: Request) {
  try {
    const session = await getUser();
    if (!session) {
      throw new AuthenticationError();
    }

    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get("endpoint");
    const date = searchParams.get("date");

    const stats = await cacheService.getCacheStats(
      endpoint || undefined,
      date ? new Date(date) : undefined
    );

    return NextResponse.json(stats);
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getUser();
    if (!session) {
      throw new AuthenticationError();
    }

    const { action, pattern, config } = await request.json();

    switch (action) {
      case "invalidate":
        if (!pattern) {
          throw new ValidationError("Pattern is required for invalidation");
        }
        await cacheService.invalidateCache(pattern);
        return NextResponse.json({ message: "Cache invalidated successfully" });

      case "cleanup":
        await cacheService.cleanupExpiredCache();
        return NextResponse.json({
          message: "Expired cache cleaned up successfully",
        });

      case "updateConfig":
        if (!config?.endpoint) {
          throw new ValidationError("Endpoint is required for config update");
        }
        await cacheService.updateCacheConfig(config);
        return NextResponse.json({
          message: "Cache config updated successfully",
        });

      default:
        throw new ValidationError("Invalid action");
    }
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getUser();
    if (!session) {
      throw new AuthenticationError();
    }

    const { searchParams } = new URL(request.url);
    const pattern = searchParams.get("pattern");

    if (!pattern) {
      throw new ValidationError("Pattern is required for deletion");
    }

    await cacheService.invalidateCache(pattern);
    return NextResponse.json({ message: "Cache entries deleted successfully" });
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
