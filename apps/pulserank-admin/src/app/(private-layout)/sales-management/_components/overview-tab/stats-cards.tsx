"use client";

import { ArrowUpIcon, ArrowDownIcon } from "@/assets/icons";
import { cn } from "@/lib/utils";
import { useStats } from "@/hooks/use-stats";

export function StatsCards() {
  const { data: statsData, isLoading: statsLoading } = useStats();

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(price);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const statsConfig = [
    {
      label: "Total Subscribers",
      value: statsData?.totalSubscribers.value || 0,
      growth: statsData?.totalSubscribers.growth || 0,
      isPositive: statsData?.totalSubscribers.isPositive ?? true,
      formatter: formatNumber,
    },
    {
      label: "Active Subscriptions",
      value: statsData?.activeSubscriptions.value || 0,
      growth: statsData?.activeSubscriptions.growth || 0,
      isPositive: statsData?.activeSubscriptions.isPositive ?? true,
      formatter: formatNumber,
    },
    {
      label: "Monthly Revenue",
      value: statsData?.monthlyRevenue.value || 0,
      growth: statsData?.monthlyRevenue.growth || 0,
      isPositive: statsData?.monthlyRevenue.isPositive ?? true,
      formatter: (value: number) => formatPrice(value, "USD"),
    },
    {
      label: "Active Services",
      value: statsData?.activeServices.value || 0,
      growth: statsData?.activeServices.growth || 0,
      isPositive: statsData?.activeServices.isPositive ?? true,
      formatter: formatNumber,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {statsConfig.map((stat, index) => (
        <div
          key={index}
          className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card"
        >
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-medium text-dark-6 dark:text-dark-5">
                {stat.label}
              </p>
              <div className="mt-2 text-2xl font-bold text-dark dark:text-white">
                {statsLoading ? (
                  <div className="h-8 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                ) : (
                  stat.formatter(stat.value)
                )}
              </div>
            </div>
            {!statsLoading && (
              <div
                className={cn(
                  "flex items-center gap-1 text-sm font-medium",
                  stat.isPositive ? "text-green" : "text-red",
                )}
              >
                {stat.growth > 0 ? "+" : ""}
                {stat.growth.toFixed(1)}%
                {stat.isPositive ? (
                  <ArrowUpIcon className="size-4" />
                ) : (
                  <ArrowDownIcon className="size-4" />
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
