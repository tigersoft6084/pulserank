"use client";

import { cn } from "@/lib/utils";
import { Database, Server, BarChart3, Activity } from "lucide-react";

interface ServiceCreditData {
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

interface CreditInsightsProps {
  data: ServiceCreditData[];
}

export function CreditInsights({ data }: CreditInsightsProps) {
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

  // Group data by service name to show only 3 cards
  const groupedData = data.reduce(
    (acc, service) => {
      const key = service.serviceName;
      if (!acc[key]) {
        acc[key] = {
          serviceName: service.serviceName,
          totalCalls: 0,
          averageResponseTime: 0,
          cacheHits: 0,
          cacheMisses: 0,
          errors: 0,
          uniqueUsers: 0,
          endpoints: [] as string[],
          hitRate: 0,
          errorRate: 0,
          majesticCredits: {
            indexItemResUnits: 0,
            retrievalResUnits: 0,
            analysisResUnits: 0,
          },
          dataforseoCredits: {
            balanceUsed: 0,
          },
          semrushCredits: {
            apiUnitsUsed: 0,
          },
        };
      }

      // Aggregate data
      acc[key].totalCalls += service.totalCalls;
      acc[key].cacheHits += service.cacheHits;
      acc[key].cacheMisses += service.cacheMisses;
      acc[key].errors += service.errors;
      acc[key].uniqueUsers = Math.max(
        acc[key].uniqueUsers,
        service.uniqueUsers
      );

      // Add endpoints
      service.endpoints.forEach((endpoint) => {
        if (!acc[key].endpoints.includes(endpoint)) {
          acc[key].endpoints.push(endpoint);
        }
      });

      // Aggregate credits
      if (service.majesticCredits) {
        acc[key].majesticCredits!.indexItemResUnits +=
          service.majesticCredits.indexItemResUnits;
        acc[key].majesticCredits!.retrievalResUnits +=
          service.majesticCredits.retrievalResUnits;
        acc[key].majesticCredits!.analysisResUnits +=
          service.majesticCredits.analysisResUnits;
      }
      if (service.dataforseoCredits) {
        acc[key].dataforseoCredits!.balanceUsed +=
          service.dataforseoCredits.balanceUsed;
      }
      if (service.semrushCredits) {
        acc[key].semrushCredits!.apiUnitsUsed +=
          service.semrushCredits.apiUnitsUsed;
      }

      return acc;
    },
    {} as Record<string, ServiceCreditData>
  );

  // Calculate averages and rates
  Object.values(groupedData).forEach((service) => {
    service.averageResponseTime =
      service.totalCalls > 0
        ? data
            .filter((s) => s.serviceName === service.serviceName)
            .reduce((sum, s) => sum + s.averageResponseTime, 0) /
          data.filter((s) => s.serviceName === service.serviceName).length
        : 0;

    service.hitRate =
      service.totalCalls > 0 ? service.cacheHits / service.totalCalls : 0;
    service.errorRate =
      service.totalCalls > 0 ? service.errors / service.totalCalls : 0;
    // endpoints already array
  });

  const services = Object.values(groupedData);

  if (!data || data.length === 0) {
    return (
      <div className="rounded-[10px] border border-stroke bg-white p-8 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card">
        <div className="text-center">
          <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-dark dark:text-white mb-2">
            No credit usage data available
          </h3>
          <p className="text-dark-6 dark:text-dark-5">
            Credit usage data will appear here once API calls are made.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {services.map((service, index) => {
        const ServiceIcon = getServiceIcon(service.serviceName);

        return (
          <div
            key={`${service.serviceName}-${index}`}
            className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card"
          >
            {/* Header */}
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
            </div>

            {/* Usage Stats */}
            <div className="space-y-3 mb-4">
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
                  Unique Users:
                </span>
                <span className="font-medium text-dark dark:text-white">
                  {service.uniqueUsers}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-dark-6 dark:text-dark-5">
                  Avg Response Time:
                </span>
                <span className="font-medium text-dark dark:text-white">
                  {formatDuration(service.averageResponseTime)}
                </span>
              </div>
            </div>

            {/* Service-Specific Credit Details */}
            {service.serviceName === "Majestic" && service.majesticCredits && (
              <div className="mt-4 pt-3 border-t border-stroke dark:border-dark-3">
                <div className="text-sm font-medium text-dark dark:text-white mb-2">
                  Majestic Credits:
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-dark-6 dark:text-dark-5">
                      Index Item Units:
                    </span>
                    <span className="font-medium text-dark dark:text-white">
                      {formatNumber(service.majesticCredits.indexItemResUnits)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-dark-6 dark:text-dark-5">
                      Retrieval Units:
                    </span>
                    <span className="font-medium text-dark dark:text-white">
                      {formatNumber(service.majesticCredits.retrievalResUnits)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-dark-6 dark:text-dark-5">
                      Analysis Units:
                    </span>
                    <span className="font-medium text-dark dark:text-white">
                      {formatNumber(service.majesticCredits.analysisResUnits)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-dark dark:text-white">
                      Total Units:
                    </span>
                    <span className="text-primary">
                      {formatNumber(
                        service.majesticCredits.indexItemResUnits +
                          service.majesticCredits.retrievalResUnits +
                          service.majesticCredits.analysisResUnits
                      )}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {service.serviceName === "DataForSeo" &&
              service.dataforseoCredits && (
                <div className="mt-4 pt-3 border-t border-stroke dark:border-dark-3">
                  <div className="text-sm font-medium text-dark dark:text-white mb-2">
                    DataForSEO Credits:
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-dark-6 dark:text-dark-5">
                      Balance Used:
                    </span>
                    <span className="font-medium text-primary">
                      ${service.dataforseoCredits.balanceUsed.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

            {service.serviceName === "SEMRush" && service.semrushCredits && (
              <div className="mt-4 pt-3 border-t border-stroke dark:border-dark-3">
                <div className="text-sm font-medium text-dark dark:text-white mb-2">
                  SEMRush Credits:
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-dark-6 dark:text-dark-5">
                    API Units Used:
                  </span>
                  <span className="font-medium text-primary">
                    {formatNumber(service.semrushCredits.apiUnitsUsed)}
                  </span>
                </div>
              </div>
            )}

            {/* Performance Metrics */}
            <div className="mt-4 pt-3 border-t border-stroke dark:border-dark-3">
              <div className="text-sm font-medium text-dark dark:text-white mb-2">
                Performance:
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-dark-6 dark:text-dark-5">
                    Cache Hit:
                  </span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {(service.hitRate * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-6 dark:text-dark-5">
                    Error Rate:
                  </span>
                  <span className="font-medium text-red-600 dark:text-red-400">
                    {(service.errorRate * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
