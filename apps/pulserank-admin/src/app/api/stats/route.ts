import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { getUser } from "@/lib/auth";
export async function GET(request: NextRequest) {
  try {
    const session = await getUser();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    // Get current date and calculate previous month
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Total subscribers: number of users who have active userOrders
    const totalSubscribers = await prisma.user.count({
      where: {
        userOrders: {
          some: {
            status: "ACTIVE",
          },
        },
      },
    });

    // Previous month total subscribers
    const previousMonthSubscribers = await prisma.user.count({
      where: {
        userOrders: {
          some: {
            status: "ACTIVE",
            createdAt: {
              lte: previousMonthEnd,
            },
          },
        },
      },
    });

    // Active subscriptions: number of userOrders with active status
    const activeSubscriptions = await prisma.userOrder.count({
      where: {
        status: "ACTIVE",
      },
    });

    // Previous month active subscriptions
    const previousMonthActiveSubscriptions = await prisma.userOrder.count({
      where: {
        status: "ACTIVE",
        createdAt: {
          lte: previousMonthEnd,
        },
      },
    });

    // Monthly Revenue: sum of plan's amount * active plan's subscriptions
    const activeUserOrders = await prisma.userOrder.findMany({
      where: {
        status: "ACTIVE",
      },
      include: {
        plan: {
          select: {
            price: true,
            currency: true,
            interval: true,
          },
        },
      },
    });

    // Calculate monthly revenue
    let monthlyRevenue = 0;
    activeUserOrders.forEach((order: any) => {
      if (order.plan.interval === "MONTH") {
        monthlyRevenue += order.plan.price;
      } else if (order.plan.interval === "YEAR") {
        // Convert yearly to monthly equivalent
        monthlyRevenue += order.plan.price / 12;
      }
    });

    // Previous month revenue
    const previousMonthUserOrders = await prisma.userOrder.findMany({
      where: {
        status: "ACTIVE",
        createdAt: {
          lte: previousMonthEnd,
        },
      },
      include: {
        plan: {
          select: {
            price: true,
            currency: true,
            interval: true,
          },
        },
      },
    });

    let previousMonthRevenue = 0;
    previousMonthUserOrders.forEach((order: any) => {
      if (order.plan.interval === "MONTH") {
        previousMonthRevenue += order.plan.price;
      } else if (order.plan.interval === "YEAR") {
        previousMonthRevenue += order.plan.price / 12;
      }
    });

    // Active services: number of third party services which are active
    const activeServices = await prisma.thirdPartyService.count({
      where: {
        // Assuming there's an isActive field, if not, we'll count all
        // You may need to adjust this based on your actual schema
      },
    });

    // Previous month active services (assuming services don't change frequently)
    const previousMonthActiveServices = await prisma.thirdPartyService.count({
      where: {
        // Same condition as current month
      },
    });

    // Calculate growth percentages
    const calculateGrowth = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    const stats = {
      totalSubscribers: {
        value: totalSubscribers,
        growth: calculateGrowth(totalSubscribers, previousMonthSubscribers),
        isPositive: totalSubscribers >= previousMonthSubscribers,
      },
      activeSubscriptions: {
        value: activeSubscriptions,
        growth: calculateGrowth(
          activeSubscriptions,
          previousMonthActiveSubscriptions
        ),
        isPositive: activeSubscriptions >= previousMonthActiveSubscriptions,
      },
      monthlyRevenue: {
        value: monthlyRevenue,
        growth: calculateGrowth(monthlyRevenue, previousMonthRevenue),
        isPositive: monthlyRevenue >= previousMonthRevenue,
      },
      activeServices: {
        value: activeServices,
        growth: calculateGrowth(activeServices, previousMonthActiveServices),
        isPositive: activeServices >= previousMonthActiveServices,
      },
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
