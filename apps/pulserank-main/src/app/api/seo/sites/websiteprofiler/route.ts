import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { CachedMajesticClient } from "@/lib/api/cached-majestic";
import { CachedSEMrushClient } from "@/lib/api/cached-semrush";
import { CacheService } from "@/lib/services/cache.service";
import {
  handleAPIError,
  ValidationError,
  AuthenticationError,
} from "@/lib/utils/error-handler";

const cacheService = new CacheService();
const majestic = new CachedMajesticClient(cacheService);
const semrush = new CachedSEMrushClient(cacheService);

export async function POST(req: NextRequest) {
  try {
    const session = await getUser();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    const { urls, datasource = "fresh", view = "compact" } = await req.json();

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      throw new ValidationError("URLs array is required");
    }

    if (urls.length > 100) {
      throw new ValidationError("Maximum 100 URLs allowed");
    }

    const userId = session.user.id;

    switch (view) {
      case "compact":
        return await handleCompactView(urls, datasource, userId);
      case "detailed":
        return await handleDetailedView(urls, datasource, userId);
      case "competition":
        return await handleCompetitionView(urls, datasource, userId);
      case "crawl":
        return await handleCrawlView(urls, datasource, userId);
      default:
        throw new ValidationError("Invalid view type");
    }
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}

async function handleCompactView(
  urls: string[],
  datasource: string,
  userId: string
) {
  const siteIndexData = await majestic.getIndexItemInfo(urls, datasource, {
    userId,
  });

  const data = siteIndexData.map((item, index) => ({
    URL: urls[index],
    RefDomains: item.RefDomains,
    BackLinks: item.ExtBackLinks,
    RefIPs: item.RefIPs,
    RefSubnets: item.RefSubNets,
    TrustFlow: item.TrustFlow,
    CitationFlow: item.CitationFlow,
    TopicalTrustFlow_Topic_0: item.TopicalTrustFlow_Topic_0 || "N/A",
    TopicalTrustFlow_Value_0: item.TopicalTrustFlow_Value_0 || 0,
  }));

  return NextResponse.json({ data, view: "compact" });
}

async function handleDetailedView(
  urls: string[],
  datasource: string,
  userId: string
) {
  const results = [];

  for (const url of urls) {
    try {
      // Get basic domain info
      const [indexItemInfo] = await majestic.getIndexItemInfo(
        [url],
        datasource,
        {
          userId,
        }
      );

      // Get anchor text data
      const anchorTextData = await majestic.getAnchorText(
        url,
        datasource,
        1000,
        {
          userId,
        }
      );

      // Get top backlinks (MaxSourceURLsPerRefDomain = 1 to get top 5 different domains)
      const backlinkData = await majestic.getBacklinkData(
        url,
        datasource,
        1, // Mode = 1 to exclude deleted backlinks
        undefined, // RefDomain
        1, // MaxSourceURLsPerRefDomain = 1
        5, // MaxResults = 5
        0, // Offset
        { userId }
      );

      // Get SEMrush keywords (top 5)
      let semrushKeywords: import("@/types/api/semrush").DomainOrganicData[] =
        [];
      try {
        const domain = url.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
        semrushKeywords = await semrush.getDomainOrganic(domain, "us", 5, {
          userId,
        });
      } catch (error) {
        console.error(`Error fetching SEMrush data for ${url}:`, error);
      }

      // Calculate anchor percentages
      const totalRefDomains = anchorTextData.TotalRefDomains;
      const topAnchors = anchorTextData.anchors
        .sort((a, b) => b.RefDomains - a.RefDomains)
        .slice(0, 5)
        .map((anchor) => ({
          anchor: anchor.AnchorText || "[Empty anchor text]",
          count: anchor.RefDomains,
          percentage:
            totalRefDomains > 0
              ? Math.round((anchor.RefDomains / totalRefDomains) * 100)
              : 0,
        }));

      // Process top backlinks (domains only with TTF)
      const topBacklinks = backlinkData
        .map((item) => ({
          domain: new URL(item.SourceURL).hostname,
          ttf: item.SourceTrustFlow || 0,
          theme: item.SourceTopicalTrustFlow_Topic_0 || "N/A",
        }))
        .sort((a, b) => b.ttf - a.ttf)
        .slice(0, 5);

      results.push({
        URL: url,
        metrics: {
          theme: indexItemInfo.TopicalTrustFlow_Topic_0 || "N/A",
          topicalTrustFlowValue: indexItemInfo.TopicalTrustFlow_Value_0 || 0,
          cf: indexItemInfo.CitationFlow,
          tf: indexItemInfo.TrustFlow,
          refDomains: indexItemInfo.RefDomains,
          refIPs: indexItemInfo.RefIPs,
          refSubnets: indexItemInfo.RefSubNets,
          backlinks: indexItemInfo.ExtBackLinks,
        },
        keywords: semrushKeywords.slice(0, 5).map((kw) => ({
          keyword: kw.keyword,
          traffic: kw.traffic,
          position: kw.position,
        })),
        anchors: topAnchors,
        topBacklinks,
      });
    } catch (error) {
      console.error(`Error processing ${url}:`, error);
      results.push({
        URL: url,
        error: "Failed to process domain",
      });
    }
  }

  return NextResponse.json({ data: results, view: "detailed" });
}

