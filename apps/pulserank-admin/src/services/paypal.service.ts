interface PayPalConfig {
  clientId: string;
  clientSecret: string;
  environment: "sandbox" | "live";
  productId: string;
}

interface DeactivatePlanResponse {
  success: boolean;
  message: string;
  planId?: string;
}

class PayPalService {
  private config: PayPalConfig;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.config = {
      clientId: process.env.PAYPAL_CLIENT_ID || "",
      clientSecret: process.env.PAYPAL_CLIENT_SECRET || "",
      productId: process.env.PAYPAL_PRODUCT_ID || "",
      environment:
        (process.env.PAYPAL_ENVIRONMENT as "sandbox" | "live") || "sandbox",
    };

    // Validate configuration
    if (!this.config.clientId || !this.config.clientSecret) {
      console.warn(
        "PayPal credentials not configured. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET environment variables.",
      );
    }
    if (!this.config.productId) {
      console.warn(
        "PayPal product ID not configured. Set PAYPAL_PRODUCT_ID environment variable.",
      );
    }
  }

  private getBaseUrl(): string {
    return this.config.environment === "live"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";
  }

  private async getAccessToken(): Promise<string> {
    // Check if credentials are configured
    if (!this.config.clientId || !this.config.clientSecret) {
      throw new Error("PayPal credentials not configured");
    }

    // Check if we have a valid token
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }

    const auth = Buffer.from(
      `${this.config.clientId}:${this.config.clientSecret}`,
    ).toString("base64");

    try {
      const response = await fetch(`${this.getBaseUrl()}/v1/oauth2/token`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to get PayPal access token: ${response.status} ${response.statusText} - ${errorText}`,
        );
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = Date.now() + data.expires_in * 1000 - 60000; // Expire 1 minute early

      return this.accessToken!;
    } catch (error) {
      console.error("Error getting PayPal access token:", error);
      throw new Error("Failed to authenticate with PayPal");
    }
  }

  async deactivatePlan(paypalPlanId: string): Promise<DeactivatePlanResponse> {
    try {
      // Validate input
      if (!paypalPlanId) {
        return {
          success: false,
          message: "PayPal plan ID is required",
        };
      }

      const accessToken = await this.getAccessToken();

      // First, get the plan details to check its current status
      const getPlanResponse = await fetch(
        `${this.getBaseUrl()}/v1/billing/plans/${paypalPlanId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!getPlanResponse.ok) {
        if (getPlanResponse.status === 404) {
          return {
            success: false,
            message: `PayPal plan not found: ${paypalPlanId}`,
            planId: paypalPlanId,
          };
        }
        throw new Error(
          `Failed to get plan details: ${getPlanResponse.statusText}`,
        );
      }

      const planDetails = await getPlanResponse.json();

      // If plan is already inactive, return success
      if (planDetails.status === "INACTIVE") {
        return {
          success: true,
          message: "Plan is already inactive",
          planId: paypalPlanId,
        };
      }

      // Deactivate the plan
      const deactivateResponse = await fetch(
        `${this.getBaseUrl()}/v1/billing/plans/${paypalPlanId}/deactivate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!deactivateResponse.ok) {
        const errorData = await deactivateResponse.json().catch(() => ({}));
        throw new Error(
          `Failed to deactivate plan: ${errorData.message || deactivateResponse.statusText}`,
        );
      }

      return {
        success: true,
        message: "Plan deactivated successfully",
        planId: paypalPlanId,
      };
    } catch (error) {
      console.error("Error deactivating PayPal plan:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to deactivate plan",
        planId: paypalPlanId,
      };
    }
  }

  async createPlan(planData: {
    name: string;
    price: number;
    currency: string;
    interval: string;
  }): Promise<{ success: boolean; planId?: string; message: string }> {
    try {
      // Validate input
      if (
        !planData.name ||
        !planData.price ||
        !planData.currency ||
        !planData.interval
      ) {
        return {
          success: false,
          message:
            "Missing required plan data: name, price, currency, and interval are required",
        };
      }

      if (planData.price <= 0) {
        return {
          success: false,
          message: "Plan price must be greater than 0",
        };
      }

      const accessToken = await this.getAccessToken();

      // Create billing plan
      const billingCycle = planData.interval === "YEAR" ? "YEAR" : "MONTH";
      const planResponse = await fetch(
        `${this.getBaseUrl()}/v1/billing/plans`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            product_id: this.config.productId,
            name: planData.name,
            status: "ACTIVE",
            billing_cycles: [
              {
                frequency: {
                  interval_unit: billingCycle,
                  interval_count: 1,
                },
                tenure_type: "REGULAR",
                sequence: 1,
                total_cycles: 0,
                pricing_scheme: {
                  fixed_price: {
                    value: planData.price.toString(),
                    currency_code: planData.currency,
                  },
                },
              },
            ],
            payment_preferences: {
              auto_bill_outstanding: true,
              setup_fee: {
                value: "0",
                currency_code: planData.currency,
              },
              setup_fee_failure_action: "CONTINUE",
              payment_failure_threshold: 3,
            },
          }),
        },
      );

      if (!planResponse.ok) {
        const errorData = await planResponse.json().catch(() => ({}));
        throw new Error(
          `Failed to create PayPal plan: ${errorData.message || planResponse.statusText}`,
        );
      }

      const createdPlanData = await planResponse.json();

      return {
        success: true,
        planId: createdPlanData.id,
        message: "Plan created successfully",
      };
    } catch (error) {
      console.error("Error creating PayPal plan:", error);
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to create plan",
      };
    }
  }

  // Method to check if PayPal is properly configured
  isConfigured(): boolean {
    return !!(this.config.clientId && this.config.clientSecret);
  }
}

export const paypalService = new PayPalService();
