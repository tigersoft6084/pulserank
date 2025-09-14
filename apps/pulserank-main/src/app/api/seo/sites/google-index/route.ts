import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { CachedDataForSEOClient } from "@/lib/api/cached-dataforseo";
import { CacheService } from "@/lib/services/cache.service";
import {
  handleAPIError,
  ValidationError,
  AuthenticationError,
} from "@/lib/utils/error-handler";
import { BASE_DATA } from "@/lib/config";
import { prisma } from "@repo/db";
import { SERPItem } from "@/types/api/dataforseo";

const cacheService = new CacheService();
const dataForSEO = new CachedDataForSEOClient(cacheService);

export async function POST(req: NextRequest) {
  try {
    const session = await getUser();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    const { url, base = "com_en" } = await req.json();
    if (!url) {
      throw new ValidationError("URL is required");
    }

    // Get location and language codes from the selected base
    const baseConfig = BASE_DATA[base as keyof typeof BASE_DATA];
    if (!baseConfig) {
      throw new ValidationError("Invalid base selected");
    }

    const googleIndexInfo = await getGoogleIndexInfo(
      url,
      session.user.id,
      baseConfig
    );

    return NextResponse.json(googleIndexInfo);
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}

/**
 * Get Google indexing information for a URL
 */
async function getGoogleIndexInfo(
  url: string,
  userId: string,
  baseConfig: { location_code: number; language_code: string }
): Promise<{
  googleIndexed: boolean;
  lastIndexationCheck: string;
  indexedURL: string | null;
}> {
  try {
    // First, check if we have cached data in SiteIndexInfo
    const existingInfo = await prisma.siteIndexInfo.findUnique({
      where: { url },
    });

    // If we have recent data (less than 24 hours old), return it
    if (existingInfo) {
      const hoursSinceLastCheck =
        (Date.now() - existingInfo.updatedAt.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastCheck < 24) {
        return {
          googleIndexed: existingInfo.google_indexed,
          lastIndexationCheck: existingInfo.updatedAt.toISOString(),
          indexedURL: existingInfo.indexed_url,
        };
      }
    }

    // If no recent data, check with DataForSEO using "site:" query
    const siteQuery = `site:${url}`;
    const serpResponse = await dataForSEO.getSERPData(
      siteQuery,
      baseConfig.location_code,
      baseConfig.language_code,
      { userId }
    );

    let googleIndexed = false;
    let indexedURL: string | null = null;

    if (serpResponse.tasks?.[0]?.result?.[0]?.items) {
      const serpItems = serpResponse.tasks[0].result[0].items;

      // Check if the URL appears in the SERP results
      const matchingItem = serpItems.find(
        (item: SERPItem) => item.url && item.url.includes(url)
      );

      if (matchingItem) {
        googleIndexed = true;
        indexedURL = matchingItem.url;
      }
    }

    // Store the result in the database
    await prisma.siteIndexInfo.upsert({
      where: { url },
      update: {
        google_indexed: googleIndexed,
        indexed_url: indexedURL,
        updatedAt: new Date(),
      },
      create: {
        url,
        google_indexed: googleIndexed,
        indexed_url: indexedURL,
      },
    });

    return {
      googleIndexed,
      lastIndexationCheck: new Date().toISOString(),
      indexedURL,
    };
  } catch (error) {
    console.error("Error getting Google index info for URL:", error);
    return {
      googleIndexed: false,
      lastIndexationCheck: new Date().toISOString(),
      indexedURL: null,
    };
  }
}
