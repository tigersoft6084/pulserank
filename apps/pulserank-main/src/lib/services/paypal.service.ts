import { getAccessToken, getSubscriptionDetails } from "@/lib/utils/paypal";

export interface CreateSubscriptionRequest {
  planId: string;
  paypalPlanId: string;
  returnUrl?: string;
  cancelUrl?: string;
  brandName?: string;
}

export interface CreateSubscriptionResponse {
  id: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

export interface UpdateSubscriptionRequest {
  subscriptionId: string;
  paypalPlanId: string;
  returnUrl?: string;
  cancelUrl?: string;
  brandName?: string;
}

export interface UpdateSubscriptionResponse {
  id: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

export interface SubscriptionDetails {
  id: string;
  status: string;
  billing_info: {
    next_billing_time: string;
    cycle_executions: Array<{
      tenure_type: string;
      sequence: number;
      cycles_completed: number;
      cycles_remaining: number;
      current_pricing_scheme_version_id: string;
    }>;
  };
  plan_id: string;
  start_time: string;
  quantity: string;
  shipping_amount: {
    currency_code: string;
    value: string;
  };
  subscriber: {
    name: {
      given_name: string;
      surname: string;
    };
    email_address: string;
    payer_id: string;
  };
  application_context: {
    brand_name: string;
    locale: string;
    shipping_preference: string;
    user_action: string;
    payment_method: {
      payer_selected: string;
      payee_preferred: string;
    };
    return_url: string;
    cancel_url: string;
  };
}

export class PayPalService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.PAYPAL_API || "https://api-m.paypal.com";
  }

  /**
   * Create a new PayPal subscription
   */
  async createSubscription(
    request: CreateSubscriptionRequest,
  ): Promise<CreateSubscriptionResponse> {
    try {
      const accessToken = await getAccessToken();

      const response = await fetch(`${this.baseUrl}/v1/billing/subscriptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          plan_id: request.paypalPlanId,
          application_context: {
            brand_name: request.brandName || "MySaaS",
            user_action: "SUBSCRIBE_NOW",
            return_url: request.returnUrl || "https://yourdomain.com/success",
            cancel_url: request.cancelUrl || "https://yourdomain.com/cancel",
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `PayPal API error: ${response.status} - ${JSON.stringify(errorData)}`,
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error creating PayPal subscription:", error);
      throw error;
    }
  }

  /**
   * Update an existing PayPal subscription with a new plan
   */
  async updateSubscription(
    request: UpdateSubscriptionRequest,
  ): Promise<UpdateSubscriptionResponse> {
    try {
      const accessToken = await getAccessToken();

      const response = await fetch(
        `${this.baseUrl}/v1/billing/subscriptions/${request.subscriptionId}/revise`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            plan_id: request.paypalPlanId,
            application_context: {
              brand_name: request.brandName || "Your App",
              locale: "en-US",
              return_url: request.returnUrl || "https://yourdomain.com/success",
              cancel_url: request.cancelUrl || "https://yourdomain.com/cancel",
              user_action: "SUBSCRIBE_NOW",
            },
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `PayPal API error: ${response.status} - ${JSON.stringify(errorData)}`,
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error updating PayPal subscription:", error);
      throw error;
    }
  }

  /**
   * Get subscription details from PayPal
   */
  async getSubscriptionDetails(
    subscriptionId: string,
  ): Promise<SubscriptionDetails> {
    try {
      return await getSubscriptionDetails(subscriptionId);
    } catch (error) {
      console.error("Error getting subscription details:", error);
      throw error;
    }
  }

  /**
   * Validate if a subscription ID exists and is valid
   */
  async validateSubscription(subscriptionId: string): Promise<boolean> {
    try {
      await this.getSubscriptionDetails(subscriptionId);
      return true;
    } catch (error) {
      console.error("Subscription validation failed:", error);
      return false;
    }
  }

  /**
   * Cancel a PayPal subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    reason: string = "User requested cancellation",
  ) {
    try {
      const accessToken = await getAccessToken();

      // First, get the current subscription details to check its status
      const subscriptionDetails =
        await this.getSubscriptionDetails(subscriptionId);

      // Only cancel if the subscription is active
      if (subscriptionDetails.status !== "ACTIVE") {
        return {
          status: subscriptionDetails.status,
          message: "Subscription already inactive",
        };
      }

      const response = await fetch(
        `${this.baseUrl}/v1/billing/subscriptions/${subscriptionId}/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            reason: reason,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `PayPal cancellation error: ${response.status} - ${JSON.stringify(errorData)}`,
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      throw error;
    }
  }
}

// Export a singleton instance
export const paypalService = new PayPalService();
