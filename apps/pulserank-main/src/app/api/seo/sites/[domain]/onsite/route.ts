import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { CachedMajesticClient } from "@/lib/api/cached-majestic";
import { CachedDataForSEOClient } from "@/lib/api/cached-dataforseo";
import { CacheService } from "@/lib/services/cache.service";
import { getDomainIP } from "@/lib/utils/dns-utils";
import {
  handleAPIError,
  ValidationError,
  AuthenticationError,
} from "@/lib/utils/error-handler";
import { BASE_DATA } from "@/lib/config";

const cacheService = CacheService.getInstance();
const majestic = new CachedMajesticClient(cacheService);
const dataForSEO = new CachedDataForSEOClient(cacheService);

export async function GET(
  req: NextRequest,
  { params }: { params: { domain: string } },
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

    // Get base from query parameters, default to com_en
    const { searchParams } = new URL(req.url);
    const base = searchParams.get("base") || "com_en";

    // Get location and language codes from the selected base
    const baseConfig = BASE_DATA[base as keyof typeof BASE_DATA];
    if (!baseConfig) {
      throw new ValidationError("Invalid base selected");
    }

    // Get Majestic data (title, alexa rank, indexed pages)
    const [indexItemInfo] = await majestic.getIndexItemInfo([domain], "fresh", {
      userId: session.user.id,
    });

    // Get Google global index using "site:" query
    const siteQuery = `site:${domain}`;
    const serpResponse = await dataForSEO.getSERPData(
      siteQuery,
      baseConfig.location_code,
      baseConfig.language_code,
      { userId: session.user.id },
    );

    // Get CMS data
    const technologiesResponse = await dataForSEO.getDomainTechnologies(
      domain,
      { userId: session.user.id },
    );

    // Get IP address
    const ipAddress = await getDomainIP(domain);

    // Create WHOIS link
    const whoisLink = `http://whois.domaintools.com/${domain}`;

    const responseData = {
      title: indexItemInfo.Title || "No title found",
      alexaRank: indexItemInfo.ACRank || 0,
      majesticIndexedPages: indexItemInfo.IndexedURLs || 0,
      googleGlobalIndex: serpResponse.tasks?.[0]?.result?.[0]?.items_count || 0,
      cms: technologiesResponse.technologies?.content?.cms || [],
      ipAddress,
      whoisLink,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
