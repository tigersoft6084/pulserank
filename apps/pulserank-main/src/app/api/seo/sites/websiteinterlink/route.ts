import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { CachedMajesticClient } from "@/lib/api/cached-majestic";
import { CacheService } from "@/lib/services/cache.service";
import {
  handleAPIError,
  ValidationError,
  AuthenticationError,
} from "@/lib/utils/error-handler";
import { getDomainIP } from "@/lib/utils/dns-utils";

const cacheService = CacheService.getInstance();
const majestic = new CachedMajesticClient(cacheService);

export async function POST(req: NextRequest) {
  try {
    const session = await getUser();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    const { domains, datasource = "fresh" } = await req.json();

    if (!domains || !Array.isArray(domains) || domains.length === 0) {
      throw new ValidationError("Domains array is required");
    }

    if (domains.length > 10) {
      throw new ValidationError("Maximum 10 domains allowed");
    }

    // Get backlink data for all domains with separate calls for each referring domain
    const allInterlinkData = [];

    for (const domain of domains) {
      // Get backlinks from each other domain separately
      const otherDomains = domains.filter((d) => d !== domain);
      const allBacklinks = [];

      for (const refDomain of otherDomains) {
        try {
          const backlinkData = await majestic.getBacklinkData(
            domain,
            datasource,
            1, // Mode = 1 to exclude deleted backlinks
            refDomain, // RefDomain - specific referring domain
            1, // MaxSourceURLsPerRefDomain = 1
            100, // MaxResults
            0, // Offset
            {
              userId: session.user.id,
            },
          );

          // Take only the first result from each referring domain
          if (backlinkData.length > 0) {
            allBacklinks.push(backlinkData[0]);
          }
        } catch (error) {
          console.error(
            `Error getting backlinks from ${refDomain} to ${domain}:`,
            error,
          );
        }
      }

      // Get index item info for the domain
      const [indexItemInfo] = await majestic.getIndexItemInfo(
        [domain],
        datasource,
        {
          userId: session.user.id,
        },
      );

      // Get IP address for the domain
      const domainIP = await getDomainIP(domain);

      // Transform backlink data for detail view
      const interlinkDetails = allBacklinks.map((item) => ({
        Source: item.SourceURL,
        Target: item.TargetURL,
        Anchor: item.AnchorText,
        Flags: item.Flags,
        TF: item.SourceTrustFlow,
        CF: item.SourceCitationFlow,
        LastCrawl: item.LastSeenDate,
        Theme: [
          item.SourceTopicalTrustFlow_Topic_0 || "N/A",
          item.SourceTopicalTrustFlow_Value_0 || 0,
        ] as [string, number],
      }));

      const interlinkItem = {
        URL: domain,
        LinksFromOther: allBacklinks.length,
        IP: domainIP,
        RefDomains: indexItemInfo.RefDomains || 0,
        BackLinks: indexItemInfo.ExtBackLinks || 0,
        RefIPs: indexItemInfo.RefIPs || 0,
        TF: indexItemInfo.TrustFlow || 0,
        CF: indexItemInfo.CitationFlow || 0,
        Theme: [
          indexItemInfo.TopicalTrustFlow_Topic_0 || "N/A",
          indexItemInfo.TopicalTrustFlow_Value_0 || 0,
        ] as [string, number],
        details: interlinkDetails, // Include the full backlink data
      };

      allInterlinkData.push(interlinkItem);
    }

    return NextResponse.json(allInterlinkData);
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
