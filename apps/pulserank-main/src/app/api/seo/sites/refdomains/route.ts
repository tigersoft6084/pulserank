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

    const { domain, filters = [], from = 0, count = 100 } = await req.json();
    if (!domain) {
      throw new ValidationError("Domain is required");
    }

    // Get referring domains data
    let refDomains;
    const totalCount = 10000; // Default total count

    if (filters.length > 0) {
      // When filters are applied, fetch a larger dataset to get better filtering results
      // Majestic API doesn't support server-side filtering, so we fetch more data
      const fetchCount = Math.max(count * 50, 5000); // Fetch more data for better filtering
      refDomains = await majestic.getRefDomains(
        [domain],
        "fresh",
        fetchCount,
        0 // Always start from 0 when we have filters
      );
    } else {
      // When no filters, use normal pagination
      refDomains = await majestic.getRefDomains([domain], "fresh", count, from);
    }

    // Transform the data to match the expected format
    let transformedData = refDomains.map((item) => ({
      Domain: item.Domain,
      MatchedLinks: item.MatchedLinks,
      RefDomains: item.RefDomains,
      AlexaRank: item.AlexaRank || "",
      IP: item.IP,
      CountryCode: item.CountryCode,
      TLD: item.Domain.split(".").pop() || "",
      TrustFlow: item.TrustFlow,
      CitationFlow: item.CitationFlow,
      TopicalTrustFlow_Topic_0: item.TopicalTrustFlow_Topic_0,
      TopicalTrustFlow_Value_0: item.TopicalTrustFlow_Value_0,
      LastCrawl: item.LastSuccessfulCrawl,
    }));

    // Apply filters server-side
    if (filters.length > 0) {
      for (const filter of filters) {
        const { field, operator, value } = filter;
        if (!field || value === undefined || value === "") continue;

        transformedData = transformedData.filter((item) => {
          const itemValue = item[field as keyof typeof item];

          switch (operator) {
            case "stringEqualTo":
              return (
                String(itemValue).toLowerCase() === String(value).toLowerCase()
              );
            case "stringNotEqualTo":
              return (
                String(itemValue).toLowerCase() !== String(value).toLowerCase()
              );
            case "numberEqualTo":
              return Number(itemValue) === Number(value);
            case "numberGreaterThan":
              return Number(itemValue) > Number(value);
            case "numberLessThan":
              return Number(itemValue) < Number(value);
            default:
              return true;
          }
        });
      }

      // Apply pagination after filtering
      transformedData = transformedData.slice(from, from + count);
    }

    return NextResponse.json({
      data: transformedData,
      totalCount,
    });
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
