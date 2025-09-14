import { PlanType } from "@repo/db";

interface CreditLimit {
  keywords: number;
  backlinks: number;
  trackingSites: number;
}

export function getCreditLimit(plan: PlanType): CreditLimit {
  if (plan === "Freelance") {
    return {
      keywords: 150,
      backlinks: 100,
      trackingSites: 20,
    };
  }
  if (plan === "Studio") {
    return {
      keywords: 500,
      backlinks: 300,
      trackingSites: 50,
    };
  }
  if (plan === "Agency") {
    return {
      keywords: 2000,
      backlinks: 1000,
      trackingSites: 500,
    };
  }
  return {
    keywords: 0,
    backlinks: 0,
    trackingSites: 0,
  };
}
