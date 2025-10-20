"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { BarChart3, TrendingUp, Activity, DollarSign } from "lucide-react";

interface DailyBreakdown {
  date: string;
  totalCalls: number;
  totalCreditsUsed: number;
  totalCost: number;
}

interface ServiceUsageData {
  serviceName: string;
  dailyBreakdown?: DailyBreakdown[];
}

interface DailyChartsProps {
  data: ServiceUsageData[];
}

export function DailyCharts({ data }: DailyChartsProps) {
  const [activeChart, setActiveChart] = useState<"calls" | "credits" | "cost">(
    "calls"
  );

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getMaxValue = (type: "calls" | "credits" | "cost") => {
    let max = 0;
    data.forEach((service) => {
      if (service.dailyBreakdown && Array.isArray(service.dailyBreakdown)) {
        service.dailyBreakdown.forEach((day) => {
          if (type === "calls") max = Math.max(max, day.totalCalls);
          if (type === "credits") max = Math.max(max, day.totalCreditsUsed);
          if (type === "cost") max = Math.max(max, day.totalCost);
        });
      }
    });
    return max;
  };

  const getServiceColor = (serviceName: string) => {
    switch (serviceName.toLowerCase()) {
      case "majestic":
        return "bg-blue-500";
      case "dataforseo":
        return "bg-green-500";
      case "semrush":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  const getChartData = () => {
    if (!data || data.length === 0) return [];

    // Get all unique dates
    const allDates = new Set<string>();
    data.forEach((service) => {
      if (service.dailyBreakdown && Array.isArray(service.dailyBreakdown)) {
        service.dailyBreakdown.forEach((day) => {
          allDates.add(day.date);
        });
      }
    });

    const sortedDates = Array.from(allDates).sort();

    return sortedDates.map((date) => {
      const dayData: any = { date };
      data.forEach((service) => {
        const dayBreakdown = service.dailyBreakdown?.find(
          (d) => d.date === date
        );
        if (dayBreakdown) {
          dayData[service.serviceName] = {
            calls: dayBreakdown.totalCalls,
            credits: dayBreakdown.totalCreditsUsed,
            cost: dayBreakdown.totalCost,
          };
        } else {
          dayData[service.serviceName] = {
            calls: 0,
            credits: 0,
            cost: 0,
          };
        }
      });
      return dayData;
    });
  };

  const chartData = getChartData();
  const maxValue = getMaxValue(activeChart);

  if (!data || data.length === 0) {
    return (
      <div className="rounded-[10px] border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-dark dark:text-white mb-2">
            No daily data available
          </h3>
          <p className="text-dark-6 dark:text-dark-5">
            Daily breakdown data will appear here once API usage is recorded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[10px] border border-stroke bg-white p-6 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-dark dark:text-white">
          Daily Usage Trends
        </h3>
        <p className="text-sm text-dark-6 dark:text-dark-5">
          API usage breakdown by service over time
        </p>
      </div>

      {/* Chart Type Selector */}
      <div className="mb-6 flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
        <button
          onClick={() => setActiveChart("calls")}
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            activeChart === "calls"
              ? "bg-white text-primary shadow-sm dark:bg-gray-700 dark:text-white"
              : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          )}
        >
          <Activity className="h-4 w-4" />
          API Calls
        </button>
        <button
          onClick={() => setActiveChart("credits")}
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            activeChart === "credits"
              ? "bg-white text-primary shadow-sm dark:bg-gray-700 dark:text-white"
              : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          )}
        >
          <TrendingUp className="h-4 w-4" />
          Credits Used
        </button>
        <button
          onClick={() => setActiveChart("cost")}
          className={cn(
            "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            activeChart === "cost"
              ? "bg-white text-primary shadow-sm dark:bg-gray-700 dark:text-white"
              : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
          )}
        >
          <DollarSign className="h-4 w-4" />
          Cost
        </button>
      </div>

      {/* Chart */}
      <div className="space-y-4">
        {chartData.map((day, index) => (
          <div key={day.date} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-dark dark:text-white">
                {formatDate(day.date)}
              </span>
              <span className="text-dark-6 dark:text-dark-5">
                {activeChart === "calls" &&
                  formatNumber(
                    data.reduce(
                      (sum, service) =>
                        sum + (day[service.serviceName]?.calls || 0),
                      0
                    )
                  )}
                {activeChart === "credits" &&
                  formatNumber(
                    data.reduce(
                      (sum, service) =>
                        sum + (day[service.serviceName]?.credits || 0),
                      0
                    )
                  )}
                {activeChart === "cost" &&
                  `$${data
                    .reduce(
                      (sum, service) =>
                        sum + (day[service.serviceName]?.cost || 0),
                      0
                    )
                    .toFixed(2)}`}
              </span>
            </div>

            <div className="flex items-end gap-2 h-8">
              {data.map((service, serviceIndex) => {
                const value = day[service.serviceName]?.[activeChart] || 0;
                const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

                return (
                  <div
                    key={`${day.date}-${service.serviceName}-${serviceIndex}`}
                    className={cn(
                      "flex-1 rounded-t transition-all duration-300 hover:opacity-80",
                      getServiceColor(service.serviceName)
                    )}
                    style={{ height: `${Math.max(percentage, 2)}%` }}
                    title={`${service.serviceName}: ${formatNumber(value)}`}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4">
        {data.map((service, index) => (
          <div
            key={`legend-${service.serviceName}-${index}`}
            className="flex items-center gap-2"
          >
            <div
              className={cn(
                "h-3 w-3 rounded",
                getServiceColor(service.serviceName)
              )}
            />
            <span className="text-sm text-dark dark:text-white">
              {service.serviceName}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
