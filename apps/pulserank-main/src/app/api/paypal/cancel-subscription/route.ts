import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@repo/db";
import {
  paypalService,
  SubscriptionDetails,
} from "@/lib/services/paypal.service";
import { UserOrder } from "@repo/db";

interface CancelPlanRequest {
  reason?: string;
}

interface CancelPlanResponse {
  success: boolean;
  userOrder: UserOrder;
  subscriptionDetails?: SubscriptionDetails;
  message: string;
}

/**
 * Get the active subscription for a user
 */
async function getActiveSubscription(userId: string) {
  const currentOrder = await prisma.userOrder.findFirst({
    where: {
      userId,
      status: "ACTIVE",
    },
  });

  if (!currentOrder?.paypalSubscriptionId) {
    throw new Error("No active subscription found");
  }

  return currentOrder;
}

/**
 * Cancel the PayPal subscription
 */
async function cancelPayPalSubscription(
  subscriptionId: string,
  reason: string
) {
  try {
    const result = await paypalService.cancelSubscription(
      subscriptionId,
      reason
    );
    return result;
  } catch (error) {
    console.error("Failed to cancel PayPal subscription:", error);
    // Continue with local cancellation even if PayPal fails
    return null;
  }
}

/**
 * Update the user order status to cancelled
 */
async function updateUserOrderStatus(orderId: string) {
  return await prisma.userOrder.update({
    where: { id: orderId },
    data: {
      status: "CANCELLED",
      updatedAt: new Date(),
    },
  });
}

/**
 * Get updated subscription details from PayPal
 */
async function getUpdatedSubscriptionDetails(subscriptionId: string) {
  try {
    const subscriptionDetails =
      await paypalService.getSubscriptionDetails(subscriptionId);
    return subscriptionDetails;
  } catch (error) {
    console.error("Failed to get updated subscription details:", error);
    return null;
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: CancelPlanRequest = await req.json();
    const { reason = "User requested cancellation" } = body;

    // Get active subscription
    const currentOrder = await getActiveSubscription(session.user.id);

    // Cancel PayPal subscription
    await cancelPayPalSubscription(currentOrder.paypalSubscriptionId, reason);

    // Get updated subscription details
    const subscriptionDetails = await getUpdatedSubscriptionDetails(
      currentOrder.paypalSubscriptionId
    );

    // Update local database
    const cancelledOrder = await updateUserOrderStatus(currentOrder.id);

    const response: CancelPlanResponse = {
      success: true,
      userOrder: cancelledOrder,
      message: "Plan cancelled successfully",
    };

    if (subscriptionDetails) {
      response.subscriptionDetails = subscriptionDetails;
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error cancelling plan:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to cancel plan";
    const statusCode =
      error instanceof Error && error.message === "No active subscription found"
        ? 400
        : 500;

    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
