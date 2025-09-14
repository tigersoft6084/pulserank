import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { getUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getUser();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const eventType = searchParams.get("eventType");

    const whereClause: any = {};
    if (eventType) {
      whereClause.eventType = eventType;
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * pageSize;

    // Get total count for pagination
    const totalCount = await prisma.billingHistory.count({
      where: whereClause,
    });

    const billingHistory = await prisma.billingHistory.findMany({
      where: whereClause,
      include: {
        userOrder: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            plan: {
              select: {
                id: true,
                name: true,
                price: true,
                currency: true,
                interval: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: pageSize,
    });

    const formattedHistory = billingHistory.map((item: any) => ({
      id: item.id,
      transactionId: item.transactionId,
      eventType: item.eventType,
      amount: item.amount,
      currency: item.currency,
      createdAt: item.createdAt,
      paidAt: item.paidAt,
      customer: item.userOrder.user.name || item.userOrder.user.email,
      customerEmail: item.userOrder.user.email,
      plan: item.userOrder.plan.name,
      subscriptionId: item.subscriptionId,
      data: item.data,
    }));

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / pageSize);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json({
      data: formattedHistory,
      pagination: {
        currentPage: page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    });
  } catch (error) {
    console.error("Error fetching billing history:", error);
    return NextResponse.json(
      { error: "Failed to fetch billing history" },
      { status: 500 }
    );
  }
}
