import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@repo/db";
import type { SERPMachineHistory, SERPData } from "@repo/db";
import { handleAPIError, AuthenticationError } from "@/lib/utils/error-handler";

export async function GET(req: NextRequest) {
  try {
    const session = await getUser();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    const { searchParams } = new URL(req.url);
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    if (!dateFrom || !dateTo) {
      throw new Error("Both dateFrom and dateTo parameters are required");
    }

    // Get all campaigns for the user
    const campaigns = await prisma.campaign.findMany({
      where: {
        user_id: session.user.id,
      },
      include: {
        sites: true,
        keywords: true,
      },
    });

    if (!campaigns.length) {
      return NextResponse.json([]);
    }

    const result = [];

    // For each campaign, get rankings for all site-keyword combinations
    for (const campaign of campaigns) {
      for (const site of campaign.sites) {
        for (const keyword of campaign.keywords) {
          // Get all rankings for this keyword in the date range
          const fromDate = new Date(dateFrom);
          fromDate.setUTCHours(0, 0, 0, 0);

          const toDate = new Date(dateTo);
          toDate.setUTCHours(23, 59, 59, 999);

          const rankings = await prisma.sERPMachineHistory.findMany({
            where: {
              keyword_id: keyword.id,
              date: {
                gte: fromDate,
                lte: toDate,
              },
            },
            include: {
              serp_data: {
                where: {
                  url: {
                    contains: site.url,
                  },
                },
                orderBy: {
                  rank: "asc",
                },
                take: 1,
              },
            },
            orderBy: {
              date: "asc",
            },
          });

          // Always include the site-keyword combination, even if no rankings exist yet
          let rankingsArray: Array<{
            date: string;
            rank: number | null;
            url: string | null;
          }> = [];

          if (rankings.length > 0) {
            // Transform rankings to include date and best rank/url for each day
            rankingsArray = rankings.map(
              (ranking: SERPMachineHistory & { serp_data: SERPData[] }) => {
                const serpData = ranking.serp_data[0];
                return {
                  date: ranking.date.toISOString().split("T")[0], // YYYY-MM-DD format
                  rank: serpData?.rank || null,
                  url: serpData?.url || null,
                };
              }
            );
          }

          result.push({
            site: site.url,
            keyword: keyword.keyword,
            base: keyword.base,
            cpc: keyword.cpc,
            search_volume: keyword.search_volume,
            properties: keyword.properties,
            competition: keyword.competition,
            interest: keyword.interest,
            rankings: rankingsArray,
          });
        }
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
