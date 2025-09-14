import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@repo/db";
import { paypalService } from "@/lib/services/paypal.service";

/**
 * Update plan for a user order (PATCH method)
 * Used for simple plan updates without PayPal interaction
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { paypalSubscriptionId, planId } = await req.json();

    await prisma.userOrder.update({
      where: {
        userId: session.user.id,
        paypalSubscriptionId,
      },
      data: {
        planId: planId,
        status: "ACTIVE",
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Plan updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating plan:", error);
    return NextResponse.json(
      { error: "Failed to update plan" },
      { status: 500 }
    );
  }
}

/**
 * Update subscription plan with PayPal integration (PUT method)
 * Handles the complete flow of updating a PayPal subscription
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Validate plan exists
    const plan = await validatePlan(body.planId);
    if (!plan) {
      return NextResponse.json(
        { error: "Plan ID is required" },
        { status: 400 }
      );
    }

    // Get current active subscription
    const currentOrder = await getCurrentActiveOrder(session.user.id);
    if (!currentOrder?.paypalSubscriptionId) {
      return NextResponse.json(
        { error: "Your current subscription is cancelled" },
        { status: 400 }
      );
    }

    // Update PayPal subscription
    const updateResponse = await updatePayPalSubscription(
      currentOrder.paypalSubscriptionId,
      plan.paypalPlanId,
      plan.id
    );

    return NextResponse.json(
      {
        success: true,
        userOrder: {},
        approveLink: updateResponse.approveLink,
        subscriptionDetails: {},
        message: "Plan updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating plan:", error);
    return NextResponse.json(
      { error: "Failed to update plan" },
      { status: 500 }
    );
  }
}

/**
 * Validate that a plan exists in the database
 */
async function validatePlan(planId: string) {
  return await prisma.plan.findUnique({
    where: { id: planId },
  });
}

/**
 * Get the current active order for a user
 */
async function getCurrentActiveOrder(userId: string) {
  return await prisma.userOrder.findFirst({
    where: {
      userId,
      status: {
        not: "CANCELLED",
      },
    },
  });
}

/**
 * Update PayPal subscription with new plan
 */
async function updatePayPalSubscription(
  subscriptionId: string,
  paypalPlanId: string,
  planId: string
) {
  const returnUrl = `${process.env.NEXTAUTH_URL}/user_orders/billing?success=true&plan_id=${planId}&subscription_id=${subscriptionId}`;
  const cancelUrl = `${process.env.NEXTAUTH_URL}/user_orders/billing?success=false`;

  const response = await paypalService.updateSubscription({
    subscriptionId,
    paypalPlanId,
    returnUrl,
    cancelUrl,
    brandName: "Your App",
  });

  const approveLink = response.links.find(
    (link: { rel: string }) => link.rel === "approve"
  )?.href;

  return {
    ...response,
    approveLink,
  };
}
