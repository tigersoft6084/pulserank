"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { Check } from "lucide-react";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePlans } from "@/hooks/features/subscription/use-plan";

import { toast } from "@/hooks/use-toast";
import { AxiosInstance } from "@/lib/axios-instance";
import { cn } from "@/lib/utils";

// Skeleton component for loading state
const SubscriptionCardSkeleton = () => (
  <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 h-fit">
    {/* Plan Header Skeleton */}
    <div className="text-center mb-6">
      <Skeleton className="h-6 w-32 mx-auto mb-4" />
      <Skeleton className="h-8 w-24 mx-auto mb-4" />
    </div>

    {/* Features List Skeleton */}
    <div className="mb-8">
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`flex items-start space-x-3 p-2 rounded ${
              i % 2 === 0 ? "bg-gray-50" : "bg-white"
            }`}
          >
            <Skeleton className="w-5 h-5 rounded-full flex-shrink-0" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
    </div>

    {/* Button Skeleton */}
    <div className="flex justify-center">
      <Skeleton className="h-10 w-32" />
    </div>
  </div>
);

export function PlanSection({
  className,
  isLandingPage = false,
}: {
  className?: string;
  isLandingPage?: boolean;
}) {
  const [isAnnual, setIsAnnual] = useState<boolean>(false);
  const { data: plans, isLoading } = usePlans();
  const router = useRouter();

  return (
    <section className={cn(" bg-white", className)} id="price">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl  text-gray-900 mb-6">
            Choose your plan for SEO
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            No matter your budget, we have a plan that fits your needs.
          </p>

          {/* Toggle Button */}
          <div className="flex justify-center items-center">
            <div className="bg-gray-100 rounded-md p-1 flex items-center">
              <Button
                variant={isAnnual ? "ghost" : "outline"}
                onClick={() => setIsAnnual(false)}
              >
                Monthly
              </Button>
              <Button
                variant={isAnnual ? "outline" : "ghost"}
                onClick={() => setIsAnnual(true)}
              >
                Annual (2 months free)
              </Button>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
          {isLoading ? (
            // Show skeleton loading state
            <>
              <SubscriptionCardSkeleton />
              <SubscriptionCardSkeleton />
              <SubscriptionCardSkeleton />
            </>
          ) : (
            <PayPalScriptProvider
              options={{
                clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
                vault: true,
                intent: "subscription",
              }}
            >
              {plans
                ?.filter(
                  (plan) => plan.interval === (isAnnual ? "YEAR" : "MONTH"),
                )
                .map((plan, index) => {
                  return (
                    <div
                      key={index}
                      className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 h-fit"
                    >
                      {/* Plan Header */}
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                          {plan.name}
                        </h3>

                        {/* Pricing */}
                        <div className="mb-4">
                          <p className="text-3xl font-bold text-gray-900">
                            {plan.price}$ /{plan.interval.toLowerCase()}
                          </p>
                        </div>
                      </div>

                      {/* Features List */}
                      <div className="mb-8">
                        <ul className="space-y-3">
                          {plan.features.map((feature, featureIndex) => (
                            <li
                              key={featureIndex}
                              className={`flex items-start space-x-3 p-2 rounded ${
                                featureIndex % 2 === 0
                                  ? "bg-gray-50"
                                  : "bg-white"
                              }`}
                            >
                              <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">
                                {feature}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Call-to-Action Button */}
                      <div className="flex justify-center">
                        {/** If index is 3, show contact us button with mail icon, else show paypal buttons */}
                        {isLandingPage ? (
                          <Button
                            onClick={() => router.push("/user_orders/billing")}
                          >
                            <Check className="w-4 h-4" />
                            Start immediately
                          </Button>
                        ) : (
                          <PayPalButtons
                            disabled={isLoading}
                            fundingSource="paypal"
                            style={{
                              layout: "vertical",
                              color: "black",
                              shape: "rect",
                              height: 40,
                              label: "paypal",
                            }}
                            createSubscription={async () => {
                              const res = await AxiosInstance.post(
                                "/api/paypal/create-subscription",
                                {
                                  planId: plan.id,
                                },
                              );

                              return res.data.id; // PayPal subscription ID
                            }}
                            onApprove={async (data, actions) => {
                              try {
                                const subscriptionDetails =
                                  await actions.subscription?.get();
                                const nextBillingTime =
                                  subscriptionDetails?.billing_info
                                    ?.next_billing_time;

                                const res = await AxiosInstance.patch(
                                  "/api/paypal/create-subscription",
                                  {
                                    subscriptionId: data.subscriptionID,
                                    nextBillingTime,
                                  },
                                );
                                if (res.status === 200) {
                                  toast({
                                    title: "Success",
                                    description:
                                      "Subscription created successfully",
                                  });
                                  router.push("/dashboard");
                                } else {
                                  throw new Error(
                                    "Failed to create subscription",
                                  );
                                }
                              } catch (error) {
                                console.error("Error:", error);
                                toast({
                                  title: "Error",
                                  description: "Failed to create subscription",
                                  variant: "destructive",
                                });
                              }
                            }}
                            onError={(err) => {
                              console.error("PayPal error:", err);
                              toast({
                                title: "Error",
                                description: "Failed to create subscription",
                                variant: "destructive",
                              });
                              // You can show a toast, set an error state, etc.
                            }}
                          />
                        )}
                      </div>
                    </div>
                  );
                })}
            </PayPalScriptProvider>
          )}
        </div>
      </div>
    </section>
  );
}
