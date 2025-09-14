import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/db";
import { paypalService } from "@/services/paypal.service";
import { getUser } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getUser();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const plans = await prisma.plan.findMany({
      include: {
        userOrders: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            logs: {
              select: {
                amount: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    // Calculate subscribers and revenue for each plan
    const plansWithStats = plans.map((plan: any) => {
      const activeSubscriptions = plan.userOrders.filter(
        (order: any) => order.status === "ACTIVE"
      );
      const subscribers = activeSubscriptions.length;
      const revenue = plan.userOrders.reduce((acc: number, order: any) => {
        const userLogs = order.logs;
        const userRevenue = userLogs.reduce((acc: number, log: any) => {
          return acc + log.amount;
        }, 0);
        return acc + userRevenue;
      }, 0);

      return {
        id: plan.id,
        name: plan.name,
        price: plan.price,
        interval: plan.interval,
        active: plan.active,
        constraints: plan.constraints,
        currency: plan.currency,
        paypalPlanId: plan.paypalPlanId,
        createdAt: plan.createdAt,
        subscribers,
        revenue,
        status: plan.active ? "Active" : "Inactive",
      };
    });

    return NextResponse.json(plansWithStats);
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch plans" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getUser();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const {
      name,
      price,
      interval,
      constraints,
      currency,
      paypalPlanId,
      isPriceCurrencyUpdate,
      oldPlanId,
    } = body;

    // Validate required fields
    if (!name || !price || !interval || !paypalPlanId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // If this is a price/currency update, we need to handle PayPal plan creation
    if (isPriceCurrencyUpdate) {
      // Check if PayPal is configured
      if (!paypalService.isConfigured()) {
        return NextResponse.json(
          {
            error:
              "PayPal integration is not configured. Please set up PayPal credentials to update plan pricing.",
          },
          { status: 500 }
        );
      }

      // Create new PayPal plan with updated pricing
      const paypalResult = await paypalService.createPlan({
        name,
        price: parseFloat(price),
        currency: currency || "USD",
        interval,
      });

      if (!paypalResult.success) {
        return NextResponse.json(
          { error: `Failed to create PayPal plan: ${paypalResult.message}` },
          { status: 500 }
        );
      }

      // Create new plan in database with new PayPal plan ID
      const newPlan = await prisma.plan.create({
        data: {
          name,
          price: parseFloat(price),
          interval,
          constraints: constraints || {},
          currency: currency || "USD",
          paypalPlanId: paypalResult.planId!, // Use the new PayPal plan ID
          active: true,
        },
      });

      // If there's an old plan to deactivate
      if (oldPlanId) {
        try {
          // Get the old plan to get its PayPal plan ID
          const oldPlan = await prisma.plan.findUnique({
            where: { id: oldPlanId },
          });

          if (oldPlan) {
            // Deactivate the old plan in PayPal
            const deactivateResult = await paypalService.deactivatePlan(
              oldPlan.paypalPlanId
            );

            if (deactivateResult.success) {
              // Update the old plan in database to inactive
              await prisma.plan.update({
                where: { id: oldPlanId },
                data: { active: false },
              });
            } else {
              console.warn(
                `Failed to deactivate old PayPal plan: ${deactivateResult.message}`
              );
              // Continue anyway, as the new plan is created
            }
          }
        } catch (error) {
          console.error("Error deactivating old plan:", error);
          // Continue anyway, as the new plan is created
        }
      }

      return NextResponse.json(newPlan, { status: 201 });
    } else {
      // Regular plan creation (existing logic)
      const plan = await prisma.plan.create({
        data: {
          name,
          price: parseFloat(price),
          interval,
          constraints: constraints || {},
          currency: currency || "USD",
          paypalPlanId,
          active: true,
        },
      });

      return NextResponse.json(plan, { status: 201 });
    }
  } catch (error) {
    console.error("Error creating plan:", error);
    return NextResponse.json(
      { error: "Failed to create plan" },
      { status: 500 }
    );
  }
}
