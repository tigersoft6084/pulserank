"use client";

import { NextStep } from "nextstepjs";
import { useTranslations } from "next-intl";
import { createDashboardTourSteps } from "@/tour/dashboard";

export function DashboardTourProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("dashboard.tour");
  const steps = createDashboardTourSteps(t);

  return <NextStep steps={steps}>{children}</NextStep>;
}