async function handleCompetitionView(
  urls: string[],
  datasource: string,
  userId: string
) {
  const results = [];

  for (const url of urls) {
    try {
      // Convert domain to full URL for URL metrics
      const fullUrl = url.startsWith("http") ? url : `http://${url}`;
      const domain = url.replace(/^https?:\/\//, "").replace(/\/.*$/, "");

      // Get URL metrics (full URL)
      const [urlIndexInfo] = await majestic.getIndexItemInfo(
        [fullUrl],
        datasource,
        {
          userId,
        }
      );

      // Get domain metrics (domain only)
      const [domainIndexInfo] = await majestic.getIndexItemInfo(
        [domain],
        datasource,
        {
          userId,
        }
      );

      // Get SEMrush data
      let semrushData = { keywords: 0, traffic: 0 };
      try {
        await semrush.getDomainOrganic(domain, "us", 1, {
          userId,
        });
        // Note: SEMrush doesn't provide total keywords/traffic in this endpoint
        // We'll use placeholder values for now
        semrushData = {
          keywords: 0, // Would need different SEMrush endpoint for total keywords
          traffic: 0, // Would need different SEMrush endpoint for total traffic
        };
      } catch (error) {
        console.error(`Error fetching SEMrush data for ${domain}:`, error);
      }

      results.push({
        URL: url,
        urlMetrics: {
          trustFlow: urlIndexInfo.TrustFlow,
          citationFlow: urlIndexInfo.CitationFlow,
          topicalTrustFlowTopic: urlIndexInfo.TopicalTrustFlow_Topic_0 || "N/A",
          topicalTrustFlowValue: urlIndexInfo.TopicalTrustFlow_Value_0 || 0,
          refDomains: urlIndexInfo.RefDomains,
        },
        domainMetrics: {
          trustFlow: domainIndexInfo.TrustFlow,
          citationFlow: domainIndexInfo.CitationFlow,
          topicalTrustFlowTopic:
            domainIndexInfo.TopicalTrustFlow_Topic_0 || "N/A",
          topicalTrustFlowValue: domainIndexInfo.TopicalTrustFlow_Value_0 || 0,
          refDomains: domainIndexInfo.RefDomains,
        },
        semrushMetrics: semrushData,
      });
    } catch (error) {
      console.error(`Error processing ${url}:`, error);
      results.push({
        URL: url,
        error: "Failed to process domain",
      });
    }
  }

  return NextResponse.json({ data: results, view: "competition" });
}

async function handleCrawlView(
  urls: string[],
  datasource: string,
  userId: string
) {
  const results = [];

  for (const url of urls) {
    try {
      // Get domain info which includes crawl data
      const [indexItemInfo] = await majestic.getIndexItemInfo(
        [url],
        datasource,
        {
          userId,
        }
      );

      results.push({
        URL: url,
        status: "Found", // Majestic doesn't provide detailed status, defaulting to "Found"
        lastCrawlResult: indexItemInfo.LastCrawlResult || "N/A",
        lastCrawlDate: indexItemInfo.LastCrawlDate || "N/A",
        lastSeen: indexItemInfo.LastSeen || "N/A",
      });
    } catch (error) {
      console.error(`Error processing ${url}:`, error);
      results.push({
        URL: url,
        status: "Error",
        lastCrawlResult: "N/A",
        lastCrawlDate: "N/A",
        lastSeen: "N/A",
      });
    }
  }

  return NextResponse.json({ data: results, view: "crawl" });
}
