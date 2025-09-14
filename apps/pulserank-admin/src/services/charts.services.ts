import { prisma } from "@repo/db";

export async function getDevicesUsedData(
  timeFrame?: "monthly" | "yearly" | (string & {})
) {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  const data = [
    {
      name: "Desktop",
      percentage: 0.65,
      amount: 1625,
    },
    {
      name: "Tablet",
      percentage: 0.1,
      amount: 250,
    },
    {
      name: "Mobile",
      percentage: 0.2,
      amount: 500,
    },
    {
      name: "Unknown",
      percentage: 0.05,
      amount: 125,
    },
  ];

  if (timeFrame === "yearly") {
    data[0].amount = 19500;
    data[1].amount = 3000;
    data[2].amount = 6000;
    data[3].amount = 1500;
  }

  return data;
}

export async function getPaymentsOverviewData(
  timeFrame?: "monthly" | "yearly" | (string & {})
) {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();

    if (timeFrame === "yearly") {
      // Get yearly data for the past 5 years (including current year)
      const receivedData = [];

      // Calculate the start year (5 years ago from current year)
      const startYear = currentYear - 4;

      for (let year = startYear; year <= currentYear; year++) {
        const yearStart = new Date(year, 0, 1);
        const yearEnd = new Date(year, 11, 31, 23, 59, 59);

        // Get received payments for the year
        const received = await prisma.billingHistory.aggregate({
          where: {
            eventType: "PAYMENT.SALE.COMPLETED",
            createdAt: {
              gte: yearStart,
              lte: yearEnd,
            },
          },
          _sum: {
            amount: true,
          },
        });

        receivedData.push({
          x: year.toString(),
          y: received._sum.amount || 0,
        });
      }

      return {
        received: receivedData,
      };
    } else {
      // Get monthly data for the current year
      const receivedData = [];

      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      for (let month = 0; month < 12; month++) {
        const monthStart = new Date(currentYear, month, 1);
        const monthEnd = new Date(currentYear, month + 1, 0, 23, 59, 59);

        // Get received payments for the month
        const received = await prisma.billingHistory.aggregate({
          where: {
            eventType: "PAYMENT.SALE.COMPLETED",
            createdAt: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
          _sum: {
            amount: true,
          },
        });

        receivedData.push({
          x: monthNames[month],
          y: received._sum.amount || 0,
        });
      }

      return {
        received: receivedData,
      };
    }
  } catch (error) {
    console.error("Error fetching payments overview data:", error);

    // Return fallback data in case of error
    if (timeFrame === "yearly") {
      const currentYear = new Date().getFullYear();
      const startYear = currentYear - 4;

      const fallbackData = [];
      for (let year = startYear; year <= currentYear; year++) {
        fallbackData.push({
          x: year.toString(),
          y: 0,
        });
      }

      return {
        received: fallbackData,
      };
    }

    return {
      received: [
        { x: "Jan", y: 0 },
        { x: "Feb", y: 0 },
        { x: "Mar", y: 0 },
        { x: "Apr", y: 0 },
        { x: "May", y: 0 },
        { x: "Jun", y: 0 },
        { x: "Jul", y: 0 },
        { x: "Aug", y: 0 },
        { x: "Sep", y: 0 },
        { x: "Oct", y: 0 },
        { x: "Nov", y: 0 },
        { x: "Dec", y: 0 },
      ],
    };
  }
}

export async function getCampaignVisitorsData() {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    total_visitors: 784_000,
    performance: -1.5,
    chart: [
      { x: "S", y: 168 },
      { x: "S", y: 385 },
      { x: "M", y: 201 },
      { x: "T", y: 298 },
      { x: "W", y: 187 },
      { x: "T", y: 195 },
      { x: "F", y: 291 },
    ],
  };
}

export async function getVisitorsAnalyticsData() {
  // Fake delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return [
    168, 385, 201, 298, 187, 195, 291, 110, 215, 390, 280, 112, 123, 212, 270,
    190, 310, 115, 90, 380, 112, 223, 292, 170, 290, 110, 115, 290, 380, 312,
  ].map((value, index) => ({ x: index + 1 + "", y: value }));
}

export async function getUserPlanDistributionData() {
  try {
    // Get all users with their active orders and plan information
    const users = await prisma.user.findMany({
      select: {
        id: true,
        userOrders: {
          where: {
            status: "ACTIVE",
          },
          select: {
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

    // Count users by plan type
    const planCounts: { [key: string]: number } = {
      "Freelance Monthly": 0,
      "Freelance Yearly": 0,
      "Studio Monthly": 0,
      "Studio Yearly": 0,
      "Agency Monthly": 0,
      "Agency Yearly": 0,
      "No Active Subscription": 0,
    };

    users.forEach((user: any) => {
      const activeOrder = user.userOrders[0];
      if (activeOrder?.plan) {
        const planName = activeOrder.plan.name;
        const interval = activeOrder.plan.interval;

        if (planName === "Freelance") {
          if (interval === "MONTH") {
            planCounts["Freelance Monthly"]++;
          } else if (interval === "YEAR") {
            planCounts["Freelance Yearly"]++;
          }
        } else if (planName === "Studio") {
          if (interval === "MONTH") {
            planCounts["Studio Monthly"]++;
          } else if (interval === "YEAR") {
            planCounts["Studio Yearly"]++;
          }
        } else if (planName === "Agency") {
          if (interval === "MONTH") {
            planCounts["Agency Monthly"]++;
          } else if (interval === "YEAR") {
            planCounts["Agency Yearly"]++;
          }
        }
      } else {
        planCounts["No Active Subscription"]++;
      }
    });

    // Convert to array format for chart
    const data = Object.entries(planCounts)
      .filter(([_, count]) => count > 0) // Only include plans with users
      .map(([plan, count]) => ({
        name: plan,
        value: count,
      }));

    return data;
  } catch (error) {
    console.error("Error fetching user plan distribution data:", error);

    // Return fallback data in case of error
    return [
      { name: "Freelance Monthly", value: 0 },
      { name: "Freelance Yearly", value: 0 },
      { name: "Studio Monthly", value: 0 },
      { name: "Studio Yearly", value: 0 },
      { name: "Agency Monthly", value: 0 },
      { name: "Agency Yearly", value: 0 },
      { name: "No Active Subscription", value: 0 },
    ];
  }
}

export async function getCostsPerInteractionData() {
  return {
    avg_cost: 560.93,
    growth: 2.5,
    chart: [
      {
        name: "Google Ads",
        data: [
          { x: "Sep", y: 15 },
          { x: "Oct", y: 12 },
          { x: "Nov", y: 61 },
          { x: "Dec", y: 118 },
          { x: "Jan", y: 78 },
          { x: "Feb", y: 125 },
          { x: "Mar", y: 165 },
          { x: "Apr", y: 61 },
          { x: "May", y: 183 },
          { x: "Jun", y: 238 },
          { x: "Jul", y: 237 },
          { x: "Aug", y: 235 },
        ],
      },
      {
        name: "Facebook Ads",
        data: [
          { x: "Sep", y: 75 },
          { x: "Oct", y: 77 },
          { x: "Nov", y: 151 },
          { x: "Dec", y: 72 },
          { x: "Jan", y: 7 },
          { x: "Feb", y: 58 },
          { x: "Mar", y: 60 },
          { x: "Apr", y: 185 },
          { x: "May", y: 239 },
          { x: "Jun", y: 135 },
          { x: "Jul", y: 119 },
          { x: "Aug", y: 124 },
        ],
      },
    ],
  };
}
