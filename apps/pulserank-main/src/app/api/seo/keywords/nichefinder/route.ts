import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { handleAPIError } from "@/lib/utils/error-handler";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";
    const filters = searchParams.get("filters");
    const base = searchParams.get("base") || "com_en";

    const skip = (page - 1) * limit;

    // Parse filters
    let parsedFilters: Array<{
      field: string;
      operator: string;
      value: string;
    }> = [];
    if (filters) {
      try {
        parsedFilters = JSON.parse(filters);
      } catch (error) {
        console.error("Error parsing filters:", error);
      }
    }

    // Build where clause
    const where: Record<string, unknown> = {
      base: base,
    };

    // Add search filter
    if (search) {
      // Check if search contains quoted terms (related search)
      const quotedTerms = search.match(/"([^"]+)"/g);
      if (quotedTerms && quotedTerms.length > 0) {
        // Extract the terms from quotes
        const terms = quotedTerms.map((term) => term.replace(/"/g, ""));
        // Search for keywords that contain any of the terms
        where.OR = terms.map((term) => ({
          keyword: {
            contains: term,
            mode: "insensitive" as const,
          },
        }));
      } else {
        // Regular search
        where.keyword = {
          contains: search,
          mode: "insensitive" as const,
        };
      }
    }

    // Add advanced filters
    if (parsedFilters.length > 0) {
      const filterConditions = parsedFilters.map((filter) => {
        const field = filter.field;
        const operator = filter.operator;
        const value = filter.value;

        switch (field) {
          case "search_volume":
            switch (operator) {
              case "numberEqualTo":
                return { search_volume: parseInt(value) };
              case "numberGreaterThan":
                return { search_volume: { gt: parseInt(value) } };
              case "numberLessThan":
                return { search_volume: { lt: parseInt(value) } };
              default:
                return {};
            }
          case "cpc":
            switch (operator) {
              case "numberEqualTo":
                return { cpc: parseFloat(value) };
              case "numberGreaterThan":
                return { cpc: { gt: parseFloat(value) } };
              case "numberLessThan":
                return { cpc: { lt: parseFloat(value) } };
              default:
                return {};
            }
          case "competition":
            switch (operator) {
              case "numberEqualTo":
                return { competition: parseFloat(value) };
              case "numberGreaterThan":
                return { competition: { gt: parseFloat(value) } };
              case "numberLessThan":
                return { competition: { lt: parseFloat(value) } };
              default:
                return {};
            }
          case "interest":
            switch (operator) {
              case "numberEqualTo":
                return { interest: parseInt(value) };
              case "numberGreaterThan":
                return { interest: { gt: parseInt(value) } };
              case "numberLessThan":
                return { interest: { lt: parseInt(value) } };
              default:
                return {};
            }
          case "keyword":
            switch (operator) {
              case "stringEqualTo":
                return { keyword: value };
              case "stringNotEqualTo":
                return { keyword: { not: value } };
              case "contains":
                return { keyword: { contains: value, mode: "insensitive" } };
              case "starts with":
                return { keyword: { startsWith: value, mode: "insensitive" } };
              case "ends with":
                return { keyword: { endsWith: value, mode: "insensitive" } };
              default:
                return {};
            }
          default:
            return {};
        }
      });

      // Combine all filter conditions with AND
      Object.assign(where, ...filterConditions);
    }

    const total = await prisma.keyword.count({ where });

    // Get keywords with pagination
    const keywords = await prisma.keyword.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        search_volume: "desc",
      },
      select: {
        id: true,
        keyword: true,
        search_volume: true,
        cpc: true,
        competition: true,
        interest: true,
        base: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      data: keywords,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    const { statusCode, body } = handleAPIError(error);
    return NextResponse.json(body, { status: statusCode });
  }
}
