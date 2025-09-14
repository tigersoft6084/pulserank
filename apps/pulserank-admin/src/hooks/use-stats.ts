import { useQuery } from "@tanstack/react-query";

export interface StatItem {
  value: number;
  growth: number;
  isPositive: boolean;
}

export interface Stats {
  totalSubscribers: StatItem;
  activeSubscriptions: StatItem;
  monthlyRevenue: StatItem;
  activeServices: StatItem;
}

const fetchStats = async (): Promise<Stats> => {
  const response = await fetch("/api/stats");
  if (!response.ok) {
    throw new Error("Failed to fetch stats");
  }
  return response.json();
};

export const useStats = () => {
  return useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
    refetchInterval: 300000, // Refetch every 5 minutes
  });
};
