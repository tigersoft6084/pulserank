"use client";

import { CurrentPlanCard } from "@/components/features/billing/current-plan-card";
import { CurrentPlanCardSkeleton } from "@/components/features/billing/current-plan-card-skeleton";
import { BillingHistoryTable } from "@/components/features/billing/billing-history-table";
import { useSubscriptions } from "@/hooks/features/subscription/use-subscription";
import { BillingHistoryTableSkeleton } from "@/components/features/billing/billing-history-table-skeleton";

export default function BillingManagementPage() {
  const { data: subscription, isLoading } = useSubscriptions();
  if (isLoading) {
    return (
      <div className="space-y-6">
        <CurrentPlanCardSkeleton />
        <BillingHistoryTableSkeleton />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <CurrentPlanCard subscription={subscription} />
      <BillingHistoryTable billingHistory={subscription?.logs} />
    </div>
  );
}
