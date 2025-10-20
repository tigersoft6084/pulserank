"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui-elements/button";
import { cn } from "@/lib/utils";
import {
  Activity,
  TrendingUp,
  Clock,
  Database,
  Zap,
  Server,
  BarChart3,
  RefreshCw,
  Users,
} from "lucide-react";
import { UserApiUsage } from "./_components/user-api-usage";
import { DailyCharts } from "./_components/daily-charts";
import { CreditInsights } from "./_components/credit-insights";

interface ApiUsageData {
  serviceName: string;
  totalCalls: number;
  averageResponseTime: number;
  cacheHits: number;
  cacheMisses: number;
  errors: number;
  uniqueUsers: number;
  endpoints: string[];
  hitRate: number;
  errorRate: number;
  // Service-specific credit data
  majesticCredits?: {
    indexItemResUnits: number;
    retrievalResUnits: number;
    analysisResUnits: number;
  };
  dataforseoCredits?: {
    balanceUsed: number;
  };
  semrushCredits?: {
    apiUnitsUsed: number;
  };
}

interface ApiUsageResponse {
  success: boolean;
  data: ApiUsageData[];
  timeframe: string;
  groupBy: string;
  summary: {
    totalCalls: number;
    totalUsers: number;
    activeUsers: number;
    services: number;
    averageResponseTime: number;
    cacheHitRate: number;
    errorRate: number;
  };
}

