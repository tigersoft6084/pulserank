"use client";

import { AuthTitle } from "@/components/layout/header/auth-title";
import { PlanSection } from "@/components/features/subscription/plan-section";

export default function SubscriptionPage() {
  return (
    <div className="h-screen relative">
      <AuthTitle />
      <PlanSection />
    </div>
  );
}
