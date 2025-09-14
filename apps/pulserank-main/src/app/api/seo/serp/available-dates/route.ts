import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { prisma } from "@repo/db";
import {
  handleAPIError,
  AuthenticationError,
  ValidationError,
} from "@/lib/utils/error-handler";

export async function POST(req: NextRequest) {
  try {
    const session = await getUser();
    if (!session?.user) {
      throw new AuthenticationError();
    }

    const { keyword, base = "com_en" } = await req.json();
    if (!keyword) {
      throw new ValidationError("Keyword is required");
    }

    // Find the keyword in the database
    const keywordRecord = await prisma.keyword.findFirst({
      where: {
        keyword: keyword,
        base: base,
        campaign: {
          user_id: session.user.id,
        },
      },
    });

    if (!keywordRecord) {
      throw new ValidationError("Keyword not found in database");
    }

    // Get all available dates for this keyword
    const availableDates = await prisma.sERPMachineHistory.findMany({
      where: {
        keyword_id: keywordRecord.id,
      },
      select: {
        date: true,
      },
      orderBy: {
        date: "desc",
      },
    });

    // Format dates as YYYY-MM-DD strings
    const formattedDates = availableDates.map((entry: { date: Date }) => {
      const date = new Date(entry.date);
      return date.toISOString().split("T")[0];
    });

    return NextResponse.json({
      availableDates: formattedDates,
    });
  } catch (error) {
    return handleAPIError(error);
  }
}
