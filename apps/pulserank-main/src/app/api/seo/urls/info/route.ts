import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { CachedMajesticClient } from "@/lib/api/cached-majestic";
import { CacheService } from "@/lib/services/cache.service";
import {
  handleAPIError,
  ValidationError,
  AuthenticationError,
} from "@/lib/utils/error-handler";
import { UrlInfo } from "@/types/urls";

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

    const [indexItemInfo, anchorText] = await Promise.all([
      majestic.getIndexItemInfo([url], "fresh", { userId: session.user.id }),
      majestic.getAnchorText(url, "fresh", 10, { userId: session.user.id }),
    ]);
    // Extract the first (and only) item from indexItemInfo
    const urlInfo = indexItemInfo[0];

    // Extract all topical trust flow data using TrustCategories field
    const topicalTrustFlowDetails: Array<{
      topic: string;
      percentage: number;
      trustFlow: number;
    }> = [];

    // Parse the TrustCategories field which contains comma-separated values
    // Format: "Topic=Percentage%=TrustFlow,Topic=Percentage%=TrustFlow,..."
    if (urlInfo.TrustCategories) {
      const topicsString = urlInfo.TrustCategories as string;
      const topics = topicsString.split(",");

      topics.forEach((topicData) => {
        const parts = topicData.split("=");
        if (parts.length === 3) {
          const topic = parts[0];
          const percentage = parseFloat(parts[1].replace("%", ""));
          const trustFlow = parseInt(parts[2]);

          if (!isNaN(percentage) && !isNaN(trustFlow)) {
            topicalTrustFlowDetails.push({
              topic,
              percentage,
              trustFlow,
            });
          }
        }
      });
    }

    // Sort by percentage descending
    topicalTrustFlowDetails.sort((a, b) => b.percentage - a.percentage);

    // Calculate total percentage to normalize values
    const totalPercentage = topicalTrustFlowDetails.reduce(
      (sum, item) => sum + item.percentage,
      0
    );

    // Normalize percentages to sum to 100%
    const normalizedTopicalTrustFlowDetails = topicalTrustFlowDetails.map(
      (item) => ({
        ...item,
        normalizedPercentage:
          totalPercentage > 0 ? (item.percentage / totalPercentage) * 100 : 0,
      })
    );

    const responseData = {
      // From GetIndexItemInfo
      offsiteData: {
        trustFlow: urlInfo.TrustFlow,
        citationFlow: urlInfo.CitationFlow,
        topicalTrustFlowDetails: normalizedTopicalTrustFlowDetails,
      },

      // Domain info from GetIndexItemInfo
      domainInfo: {
        referringDomains: urlInfo.RefDomains,
        referringPages: urlInfo.ExtBackLinks,
        ipSubnets: `${urlInfo.RefIPs} (${urlInfo.RefSubNets})`,
        eduDomains: urlInfo.RefDomainsEDU,
        govDomains: urlInfo.RefDomainsGOV,
        crawlStatus: urlInfo.Status,
        lastCrawlResult: urlInfo.LastCrawlResult,
        lastCrawlDate: urlInfo.LastCrawlDate,
      },

      anchorTextData: anchorText,
    } as UrlInfo;

    return NextResponse.json(responseData);
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
