import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { getUser } from "@/lib/auth";
export async function GET(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");
    const status = searchParams.get("status");

    const whereClause: any = {};
    if (status) {
      whereClause.status = status;
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * pageSize;

    // Get total count for pagination
    const totalCount = await prisma.userOrder.count({
      where: whereClause,
    });

    const userOrders = await prisma.userOrder.findMany({
      where: whereClause,
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
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: pageSize,
    });

    const formattedOrders = userOrders.map((order: any) => ({
      id: order.id,
      customer: order.user.name || order.user.email,
      customerEmail: order.user.email,
      plan: order.plan.name,
      planId: order.plan.id,
      amount: order.plan.price,
      currency: order.plan.currency,
      interval: order.plan.interval,
      status: order.status,
      createdAt: order.createdAt,
      currentPeriodEnd: order.currentPeriodEnd,
      paypalSubscriptionId: order.paypalSubscriptionId,
      tierName: order.tierName,
    }));

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / pageSize);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    return NextResponse.json({
      data: formattedOrders,
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
    console.error("Error fetching user orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch user orders" },
      { status: 500 }
    );
  }
}
