"use client";

import { AuthTitle } from "@/components/layout/header/auth-title";
import { PlanSection } from "@/components/features/subscription/plan-section";

export default function SubscriptionPage() {
  return (
    <div className="flex h-screen justify-center items-center relative">
      <div className="absolute top-4 left-4">
        <AuthTitle />
      </div>
      <PlanSection />
    </div>
  );
}
