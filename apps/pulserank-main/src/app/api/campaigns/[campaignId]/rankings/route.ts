import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@repo/db";
import type { SERPMachineHistory, SERPData } from "@repo/db";
import {
  handleAPIError,
  AuthenticationError,
  NotFoundError,
} from "@/lib/utils/error-handler";

export async function GET(
  req: NextRequest,
  { params }: { params: { campaignId: string } }
) {
  try {
    const session = await getUser();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    const { campaignId } = await params;

    // Verify campaign exists and belongs to user
    const campaign = await prisma.campaign.findFirst({
      where: {
        id: campaignId,
        user_id: session.user.id,
      },
    });

    if (!campaign) {
      throw new NotFoundError("Campaign not found");
    }

    const { searchParams } = new URL(req.url);
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    if (!dateFrom || !dateTo) {
      throw new Error("Both dateFrom and dateTo parameters are required");
    }

    // Get all sites for this campaign
    const sites = await prisma.siteForCampaign.findMany({
      where: {
        campaign_id: campaignId,
      },
    });

    // Get all keywords for this campaign
    const keywords = await prisma.keyword.findMany({
      where: {
        campaign_id: campaignId,
      },
    });

    const result = [];

    // For each site-keyword combination, get the ranking data
    for (const site of sites) {
      for (const keyword of keywords) {
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

        // Only include if the site appears in at least one of the rankings
        const hasRankings = rankings.some(
          (ranking: SERPMachineHistory & { serp_data: SERPData[] }) =>
            ranking.serp_data.length > 0
        );

        if (hasRankings) {
          // Transform rankings to include date and best rank/url for each day
          const rankingsArray = rankings.map(
            (ranking: SERPMachineHistory & { serp_data: SERPData[] }) => {
              const serpData = ranking.serp_data[0];
              return {
                date: ranking.date.toISOString().split("T")[0], // YYYY-MM-DD format
                rank: serpData?.rank || null,
                url: serpData?.url || null,
              };
            }
          );

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
