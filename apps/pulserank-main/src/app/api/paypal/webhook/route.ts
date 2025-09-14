import { NextResponse } from "next/server";
import { prisma } from "@repo/db";

export async function POST(req: Request) {
  try {
    const webhookEvent = await req.json();

    const eventType = webhookEvent.event_type;
    const resource = webhookEvent.resource;

    // check starts with BILLING.SUBSCRIPTION or PAYMENT.SALE
    const paypalSubscriptionId = eventType.startsWith("BILLING.SUBSCRIPTION")
      ? resource.id || ""
      : resource.billing_agreement_id || "";

    const status = resource.status || "";

    const subscription = await prisma.userOrder.findUnique({
      where: { paypalSubscriptionId },
      include: {
        plan: true,
      },
    });
    if (!subscription) {
      console.warn("Subscription not found for webhook:", paypalSubscriptionId);
    } else {
      switch (eventType) {
        case "BILLING.SUBSCRIPTION.CREATED":
          await prisma.userOrder.update({
            where: { paypalSubscriptionId },
            data: {
              status: status,
              updatedAt: new Date(),
            },
          });
          break;
        case "BILLING.SUBSCRIPTION.ACTIVATED":
          await prisma.userOrder.update({
            where: { paypalSubscriptionId },
            data: {
              status: status,
              currentPeriodEnd: resource?.billing_info?.next_billing_time,
              updatedAt: new Date(),
            },
          });
          break;
        case "BILLING.SUBSCRIPTION.UPDATED":
          if (subscription.plan.paypalPlanId !== resource.plan_id) {
            const newPlan = await prisma.plan.findUnique({
              where: {
                paypalPlanId: resource.plan_id,
              },
            });
            await prisma.userOrder.update({
              where: { paypalSubscriptionId },
              data: {
                planId: newPlan?.paypalPlanId,
                updatedAt: new Date(),
              },
            });
          }

          break;
        case "BILLING.SUBSCRIPTION.SUSPENDED":
          await prisma.userOrder.update({
            where: { paypalSubscriptionId },
            data: {
              status: status,
              updatedAt: new Date(),
            },
          });
          break;
        case "BILLING.SUBSCRIPTION.CANCELLED":
          await prisma.userOrder.update({
            where: { paypalSubscriptionId },
            data: {
              status: status,
              updatedAt: new Date(),
            },
          });
          break;
        case "PAYMENT.SALE.COMPLETED":
          await prisma.billingHistory.create({
            data: {
              subscriptionId: subscription.id,
              amount: parseFloat(resource.amount?.total || "0"),
              transactionId: resource.id,
              eventType: eventType,
              currency: resource.amount?.currency,
              paidAt: new Date(resource.create_time),
              data: resource,
            },
          });
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("Webhook error:", err);

    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
