import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@repo/db";
import {
  handleAPIError,
  ValidationError,
  AuthenticationError,
} from "@/lib/utils/error-handler";

interface KeywordData {
  id: string;
  keyword: string;
  base: string;
  position: number | null;
  positionDate: Date | null;
  traffic: number;
  searchVolume: number;
  cpc: number;
  competition: number;
  interest: number;
  properties: string[];
  rankingUrl: string | null;
}

interface KeywordWithHistory {
  id: string;
  keyword: string;
  base: string;
  search_volume: number;
  cpc: number;
  competition: number;
  interest: number;
  properties: string[] | null;
  history: {
    date: Date;
    serp_data: {
      rank: number | null;
      url: string;
    }[];
  }[];
}

export async function GET(req: NextRequest) {
  try {
    const session = await getUser();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");
    if (!url) {
      throw new ValidationError("URL parameter is required");
    }

    const from = parseInt(searchParams.get("from") || "0", 10);
    const count = parseInt(searchParams.get("count") || "100", 10);

    // Get current month start and end dates
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    // Get keywords that rank this URL in the current month
    const keywords = await prisma.keyword.findMany({
      where: {
        campaign: {
          user_id: session.user.id,
        },
      },
      include: {
        history: {
          where: {
            date: {
              gte: currentMonthStart,
              lte: currentMonthEnd,
            },
          },
          include: {
            serp_data: {
              where: {
                url: {
                  contains: decodeURIComponent(url),
                },
              },
            },
          },
          orderBy: {
            date: "desc",
          },
        },
      },
    });

    // Process keywords to get detailed information
    const processedKeywords: KeywordData[] = keywords
      .filter((keyword: KeywordWithHistory) => {
        // Only include keywords that have SERP data for this URL
        return keyword.history.some((history) => history.serp_data.length > 0);
      })
      .map((keyword: KeywordWithHistory) => {
        // Get the best position for this keyword
        let bestPosition: number | null = null;
        let bestPositionDate: Date | null = null;
        let bestRankingUrl: string | null = null;

        for (const history of keyword.history) {
          for (const serpData of history.serp_data) {
            if (
              serpData.rank &&
              (bestPosition === null || serpData.rank < bestPosition)
            ) {
              bestPosition = serpData.rank;
              bestPositionDate = history.date;
              bestRankingUrl = serpData.url;
            }
          }
        }

        return {
          id: keyword.id,
          keyword: keyword.keyword,
          base: keyword.base,
          position: bestPosition,
          positionDate: bestPositionDate,
          traffic: 0, // Will be calculated based on position and search volume
          searchVolume: keyword.search_volume,
          cpc: keyword.cpc,
          competition: keyword.competition,
          interest: keyword.interest,
          properties: keyword.properties || [],
          rankingUrl: bestRankingUrl,
        };
      })
      .filter((keyword: KeywordData) => keyword.position !== null) // Only include keywords with valid positions
      .sort(
        (a: KeywordData, b: KeywordData) =>
          (a.position || 0) - (b.position || 0)
      ); // Sort by best position

    // Calculate traffic for each keyword based on position and search volume
    const keywordsWithTraffic: KeywordData[] = processedKeywords.map(
      (keyword: KeywordData) => {
        // Simple traffic calculation based on position and search volume
        // This is a basic approximation - in a real implementation, you might want more sophisticated logic
        let trafficPercentage = 0;
        if (keyword.position) {
          if (keyword.position <= 3) {
            trafficPercentage = 0.3; // 30% of search volume for top 3
          } else if (keyword.position <= 10) {
            trafficPercentage = 0.1; // 10% of search volume for positions 4-10
          } else if (keyword.position <= 20) {
            trafficPercentage = 0.05; // 5% of search volume for positions 11-20
          } else {
            trafficPercentage = 0.01; // 1% of search volume for positions 21+
          }
        }

        const estimatedTraffic = Math.round(
          keyword.searchVolume * trafficPercentage
        );

        return {
          ...keyword,
          traffic: estimatedTraffic,
        };
      }
    );

    // Apply pagination
    const paginatedKeywords = keywordsWithTraffic.slice(from, from + count);
    const totalCount = keywordsWithTraffic.length;

    return NextResponse.json({
      data: paginatedKeywords,
      totalCount,
    });
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
