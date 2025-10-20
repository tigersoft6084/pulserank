import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { CachedMajesticClient } from "@/lib/api/cached-majestic";
import { CacheService } from "@/lib/services/cache.service";
import {
  handleAPIError,
  ValidationError,
  AuthenticationError,
} from "@/lib/utils/error-handler";
import { DomainInfo } from "@/types/sites";

const cacheService = CacheService.getInstance();
const majestic = new CachedMajesticClient(cacheService);

export async function GET(
  req: NextRequest,
  { params }: { params: { domain: string } }
) {
  try {
    const session = await getUser();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    const { domain } = await params;
    if (!domain) {
      throw new ValidationError("Domain is required");
    }

    const [indexItemInfo, anchorText] = await Promise.all([
      majestic.getIndexItemInfo([domain], "fresh", { userId: session.user.id }),
      majestic.getAnchorText(domain, "fresh", 10, { userId: session.user.id }),
    ]);

    // Extract the first (and only) item from indexItemInfo
    const domainInfo = indexItemInfo[0];

    // Extract all topical trust flow data using TrustCategories field
    const topicalTrustFlowDetails: Array<{
      topic: string;
      percentage: number;
      trustFlow: number;
    }> = [];

    // Parse the TrustCategories field which contains comma-separated values
    // Format: "Topic=Percentage%=TrustFlow,Topic=Percentage%=TrustFlow,..."
    if (domainInfo.TrustCategories) {
      const topicsString = domainInfo.TrustCategories as string;
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
        trustFlow: domainInfo.TrustFlow,
        citationFlow: domainInfo.CitationFlow,
        topicalTrustFlowDetails: normalizedTopicalTrustFlowDetails,
      },

      // Domain info from GetIndexItemInfo
      domainInfo: {
        referringDomains: domainInfo.RefDomains,
        referringPages: domainInfo.ExtBackLinks,
        ipSubnets: `${domainInfo.RefIPs} (${domainInfo.RefSubNets})`,
        eduDomains: domainInfo.RefDomainsEDU,
        govDomains: domainInfo.RefDomainsGOV,
        crawlStatus: domainInfo.Status,
        lastCrawlResult: domainInfo.LastCrawlResult,
        lastCrawlDate: domainInfo.LastCrawlDate,
      },

      anchorTextData: anchorText,
    } as DomainInfo;

    return NextResponse.json(responseData);
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
