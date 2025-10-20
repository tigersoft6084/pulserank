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
  DollarSign,
  CreditCard,
  AlertTriangle,
} from "lucide-react";

interface ServiceData {
  serviceName: string;
  totalCalls: number;
  totalCreditsUsed: number;
  totalCost: number;
  averageResponseTime: number;
  cacheHits: number;
  cacheMisses: number;
  errors: number;
  uniqueUsers: number;
  endpoints: string[];
  hitRate: number;
  errorRate: number;
  averageCreditsPerCall: number;
  averageCostPerCall: number;
  dailyBreakdown: Array<{
    date: string;
    calls: number;
    credits: number;
    cost: number;
  }>;
}

interface ApiUsageResponse {
  success: boolean;
  data: ServiceData[];
  timeframe: string;
  groupBy: string;
  totalCalls: number;
  totalCreditsUsed: number;
  totalCost: number;
  totalUsers?: number;
  activeUsers?: number;
}

export default function ServiceTabPage() {
  const [timeframe, setTimeframe] = useState("7d");
  const [data, setData] = useState<ApiUsageResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/api-usage-enhanced?timeframe=${timeframe}&groupBy=service`
      );
      const result = await response.json();

      if (result.success && result.data) {
        console.log("😊result", result.data);
        setData(result);
        setError(null);
      } else {
        const errorMessage = result.error || "Unknown error";
        console.error("API returned error:", errorMessage);
        setError(errorMessage);
        setData(null);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch data";
      console.error("Error fetching enhanced API usage data:", error);
      setError(errorMessage);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeframe]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getServiceIcon = (serviceName: string) => {
    switch (serviceName.toLowerCase()) {
      case "majestic":
        return Database;
      case "dataforseo":
        return BarChart3;
      case "semrush":
        return TrendingUp;
      default:
        return Server;
    }
  };

  const getServiceColor = (serviceName: string) => {
    switch (serviceName.toLowerCase()) {
      case "majestic":
        return "text-blue-600";
      case "dataforseo":
        return "text-green-600";
      case "semrush":
        return "text-purple-600";
      default:
        return "text-gray-600";
    }
  };

  const getServiceBgColor = (serviceName: string) => {
    switch (serviceName.toLowerCase()) {
      case "majestic":
        return "bg-blue-100 dark:bg-blue-900/20";
      case "dataforseo":
        return "bg-green-100 dark:bg-green-900/20";
      case "semrush":
        return "bg-purple-100 dark:bg-purple-900/20";
      default:
        return "bg-gray-100 dark:bg-gray-900/20";
    }
  };

  const statsConfig = [
    {
      label: "Total API Calls",
      value: data?.totalCalls || 0,
      icon: Activity,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
      formatter: formatNumber,
    },
    {
      label: "Credits Used",
      value: data?.totalCreditsUsed || 0,
      icon: CreditCard,
      color:
        "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400",
      formatter: formatNumber,
    },
    {
      label: "Total Cost",
      value: data?.totalCost || 0,
      icon: DollarSign,
      color:
        "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
      formatter: formatCurrency,
    },
    {
      label: "Services",
      value: data?.data?.length || 0,
      icon: Server,
      color:
        "bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
      formatter: formatNumber,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Timeframe Filter */}
      <div className="rounded-[10px] border border-stroke bg-white p-4 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card sm:p-7.5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

          <Button
            onClick={loading ? undefined : fetchData}
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
                Service Performance & Credit Usage
              </h3>
              <p className="text-sm text-dark-6 dark:text-dark-5">
                Detailed breakdown of API usage, credit consumption, and costs
                by service
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
              {data.data.map((service) => {
                const ServiceIcon = getServiceIcon(service.serviceName);
                return (
                  <div
                    key={service.serviceName}
                    className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "p-2 rounded-lg",
                            getServiceBgColor(service.serviceName)
                          )}
                        >
                          <ServiceIcon
                            className={cn(
                              "h-6 w-6",
                              getServiceColor(service.serviceName)
                            )}
                          />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-dark dark:text-white">
                            {service.serviceName}
                          </h4>
                          <p className="text-sm text-dark-6 dark:text-dark-5">
                            {service.endpoints.length} endpoints
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {formatNumber(service.totalCreditsUsed)}
                        </div>
                        <div className="text-sm text-dark-6 dark:text-dark-5">
                          Credits Used
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-dark-6 dark:text-dark-5">
                          Total Calls:
                        </span>
                        <span className="font-medium text-dark dark:text-white">
                          {formatNumber(service.totalCalls)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-dark-6 dark:text-dark-5">
                          Total Cost:
                        </span>
                        <span className="font-medium text-dark dark:text-white">
                          {formatCurrency(service.totalCost)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-dark-6 dark:text-dark-5">
                          Avg Credits/Call:
                        </span>
                        <span className="font-medium text-dark dark:text-white">
                          {service.averageCreditsPerCall.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-dark-6 dark:text-dark-5">
                          Cache Hit Rate:
                        </span>
                        <span className="font-medium text-dark dark:text-white">
                          {(service.hitRate * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-dark-6 dark:text-dark-5">
                          Error Rate:
                        </span>
                        <span className="font-medium text-dark dark:text-white">
                          {(service.errorRate * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-dark-6 dark:text-dark-5">
                          Unique Users:
                        </span>
                        <span className="font-medium text-dark dark:text-white">
                          {service.uniqueUsers}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-stroke dark:border-dark-3">
                      <div className="text-sm text-dark-6 dark:text-dark-5 mb-2">
                        Endpoints:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {service.endpoints.map((endpoint) => (
                          <span
                            key={endpoint}
                            className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                          >
                            {endpoint}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-[10px] border border-red-200 bg-red-50 p-8 shadow-1 dark:border-red-800 dark:bg-red-900/20">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
              Error loading data
            </h3>
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button
              onClick={fetchData}
              label="Try Again"
              variant="outlinePrimary"
              size="small"
            />
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading &&
        !error &&
        (!data ||
          !data.data ||
          !Array.isArray(data.data) ||
          data.data.length === 0) && (
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
    </div>
  );
}
