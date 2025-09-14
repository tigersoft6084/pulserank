import axios from "axios";

export async function getAccessToken() {
  const auth = Buffer.from(
    `${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`,
  ).toString("base64");
  const tokenRes = await axios.post(
    `${process.env.PAYPAL_API}/v1/oauth2/token`,
    "grant_type=client_credentials",
    {
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );

  return tokenRes.data.access_token;
}

export async function getSubscriptionDetails(subscriptionId: string) {
  const accessToken = await getAccessToken();

  const response = await axios.get(
    `${process.env.PAYPAL_API}/v1/billing/subscriptions/${subscriptionId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  );

  return response.data;
}

export async function getPlanDetails(planId: string) {
  const accessToken = await getAccessToken();

  const response = await axios.get(
    `${process.env.PAYPAL_API}/v1/billing/plans/${planId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    },
  );

  return response.data;
}

export function extractPlanNameFromPayPalPlan(
  planName: string,
): "Freelance" | "Studio" | "Agency" {
  // Clean up plan name (remove "Monthly" or "Yearly" suffix)
  const cleanName = planName.replace(/\s+(Monthly|Yearly)\s+Plan$/, "");

  // Map to our PlanType enum values
  if (cleanName.includes("Freelance")) return "Freelance";
  if (cleanName.includes("Studio")) return "Studio";
  if (cleanName.includes("Agency")) return "Agency";

  // Fallback to Freelance if no match
  return "Freelance";
}

export async function cancelSubscription(
  subscriptionId: string,
  reason: string,
) {
  console.log("Cancelling subscription:", subscriptionId, reason);
  try {
    const accessToken = await getAccessToken();

    // First, get the current subscription details to check its status
    const subscriptionDetails = await getSubscriptionDetails(subscriptionId);
    console.log("Current subscription status:", subscriptionDetails.status);

    // Only cancel if the subscription is active
    if (subscriptionDetails.status !== "ACTIVE") {
      console.log(
        `Subscription is not active (status: ${subscriptionDetails.status}), skipping cancellation`,
      );
      return {
        status: subscriptionDetails.status,
        message: "Subscription already inactive",
      };
    }

    const response = await axios.post(
      `${process.env.PAYPAL_API}/v1/billing/subscriptions/${subscriptionId}/cancel`,
      {
        reason: reason,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    console.log("PayPal cancellation successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    if (axios.isAxiosError(error) && error.response) {
      console.error("PayPal API Error Details:", {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      });
    }
    throw error; // Re-throw to handle in the calling function
  }
}
