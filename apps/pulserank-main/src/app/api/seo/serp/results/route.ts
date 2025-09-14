import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { CachedDataForSEOClient } from "@/lib/api/cached-dataforseo";
import { CacheService } from "@/lib/services/cache.service";
import {
  handleAPIError,
  ValidationError,
  AuthenticationError,
} from "@/lib/utils/error-handler";
import { SERPResult } from "@/types/serp";
import { BASE_DATA } from "@/lib/config";
import { prisma } from "@repo/db";
import type { SERPData } from "@repo/db";

const cacheService = new CacheService();
const dataForSEO = new CachedDataForSEOClient(cacheService);

export async function POST(req: NextRequest) {
  try {
    const session = await getUser();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    const { keyword, base = "com_en", date } = await req.json();
    if (!keyword) {
      throw new ValidationError("Keyword is required");
    }

    // Get location and language codes from the selected base
    const baseConfig = BASE_DATA[base as keyof typeof BASE_DATA];
    if (!baseConfig) {
      throw new ValidationError("Invalid base selected");
    }

    // If date is provided, get historical data from database
    if (date) {
      // Find the keyword in the database
      const keywordRecord = await prisma.keyword.findFirst({
        where: {
          keyword: keyword,
          base: base,
          campaign: {
            user_id: session.user.id,
          },
        },
      });

      if (!keywordRecord) {
        throw new ValidationError("Keyword not found in database");
      }

      // Get SERP data for the specific date
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate);
      startOfDay.setUTCHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setUTCHours(23, 59, 59, 999);

      const historicalData = await prisma.sERPMachineHistory.findMany({
        where: {
          keyword_id: keywordRecord.id,
          date: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
        include: {
          serp_data: {
            orderBy: {
              rank: "asc",
            },
          },
        },
        orderBy: {
          date: "desc",
        },
        take: 1, // Get the most recent data for that day
      });

      if (historicalData.length === 0) {
        throw new ValidationError(
          "No historical data found for the specified date"
        );
      }

      const historicalSERP = historicalData[0];

      // Filter out items with invalid URLs
      const validHistoricalResults = historicalSERP.serp_data.filter(
        (item: SERPData) => {
          if (!item.url) return false;

          try {
            // Check if URL is valid
            const url = new URL(
              item.url.startsWith("http") ? item.url : `https://${item.url}`
            );
            return url.hostname && url.hostname.length > 0;
          } catch {
            return false;
          }
        }
      );

      // Transform to SERPResult format (top 100 results)
      const serpResults: SERPResult[] = validHistoricalResults
        .slice(0, 100)
        .map((item: SERPData) => ({
          rank: item.rank,
          url: item.url,
          title: item.title,
          domain: item.url.replace(/^https?:\/\//, "").replace(/\/.*$/, ""),
        }));

      return NextResponse.json(serpResults);
    }

    // If no date provided, get current SERP data from DataForSEO
    const serpResponse = await dataForSEO.getSERPData(
      keyword,
      baseConfig.location_code,
      baseConfig.language_code,
      {
        userId: session.user.id,
      }
    );

    if (!serpResponse.tasks?.[0]?.result?.[0]?.items) {
      return NextResponse.json([]);
    }

    const serpItems = serpResponse.tasks[0].result[0].items;

    // Filter out items with invalid URLs
    const validResults = serpItems.filter((item) => {
      if (!item.url) return false;

      try {
        // Check if URL is valid
        const url = new URL(
          item.url.startsWith("http") ? item.url : `https://${item.url}`
        );
        return url.hostname && url.hostname.length > 0;
      } catch {
        return false;
      }
    });

    // Transform to SERPResult format (top 100 results)
    const serpResults: SERPResult[] = validResults
      .slice(0, 100)
      .map((item) => ({
        rank: item.rank_absolute,
        url: item.url,
        title: item.title,
        domain: item.domain,
      }));

    return NextResponse.json(serpResults);
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
