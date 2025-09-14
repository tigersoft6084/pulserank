import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@repo/db";
import {
  handleAPIError,
  ValidationError,
  AuthenticationError,
} from "@/lib/utils/error-handler";

// Type for the database result
interface DomainIndexInfoResult {
  id: string;
  domain: string;
  ext_backlinks: bigint;
  ref_domains: bigint;
  alexa_rank: string;
  ip: string;
  subnet: string;
  trust_flow: number;
  citation_flow: number;
  percentage: number;
  topical_trust_flow_topic_0: string;
  topical_trust_flow_value_0: number;
  fetched_at: Date;
  createdAt: Date;
  updatedAt: Date;
}

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

    // Get query parameters for pagination and date range
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "30"); // Default to 30 days
    const offset = parseInt(searchParams.get("offset") || "0");

    // Fetch historical data from DomainIndexInfo table
    const historicalData = await prisma.domainIndexInfo.findMany({
      where: {
        domain: domain,
      },
      select: {
        id: true,
        domain: true,
        ext_backlinks: true,
        ref_domains: true,
        alexa_rank: true,
        ip: true,
        subnet: true,
        trust_flow: true,
        citation_flow: true,
        percentage: true,
        topical_trust_flow_topic_0: true,
        topical_trust_flow_value_0: true,
        fetched_at: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        fetched_at: "desc", // Most recent first
      },
      take: limit,
      skip: offset,
    });

    // Transform the data to match the expected format
    const transformedData = historicalData.map(
      (item: DomainIndexInfoResult) => ({
        id: item.id,
        domain: item.domain,
        extBacklinks: Number(item.ext_backlinks),
        refDomains: Number(item.ref_domains),
        alexaRank: item.alexa_rank,
        ip: item.ip,
        subnet: item.subnet,
        trustFlow: item.trust_flow,
        citationFlow: item.citation_flow,
        percentage: item.percentage,
        topicalTrustFlowTopic0: item.topical_trust_flow_topic_0,
        topicalTrustFlowValue0: item.topical_trust_flow_value_0,
        fetchedAt: item.fetched_at.toISOString(),
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
      })
    );

    return NextResponse.json({
      data: transformedData,
      total: transformedData.length,
      limit,
      offset,
    });
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