export default function ApiUsagePage() {
  const [timeframe, setTimeframe] = useState("7d");
  const [activeTab, setActiveTab] = useState<"service" | "user">("service");
  const [data, setData] = useState<ApiUsageResponse | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/api-usage-enhanced?timeframe=${timeframe}&groupBy=service`
      );
      const result = await response.json();

      if (result.success && result.data) {
        setData(result);
      } else {
        console.error("API returned error:", result.error || "Unknown error");
        setData(null);
      }
    } catch (error) {
      console.error("Error fetching API usage data:", error);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const response = await fetch(
        `/api/api-usage-enhanced?timeframe=${timeframe}&groupBy=user`
      );
      const result = await response.json();
      setUserData(result);
    } catch (error) {
      console.error("Error fetching user API usage data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchUserData();
  }, [timeframe]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num);
  };

  const formatDuration = (ms: number) => {
    if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
    return `${ms.toFixed(0)}ms`;
  };

  const getServiceIcon = (serviceName: string) => {
    switch (serviceName.toLowerCase()) {
      case "majestic":
        return Database;
      case "dataforseo":
        return Server;
      case "semrush":
        return BarChart3;
      default:
        return Activity;
    }
  };

  const getServiceColor = (serviceName: string) => {
    switch (serviceName.toLowerCase()) {
      case "majestic":
        return "text-blue-600 dark:text-blue-400";
      case "dataforseo":
        return "text-green-600 dark:text-green-400";
      case "semrush":
        return "text-orange-600 dark:text-orange-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getServiceBgColor = (serviceName: string) => {
    switch (serviceName.toLowerCase()) {
      case "majestic":
        return "bg-blue-100 dark:bg-blue-900/20";
      case "dataforseo":
        return "bg-green-100 dark:bg-green-900/20";
      case "semrush":
        return "bg-orange-100 dark:bg-orange-900/20";
      default:
        return "bg-gray-100 dark:bg-gray-900/20";
    }
  };

  const statsConfig = [
    {
      label: "Total API Calls",
      value: data?.summary?.totalCalls || 0,
      formatter: formatNumber,
      icon: Zap,
      color: "text-primary",
      description: "All API requests across services",
    },
    {
      label: "Active Users",
      value: data?.summary?.activeUsers || 0,
      formatter: formatNumber,
      icon: Users,
      color: "text-green-600 dark:text-green-400",
      description: "Users with active subscriptions",
    },
    {
      label: "Cache Hit Rate",
      value: data?.summary?.cacheHitRate || 0,
      formatter: (value: number) => `${(value * 100).toFixed(1)}%`,
      icon: Activity,
      color: "text-blue-600 dark:text-blue-400",
      description: "Percentage of cached responses",
    },
    {
      label: "Error Rate",
      value: data?.summary?.errorRate || 0,
      formatter: (value: number) => `${(value * 100).toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-red-600 dark:text-red-400",
      description: "Percentage of failed requests",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-dark dark:text-white">
            API Usage Analytics
          </h3>
          <p className="text-sm text-dark-6 dark:text-dark-5">
            Monitor API usage across third-party services and track performance
            metrics
          </p>
        </div>
      </div>

      {/* Filters and Tabs */}
      <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {/* Tab Navigation */}
            <div className="flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
              <button
                onClick={() => setActiveTab("service")}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  activeTab === "service"
                    ? "bg-white text-primary shadow-sm dark:bg-gray-700 dark:text-white"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                )}
              >
                <Server className="h-4 w-4" />
                By Service
              </button>
              <button
                onClick={() => setActiveTab("user")}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  activeTab === "user"
                    ? "bg-white text-primary shadow-sm dark:bg-gray-700 dark:text-white"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                )}
              >
                <Users className="h-4 w-4" />
                By User
              </button>
            </div>

            {/* Timeframe Filter */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="text-sm font-medium text-dark dark:text-white">
                Timeframe:
              </label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="rounded-md border border-stroke bg-white px-3 py-2 text-sm text-dark dark:border-dark-3 dark:bg-gray-dark dark:text-white"
              >
                <option value="1d">Last 24h</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
          </div>

          <Button
            onClick={
              loading
                ? undefined
                : activeTab === "service"
                  ? fetchData
                  : fetchUserData
            }
            label={loading ? "Loading..." : "Refresh"}
            variant="outlinePrimary"
            size="small"
            style={{
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          />
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === "service" ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {statsConfig.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
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
                        {loading ? (
                          <div className="h-8 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700"></div>
                        ) : (
                          stat.formatter(stat.value)
                        )}
                      </div>
                      {stat.description && (
                        <p className="text-xs text-dark-6 dark:text-dark-5 mt-1">
                          {stat.description}
                        </p>
                      )}
                    </div>
                    <div className={cn("p-2 rounded-lg", stat.color)}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Service Details */}
          {data &&
            data.data &&
            Array.isArray(data.data) &&
            data.data.length > 0 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-dark dark:text-white">
                    Service Credit Usage
                  </h3>
                  <p className="text-sm text-dark-6 dark:text-dark-5">
                    API credit consumption by service
                  </p>
                </div>

                <CreditInsights data={data.data} />
              </div>
            )}

          {/* Daily Charts - Temporarily disabled until daily breakdown data is available */}
          {/* {data &&
            data.data &&
            data.data.length > 0 &&
            data.data.some(
              (service) =>
                service.dailyBreakdown && service.dailyBreakdown.length > 0
            ) && <DailyCharts data={data.data} />} */}

          {/* Loading State */}
          {loading && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card"
                  >
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 dark:bg-gray-700"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/2 dark:bg-gray-700"></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card"
                  >
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4 dark:bg-gray-700"></div>
                      <div className="h-8 bg-gray-200 rounded w-1/2 dark:bg-gray-700"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded dark:bg-gray-700"></div>
                        <div className="h-3 bg-gray-200 rounded dark:bg-gray-700"></div>
                        <div className="h-3 bg-gray-200 rounded dark:bg-gray-700"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && (!data || data.data.length === 0) && (
            <div className="rounded-[10px] border border-stroke bg-white p-8 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
              <div className="text-center">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-dark dark:text-white mb-2">
                  No API usage data found
                </h3>
                <p className="text-dark-6 dark:text-dark-5">
                  No API usage data found for the selected timeframe.
                </p>
              </div>
            </div>
          )}
        </>
      ) : (
        <UserApiUsage data={userData} loading={loading} />
      )}
    </div>
  );
}
