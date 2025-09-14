import { prisma } from "@repo/db";

export async function getOverviewData() {
  try {
    // Get current month and previous month dates
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    // const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    // const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // 1. Total Users
    const currentTotalUsers = await prisma.user.count();
    const previousTotalUsers = await prisma.user.count({
      where: {
        createdAt: {
          lt: currentMonth,
        },
      },
    });

    // 2. Active Subscriptions (UserOrders with status 'ACTIVE')
    const currentActiveSubscriptions = await prisma.userOrder.count({
      where: {
        status: "ACTIVE",
      },
    });

    const previousActiveSubscriptions = await prisma.userOrder.count({
      where: {
        status: "ACTIVE",
        createdAt: {
          lt: currentMonth,
        },
      },
    });

    // 3. Total Revenue (sum of billing history amounts with PAYMENT.SALE.COMPLETED)
    const currentRevenue = await prisma.billingHistory.aggregate({
      where: {
        eventType: "PAYMENT.SALE.COMPLETED",
        userOrder: {
          status: "ACTIVE",
        },
      },
      _sum: {
        amount: true,
      },
    });

    const previousRevenue = await prisma.billingHistory.aggregate({
      where: {
        eventType: "PAYMENT.SALE.COMPLETED",
        userOrder: {
          status: "ACTIVE",
        },
        createdAt: {
          lt: currentMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // 4. Active Subscribers (Users who have active subscriptions)
    const currentActiveSubscribers = await prisma.user.count({
      where: {
        userOrders: {
          some: {
            status: "ACTIVE",
          },
        },
      },
    });

    const previousActiveSubscribers = await prisma.user.count({
      where: {
        userOrders: {
          some: {
            status: "ACTIVE",
            createdAt: {
              lt: currentMonth,
            },
          },
        },
      },
    });

    // Calculate growth rates with better handling of edge cases
    const calculateGrowthRate = (current: number, previous: number): number => {
      if (previous === 0) {
        return current > 0 ? 100 : 0;
      }
      const growth = ((current - previous) / previous) * 100;
      // Round to 2 decimal places
      return Math.round(growth * 100) / 100;
    };

    const totalUsersGrowth = calculateGrowthRate(
      currentTotalUsers,
      previousTotalUsers
    );
    const activeSubscriptionsGrowth = calculateGrowthRate(
      currentActiveSubscriptions,
      previousActiveSubscriptions
    );
    const revenueGrowth = calculateGrowthRate(
      currentRevenue._sum.amount || 0,
      previousRevenue._sum.amount || 0
    );
    const activeSubscribersGrowth = calculateGrowthRate(
      currentActiveSubscribers,
      previousActiveSubscribers
    );

    return {
      totalUsers: {
        value: currentTotalUsers,
        growthRate: totalUsersGrowth,
      },
      activeSubscriptions: {
        value: currentActiveSubscriptions,
        growthRate: activeSubscriptionsGrowth,
      },
      totalRevenue: {
        value: currentRevenue._sum.amount || 0,
        growthRate: revenueGrowth,
      },
      activeSubscribers: {
        value: currentActiveSubscribers,
        growthRate: activeSubscribersGrowth,
      },
    };
  } catch (error) {
    console.error("Error fetching overview data:", error);
    // Return fallback data in case of error
    return {
      totalUsers: {
        value: 0,
        growthRate: 0,
      },
      activeSubscriptions: {
        value: 0,
        growthRate: 0,
      },
      totalRevenue: {
        value: 0,
        growthRate: 0,
      },
      activeSubscribers: {
        value: 0,
        growthRate: 0,
      },
    };
  }
}

export async function getChatsData() {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return [
    {
      name: "Jacob Jones New Pro subscription by John Doe",
      profile: "/images/user/user-01.png",
      isActive: true,
      lastMessage: {
        content: "See you tomorrow at the meeting!",
        type: "text",
        timestamp: "2024-12-19T14:30:00Z",
        isRead: false,
      },
      unreadCount: 3,
    },
    {
      name: "Wilium Smith",
      profile: "/images/user/user-03.png",
      isActive: true,
      lastMessage: {
        content: "Thanks for the update",
        type: "text",
        timestamp: "2024-12-19T10:15:00Z",
        isRead: true,
      },
      unreadCount: 0,
    },
    {
      name: "Johurul Haque",
      profile: "/images/user/user-04.png",
      isActive: false,
      lastMessage: {
        content: "What's up?",
        type: "text",
        timestamp: "2024-12-19T10:15:00Z",
        isRead: true,
      },
      unreadCount: 0,
    },
    {
      name: "M. Chowdhury",
      profile: "/images/user/user-05.png",
      isActive: false,
      lastMessage: {
        content: "Where are you now?",
        type: "text",
        timestamp: "2024-12-19T10:15:00Z",
        isRead: true,
      },
      unreadCount: 2,
    },
    {
      name: "Akagami",
      profile: "/images/user/user-07.png",
      isActive: false,
      lastMessage: {
        content: "Hey, how are you?",
        type: "text",
        timestamp: "2024-12-19T10:15:00Z",
        isRead: true,
      },
      unreadCount: 0,
    },
  ];
}

export async function getRecentBillingHistory() {
  try {
    const billingHistory = await prisma.billingHistory.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        userOrder: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
            plan: {
              select: {
                name: true,
                interval: true,
              },
            },
          },
        },
      },
    });

    return billingHistory.map(
      (item: {
        userOrder: {
          user: {
            name: string;
          };
          plan: {
            name: string;
            interval: string;
          };
        };
        amount: number | null;
        eventType: string;
        createdAt: Date;
      }) => {
        const userName = item.userOrder?.user?.name || "Unknown User";
        const planName = item.userOrder?.plan?.name || "Unknown Plan";
        const planInterval = item.userOrder?.plan?.interval || "";
        const amount = item.amount || 0;
        const eventType = item.eventType;

        let message = "";
        let type = "payment";

        switch (eventType) {
          case "PAYMENT.SALE.COMPLETED":
            message = `Payment received from ${userName} for ${planName} ${planInterval.toLowerCase()}`;
            type = "payment";
            break;
          case "BILLING.SUBSCRIPTION.CREATED":
            message = `New ${planName} subscription by ${userName}`;
            type = "subscription";
            break;
          case "BILLING.SUBSCRIPTION.CANCELLED":
            message = `${userName} cancelled ${planName} subscription`;
            type = "cancellation";
            break;
          case "BILLING.SUBSCRIPTION.UPDATED":
            message = `${userName} updated to ${planName} ${planInterval.toLowerCase()}`;
            type = "subscription";
            break;
          case "PAYMENT.SALE.DENIED":
            message = `Payment denied for ${userName} - ${planName}`;
            type = "cancellation";
            break;
          default:
            message = `${eventType} for ${userName}`;
            type = "payment";
        }

        return {
          type,
          message,
          time: item.createdAt.toISOString(),
          amount: amount > 0 ? `$${amount.toFixed(2)}` : null,
          eventType,
        };
      }
    );
  } catch (error) {
    console.error("Error fetching recent billing history:", error);
    // Return fallback data in case of error
    return [
      {
        type: "payment",
        message: "Payment received from John Doe for Freelance monthly",
        time: new Date().toISOString(),
        amount: "$29.99",
        eventType: "PAYMENT.SALE.COMPLETED",
      },
    ];
  }
}
