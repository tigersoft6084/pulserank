import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/auth";
import { paypalService } from "@/lib/services/paypal.service";
import { prisma } from "@repo/db";

/**
 * PATCH - Approve subscription and update user order status
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getUser();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { subscriptionId, nextBillingTime } = body;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Subscription ID is required" },
        { status: 400 }
      );
    }

    // Validate subscription with PayPal
    const isValidSubscription =
      await paypalService.validateSubscription(subscriptionId);
    if (!isValidSubscription) {
      return NextResponse.json(
        { error: "Invalid subscription ID" },
        { status: 400 }
      );
    }

    // Find and update user order
    const userOrder = await prisma.userOrder.findFirst({
      where: {
        userId: session.user.id,
        paypalSubscriptionId: subscriptionId,
      },
    });

    if (!userOrder) {
      return NextResponse.json(
        { error: "User order not found" },
        { status: 404 }
      );
    }

    // Update user order status to active
    await prisma.userOrder.update({
      where: { id: userOrder.id },
      data: {
        status: "ACTIVE",
        currentPeriodEnd: nextBillingTime ? new Date(nextBillingTime) : null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Subscription approved successfully",
    });
  } catch (error) {
    console.error("Error approving subscription:", error);
    return NextResponse.json(
      { error: "Failed to approve subscription" },
      { status: 500 }
    );
  }
}

/**
 * POST - Create new subscription
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getUser();
    console.log("🔍 Session:", session);
    console.log("🔍 User ID:", session?.user?.id);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user exists in database
    const userExists = await prisma.user.findUnique({
      where: { id: session.user.id },
    });
    console.log("🔍 User exists:", userExists);

    if (!userExists) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { planId } = body;

    // Validate plan exists
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Create PayPal subscription
    const paypalSubscription = await paypalService.createSubscription({
      planId: plan.id,
      paypalPlanId: plan.paypalPlanId,
    });

    // Handle user order creation/update
    const existingOrder = await prisma.userOrder.findFirst({
      where: { userId: session.user.id },
    });

    if (existingOrder) {
      // Update existing order
      await prisma.userOrder.update({
        where: { id: existingOrder.id },
        data: {
          paypalSubscriptionId: paypalSubscription.id,
          planId: plan.id,
          status: "APPROVAL_PENDING",
          updatedAt: new Date(),
        },
      });
    } else {
      // Create new order
      await prisma.userOrder.create({
        data: {
          userId: session.user.id,
          planId: plan.id,
          paypalSubscriptionId: paypalSubscription.id,
          status: "APPROVAL_PENDING",
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Subscription created successfully",
        id: paypalSubscription.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 }
    );
  }
}
