import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { CachedMajesticClient } from "@/lib/api/cached-majestic";

import { CacheService } from "@/lib/services/cache.service";
import {
  handleAPIError,
  ValidationError,
  AuthenticationError,
} from "@/lib/utils/error-handler";
import { BASE_DATA } from "@/lib/config";
import { prisma } from "@repo/db";
import type { SERPData } from "@repo/db";

const cacheService = CacheService.getInstance();
const majestic = new CachedMajesticClient(cacheService);

export async function POST(req: NextRequest) {
  try {
    const session = await getUser();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    const {
      keywords,
      position,
      rankRange,
      base,
      filters = [],
    } = await req.json();

    if (!keywords || !Array.isArray(keywords) || keywords.length === 0) {
      throw new ValidationError("Keywords array is required");
    }

    if (keywords.length > 100) {
      throw new ValidationError("Maximum 100 keywords allowed");
    }

    const baseConfig = BASE_DATA[base as keyof typeof BASE_DATA];

    if (!baseConfig) {
      throw new ValidationError("Invalid search engine selected");
    }

    // Determine rank limit based on rankRange
    const rankLimits: Record<string, number> = {
      "top-10": 10,
      "top-50": 50,
      "top-100": 100,
    };
    const rankLimit = rankLimits[rankRange] || 10;

    // Collect all unique domains from SERP results
    const allDomains = new Set<string>();
    const domainTitles: Record<string, string> = {};

    // Process each keyword
    for (const keyword of keywords) {
      try {
        let serpResults: SERPResult[] = [];

        if (position === "who-are-currently") {
          // Get current SERP data from database (most recent entry)
          const keywordRecord = await prisma.keyword.findFirst({
            where: {
              keyword: keyword,
              base: base,
              campaign: {
                user_id: session.user.id,
              },
            },
          });

          if (keywordRecord) {
            // Get the most recent SERP history entry
            const latestHistory = await prisma.sERPMachineHistory.findFirst({
              where: {
                keyword_id: keywordRecord.id,
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
            });

            if (latestHistory) {
              serpResults = latestHistory.serp_data
                .slice(0, rankLimit)
                .map((item: SERPData) => ({
                  rank: item.rank,
                  url: item.url,
                  title: item.title,
                  domain: item.url
                    .replace(/^https?:\/\//, "")
                    .replace(/\/.*$/, ""),
                }));
            }
          }
        } else if (position === "who-were-in-the-last-6-months") {
          // Get SERP data from the last 6 months
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

          const keywordRecord = await prisma.keyword.findFirst({
            where: {
              keyword: keyword,
              base: base,
              campaign: {
                user_id: session.user.id,
              },
            },
          });

          if (keywordRecord) {
            const historicalData = await prisma.sERPMachineHistory.findMany({
              where: {
                keyword_id: keywordRecord.id,
                date: {
                  gte: sixMonthsAgo,
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
            });

            // Collect all unique domains from the last 6 months
            const domainRankings: Record<
              string,
              { rank: number; title: string; url: string }
            > = {};

            historicalData.forEach((history: SERPHistoryWithData) => {
              history.serp_data
                .slice(0, rankLimit)
                .forEach((item: SERPData) => {
                  const domain = item.url
                    .replace(/^https?:\/\//, "")
                    .replace(/\/.*$/, "");
                  // Keep the best (lowest) rank for each domain
                  if (
                    !domainRankings[domain] ||
                    item.rank < domainRankings[domain].rank
                  ) {
                    domainRankings[domain] = {
                      rank: item.rank,
                      title: item.title,
                      url: item.url,
                    };
                  }
                });
            });

            // Convert to SERP results format
            serpResults = Object.entries(domainRankings)
              .map(([domain, data]) => ({
                rank: data.rank,
                url: data.url,
                title: data.title,
                domain: domain,
              }))
              .sort((a, b) => a.rank - b.rank)
              .slice(0, rankLimit);
          }
        } else if (position === "who-are-on-everything") {
          // Get SERP data from all available history
          const keywordRecord = await prisma.keyword.findFirst({
            where: {
              keyword: keyword,
              base: base,
              campaign: {
                user_id: session.user.id,
              },
            },
          });

          if (keywordRecord) {
            const allHistoricalData = await prisma.sERPMachineHistory.findMany({
              where: {
                keyword_id: keywordRecord.id,
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
            });

            // Collect all unique domains from all history
            const domainRankings: Record<
              string,
              { rank: number; title: string; url: string }
            > = {};

            allHistoricalData.forEach((history: SERPHistoryWithData) => {
              history.serp_data
                .slice(0, rankLimit)
                .forEach((item: SERPData) => {
                  const domain = item.url
                    .replace(/^https?:\/\//, "")
                    .replace(/\/.*$/, "");
                  // Keep the best (lowest) rank for each domain
                  if (
                    !domainRankings[domain] ||
                    item.rank < domainRankings[domain].rank
                  ) {
                    domainRankings[domain] = {
                      rank: item.rank,
                      title: item.title,
                      url: item.url,
                    };
                  }
                });
            });

            // Convert to SERP results format
            serpResults = Object.entries(domainRankings)
              .map(([domain, data]) => ({
                rank: data.rank,
                url: data.url,
                title: data.title,
                domain: domain,
              }))
              .sort((a, b) => a.rank - b.rank)
              .slice(0, rankLimit);
          }
        }

        // Extract domains and titles from SERP results
        serpResults.forEach((result: SERPResult) => {
          if (result.domain) {
            allDomains.add(result.domain);
            if (result.title) {
              domainTitles[result.domain] = result.title;
            }
          }
        });
      } catch (error) {
        console.error(`Error processing keyword ${keyword}:`, error);
        // Continue with other keywords even if one fails
      }
    }

    // Convert Set to Array
    const domainsArray = Array.from(allDomains);

    if (domainsArray.length === 0) {
      return NextResponse.json({
        data: [],
      });
    }

    // Get domain data from Majestic for all collected domains
    const domainData = await majestic.getIndexItemInfo(domainsArray, "fresh", {
      userId: session.user.id,
    });

    // Transform the data to match the expected format
    // Note: getIndexItemInfo returns data in the same order as the input domains array
    const data = domainData.map((item, index) => ({
      URL: domainsArray[index],
      TrustFlow: item.TrustFlow,
      CitationFlow: item.CitationFlow,
      RefDomains: item.RefDomains,
      TopicalTrustFlow_Value_0: item.TopicalTrustFlow_Value_0,
      TopicalTrustFlow_Topic_0: item.TopicalTrustFlow_Topic_0,
      Percentage:
        item.TrustFlow > 0 && item.CitationFlow > 0
          ? Math.round((item.TrustFlow / item.CitationFlow) * 100)
          : 0,
      Title: domainTitles[domainsArray[index]] || domainsArray[index], // Use SERP title if available, fallback to domain
    }));

    // Sort by TF (TrustFlow) descending as requested
    let sortedData = data.sort((a, b) => b.TrustFlow - a.TrustFlow);

    // Apply filters if provided
    if (filters && filters.length > 0) {
      sortedData = applyFilters(sortedData, filters);
    }

    return NextResponse.json({
      data: sortedData,
    });
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}

// Helper function to determine if a field is numeric
function isNumericField(field: string): boolean {
  const numericFields = [
    "TrustFlow",
    "CitationFlow",
    "RefDomains",
    "TopicalTrustFlow_Value_0",
    "Percentage",
  ];
  return numericFields.includes(field);
}

// Apply filters to domain data
function applyFilters(
  data: Array<{
    URL: string;
    TrustFlow: number;
    CitationFlow: number;
    RefDomains: number;
    TopicalTrustFlow_Value_0: number;
    TopicalTrustFlow_Topic_0: string;
    Percentage: number;
    Title: string;
    [key: string]: string | number;
  }>,
  filters: Array<{ field: string; operator: string; value: string }>
): Array<{
  URL: string;
  TrustFlow: number;
  CitationFlow: number;
  RefDomains: number;
  TopicalTrustFlow_Value_0: number;
  TopicalTrustFlow_Topic_0: string;
  Percentage: number;
  Title: string;
  [key: string]: string | number;
}> {
  return data.filter((item) => {
    return filters.every((filter) => {
      const fieldValue = item[filter.field];
      const filterValue = filter.value;

      if (isNumericField(filter.field)) {
        const numValue =
          typeof fieldValue === "number"
            ? fieldValue
            : parseFloat(String(fieldValue));
        const numFilterValue = parseFloat(filterValue);

        switch (filter.operator) {
          case "numberEqualTo":
            return numValue === numFilterValue;
          case "numberGreaterThan":
            return numValue > numFilterValue;
          case "numberLessThan":
            return numValue < numFilterValue;
          default:
            return true;
        }
      } else {
        const stringValue = String(fieldValue || "").toLowerCase();
        const stringFilterValue = filterValue.toLowerCase();

        switch (filter.operator) {
          case "stringEqualTo":
            return stringValue === stringFilterValue;
          case "stringNotEqualTo":
            return stringValue !== stringFilterValue;
          case "contains":
            return stringValue.includes(stringFilterValue);
          case "starts with":
            return stringValue.startsWith(stringFilterValue);
          case "ends with":
            return stringValue.endsWith(stringFilterValue);
          default:
            return true;
        }
      }
    });
  });
}

interface SERPResult {
  rank: number;
  url: string;
  title: string;
  domain: string;
}

interface SERPHistoryWithData {
  id: string;
  date: Date;
  keyword_id: string;
  serp_data: SERPData[];
}
