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

    const [indexItemInfo] = await majestic.getIndexItemInfo([domain], "fresh", {
      userId: session.user.id,
    });

    // Extract all topical trust flow data
    const topicalTrustFlowData: Array<{
      topic: string;
      percentage: number;
      trustFlow: number;
    }> = [];

    // Parse the AllTopics field which contains comma-separated values
    // Format: "Topic=Percentage%=TrustFlow,Topic=Percentage%=TrustFlow,..."
    if (indexItemInfo.TrustCategories) {
      const topicsString = indexItemInfo.TrustCategories as string;
      const topics = topicsString.split(",");

      topics.forEach((topicData) => {
        const parts = topicData.split("=");
        if (parts.length === 3) {
          const topic = parts[0];
          const percentage = parseFloat(parts[1].replace("%", ""));
          const trustFlow = parseInt(parts[2]);

          if (!isNaN(percentage) && !isNaN(trustFlow)) {
            topicalTrustFlowData.push({
              topic,
              percentage,
              trustFlow,
            });
          }
        }
      });
    }

    // Sort by percentage descending
    topicalTrustFlowData.sort((a, b) => b.percentage - a.percentage);

    // Calculate total percentage to normalize values
    const totalPercentage = topicalTrustFlowData.reduce(
      (sum, item) => sum + item.percentage,
      0
    );

    // Normalize percentages to sum to 100%
    const normalizedData = topicalTrustFlowData.map((item) => ({
      ...item,
      normalizedPercentage:
        totalPercentage > 0 ? (item.percentage / totalPercentage) * 100 : 0,
    }));

    return NextResponse.json({
      data: normalizedData,
      totalPercentage,
    });
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
