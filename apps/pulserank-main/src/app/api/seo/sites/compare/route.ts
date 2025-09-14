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

    const { urls } = await req.json();
    if (!urls) {
      throw new ValidationError("Urls are required");
    }

    const siteIndexData = await majestic.getIndexItemInfo(urls, "fresh", {
      userId: session.user.id,
    });
    const data = siteIndexData.map((item) => ({
      ACRank: item.ACRank,
      RefDomains: item.RefDomains,
      ExtBackLinks: item.ExtBackLinks,
      RefIPs: item.RefIPs,
      RefSubNets: item.RefSubNets,
      CitationFlow: item.CitationFlow,
      TrustFlow: item.TrustFlow,
      TopicalTrustFlow_Topic_0: item.TopicalTrustFlow_Topic_0,
      TopicalTrustFlow_Value_0: item.TopicalTrustFlow_Value_0,
    }));

    return NextResponse.json({
      data,
      urls,
    });
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
