import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { CachedMajesticClient } from "@/lib/api/cached-majestic";
import { CacheService } from "@/lib/services/cache.service";
import {
  handleAPIError,
  ValidationError,
  AuthenticationError,
} from "@/lib/utils/error-handler";
import { BacklinkInCommon } from "@/types/backlinks";

const cacheService = new CacheService();
const majestic = new CachedMajesticClient(cacheService);

export async function POST(req: NextRequest) {
  try {
    const session = await getUser();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    const { items } = await req.json();
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new ValidationError(
        "items array is required and must not be empty",
      );
    }

    const refDomainsData = await majestic.getRefDomains(
      items,
      "fresh",
      100,
      0,
      { userId: session.user.id },
    );

    // Transform RefDomainItem[] to BacklinkInCommon[]
    const backlinksInCommon: BacklinkInCommon[] = refDomainsData.map(
      (item) => ({
        Domain: item.Domain,
        RefDomains: item.RefDomains,
        TrustFlow: item.TrustFlow,
        TopicalTrustFlow_Topic_0: item.TopicalTrustFlow_Topic_0,
        TopicalTrustFlow_Value_0:
          item.TopicalTrustFlow_Value_0 === ""
            ? 0
            : parseInt(item.TopicalTrustFlow_Value_0 as string),
        CitationFlow: item.CitationFlow,
        AlexaRank: item.AlexaRank,
        Matches: item.Matches,
        Backlinks_Counts: items.map((inputItem: string) => {
          const key = `BackLinks_${inputItem}` as keyof typeof item;
          return (item[key] as number) || 0;
        }),
      }),
    );

    return NextResponse.json(backlinksInCommon);
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
