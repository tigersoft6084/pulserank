// app/api/paypal/create-plan/route.ts
import { NextResponse } from "next/server";
import axios from "axios";
import { getAccessToken } from "@/lib/utils/paypal";

export async function POST(req: Request) {
  const body = await req.json();
  const { amount, interval_unit, name } = body;

  try {
    // 1. Get access token

    const accessToken = await getAccessToken();
    // 2. Create product
    // const productRes = await axios.post(
    //   `${process.env.PAYPAL_API}/v1/catalogs/products`,
    //   {
    //     name: `${name} Plan`,
    //     type: "SERVICE",
    //     category: "SOFTWARE",
    //   },
    //   {
    //     headers: {
    //       Authorization: `Bearer ${accessToken}`,
    //       "Content-Type": "application/json",
    //     },
    //   }
    // );

    // const productId = productRes.data.id;

    // 3. Create billing plan
    const planRes = await axios.post(
      `${process.env.PAYPAL_API}/v1/billing/plans`,
      {
        product_id: process.env.PAYPAL_PRODUCT_ID,
        name: `${name} ${interval_unit === "MONTH" ? "Monthly" : "Yearly"} Plan`,
        billing_cycles: [
          {
            frequency: {
              interval_unit: interval_unit,
              interval_count: 1,
            },
            tenure_type: "REGULAR",
            sequence: 1,
            total_cycles: 0,
            pricing_scheme: {
              fixed_price: {
                value: amount,
                currency_code: "USD",
              },
            },
          },
        ],
        payment_preferences: {
          auto_bill_outstanding: true,
          setup_fee_failure_action: "CONTINUE",
          payment_failure_threshold: 3,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      },
    );

    const planId = planRes.data.id;

    return NextResponse.json({ planId }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
    } else if (axios.isAxiosError(error)) {
      console.error(error.response?.data);
    } else {
      console.error("An unknown error occurred");
    }
    return NextResponse.json(
      { error: "Failed to create plan" },
      { status: 500 },
    );
  }
}
