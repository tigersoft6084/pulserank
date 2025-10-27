import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { CachedDataForSEOClient } from "@/lib/api/cached-dataforseo";
import { CachedMajesticClient } from "@/lib/api/cached-majestic";
import { CachedSEMrushClient } from "@/lib/api/cached-semrush";
import { CacheService } from "@/lib/services/cache.service";
import {
  handleAPIError,
  ValidationError,
  AuthenticationError,
} from "@/lib/utils/error-handler";
import { BASE_DATA } from "@/lib/config";
import { CompetitionViewItem } from "@/hooks/features/sites/use-website-profiler";

const cacheService = CacheService.getInstance();
const dataForSEO = new CachedDataForSEOClient(cacheService);
const majestic = new CachedMajesticClient(cacheService);
const semrush = new CachedSEMrushClient(cacheService);

export async function POST(req: NextRequest) {
  try {
    const session = await getUser();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    const { keyword, base = "com_en", singleUrl } = await req.json();
    console.log("😊keyword", keyword);
    console.log("😊base", base);
    console.log("😊singleUrl", singleUrl);
    if (!keyword && !singleUrl) {
      throw new ValidationError("Either keyword or singleUrl is required");
    }

    // Get location and language codes from the selected base
    const baseConfig = BASE_DATA[base as keyof typeof BASE_DATA];
    if (!baseConfig) {
      throw new ValidationError("Invalid base selected");
    }

    let urls: string[] = [];

    if (singleUrl) {
      // Single URL analysis mode
      urls = [singleUrl];
    } else {
      // Keyword-based analysis mode
      // Step 1: Get SERP results (top 10 organic results)
      console.log("😊dataforseo request started");
      const serpResponse = await dataForSEO.getSERPData(
        keyword,
        baseConfig.location_code,
        baseConfig.language_code,
        {
          userId: session.user.id,
        }
      );
      console.log("😊dataforseo request completed");
      if (!serpResponse.tasks?.[0]?.result?.[0]?.items) {
        throw new ValidationError("No SERP data returned for the keyword");
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

      const topResults = validResults.slice(0, 10);

      if (topResults.length === 0) {
        throw new ValidationError("No valid SERP results found");
      }

      // Step 2: Extract URLs from top results
      urls = topResults.map((item) => item.url);
    }

    // Step 3: Get competition data for each URL
    const results: CompetitionViewItem[] = [];
    console.log("😊majestic request started");
    for (const url of urls) {
      try {
        // Convert domain to full URL for URL metrics
        const fullUrl = url.startsWith("http") ? url : `http://${url}`;
        const domain = url.replace(/^https?:\/\//, "").replace(/\/.*$/, "");

        // Get URL metrics (full URL)
        const [urlIndexInfo] = await majestic.getIndexItemInfo(
          [fullUrl],
          "fresh",
          {
            userId: session.user.id,
          }
        );
        // Get domain metrics (domain only)
        const [domainIndexInfo] = await majestic.getIndexItemInfo(
          [domain],
          "fresh",
          {
            userId: session.user.id,
          }
        );
        console.log("😊majestic request completed");

        // Get SEMrush data
        let semrushData = { keywords: 0, traffic: 0 };
        try {
          console.log("😊semrush request started");
          const domainRankData = await semrush.getDomainRank(domain, "us", {
            userId: session.user.id,
          });
          console.log("😊semrush request completed");
          semrushData = {
            keywords: domainRankData.organicKeywords,
            traffic: domainRankData.organicTraffic,
          };
        } catch (error) {
          console.error(`Error fetching SEMrush data for ${domain}:`, error);
        }

        results.push({
          URL: url,
          urlMetrics: {
            trustFlow: urlIndexInfo.TrustFlow,
            citationFlow: urlIndexInfo.CitationFlow,
            topicalTrustFlowTopic:
              urlIndexInfo.TopicalTrustFlow_Topic_0 || "N/A",
            topicalTrustFlowValue: urlIndexInfo.TopicalTrustFlow_Value_0 || 0,
            refDomains: urlIndexInfo.RefDomains,
          },
          domainMetrics: {
            trustFlow: domainIndexInfo.TrustFlow,
            citationFlow: domainIndexInfo.CitationFlow,
            topicalTrustFlowTopic:
              domainIndexInfo.TopicalTrustFlow_Topic_0 || "N/A",
            topicalTrustFlowValue:
              domainIndexInfo.TopicalTrustFlow_Value_0 || 0,
            refDomains: domainIndexInfo.RefDomains,
          },
          semrushMetrics: semrushData,
        });
      } catch (error) {
        console.error(`Error processing ${url}:`, error);
        results.push({
          URL: url,
          urlMetrics: {
            trustFlow: 0,
            citationFlow: 0,
            topicalTrustFlowTopic: "N/A",
            topicalTrustFlowValue: 0,
            refDomains: 0,
          },
          domainMetrics: {
            trustFlow: 0,
            citationFlow: 0,
            topicalTrustFlowTopic: "N/A",
            topicalTrustFlowValue: 0,
            refDomains: 0,
          },
          semrushMetrics: { keywords: 0, traffic: 0 },
          error: "Failed to process domain",
        });
      }
    }

    return NextResponse.json({ data: results });
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
