import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { CachedMajesticClient } from "@/lib/api/cached-majestic";
import { CacheService } from "@/lib/services/cache.service";
import {
  handleAPIError,
  ValidationError,
  AuthenticationError,
} from "@/lib/utils/error-handler";

const cacheService = new CacheService();
const majestic = new CachedMajesticClient(cacheService);

export async function POST(req: NextRequest) {
  try {
    const session = await getUser();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    const { domain, dataSource = "fresh" } = await req.json();

    if (!domain) {
      throw new ValidationError("Domain is required");
    }

    // Clean the domain input
    const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "");

    // Call Majestic API GetHostedDomains
    const hostedDomainsData = await majestic.getHostedDomains(
      cleanDomain,
      dataSource,
      { userId: session.user.id }
    );

    // Format the response data - combine both IP and subnet domains
    const domainsOnIP = hostedDomainsData.domainsOnIP.map((item) => ({
      domain: item.Domain,
      ip: item.IPAddress,
      refDomains: item.RefDomains,
      backLinks: item.ExtBackLinks,
      trustFlow: item.TrustFlow,
      citationFlow: item.CitationFlow,
      percentage:
        item.TrustFlow > 0 && item.CitationFlow > 0
          ? Math.round((item.TrustFlow / item.CitationFlow) * 100)
          : 0,
      theme: item.TopicalTrustFlow_Topic_0,
      themeValue: item.TopicalTrustFlow_Value_0,
      type: "same-ip" as const,
    }));

    const domainsOnSubnet = hostedDomainsData.domainsOnSubnet.map((item) => ({
      domain: item.Domain,
      ip: item.IPAddress,
      refDomains: item.RefDomains,
      backLinks: item.ExtBackLinks,
      trustFlow: item.TrustFlow,
      citationFlow: item.CitationFlow,
      percentage:
        item.TrustFlow > 0 && item.CitationFlow > 0
          ? Math.round((item.TrustFlow / item.CitationFlow) * 100)
          : 0,
      theme: item.TopicalTrustFlow_Topic_0,
      themeValue: item.TopicalTrustFlow_Value_0,
      type: "same-subnet" as const,
    }));

    // Combine with domainsOnIP first, then domainsOnSubnet
    const allDomains = [...domainsOnIP, ...domainsOnSubnet];

    // Get original domain info
    const [originalDomainInfo] = await majestic.getIndexItemInfo(
      [cleanDomain],
      dataSource,
      { userId: session.user.id }
    );

    const originalDomain = {
      domain: cleanDomain,
      ip: hostedDomainsData.currentIP || "N/A",
      refDomains: originalDomainInfo.RefDomains,
      backLinks: originalDomainInfo.ExtBackLinks,
      trustFlow: originalDomainInfo.TrustFlow,
      citationFlow: originalDomainInfo.CitationFlow,
      percentage:
        originalDomainInfo.TrustFlow > 0 && originalDomainInfo.CitationFlow > 0
          ? Math.round(
              (originalDomainInfo.TrustFlow / originalDomainInfo.CitationFlow) *
                100
            )
          : 0,
      theme: originalDomainInfo.TopicalTrustFlow_Topic_0,
      themeValue: originalDomainInfo.TopicalTrustFlow_Value_0,
    };

    return NextResponse.json({
      data: allDomains,
      originalDomain,
      totalFound: allDomains.length,
      searchType: "Same IP and Subnet",
      dataSource,
      summary: {
        sameIP: domainsOnIP.length,
        sameSubnet: domainsOnSubnet.length,
        total: allDomains.length,
      },
      ipInfo: {
        currentIP: hostedDomainsData.currentIP,
        recommendedIP: hostedDomainsData.recommendedIP,
        hasDifferentIPs:
          hostedDomainsData.currentIP !== hostedDomainsData.recommendedIP,
      },
    });
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
