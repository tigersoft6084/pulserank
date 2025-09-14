"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import {
  fetchThirdPartyServices,
  type ThirdPartyServiceData,
} from "@/services/third-party-services.service";
import { formatTime } from "@/lib/format-time";
import Link from "next/link";

export function ThirdPartyServicesStatus() {
  // Fetch third-party services using React Query
  const {
    data: servicesResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["third-party-services"],
    queryFn: fetchThirdPartyServices,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-[#219653]/[0.08] text-[#219653]";
      case "warning":
        return "bg-[#FFA70B]/[0.08] text-[#FFA70B]";
      case "inactive":
        return "bg-[#D34053]/[0.08] text-[#D34053]";
      default:
        return "bg-gray/10 text-gray-600";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "healthy":
        return "Healthy";
      case "warning":
        return "Warning";
      case "inactive":
        return "Inactive";
      default:
        return "Unknown";
    }
  };

  const getServiceStatus = (service: ThirdPartyServiceData) => {
    if (!service.data || service.data.length === 0) return "inactive";

    const mainValue = Object.values(service.data);
    // if any element is zero, return inactive
    if (mainValue.some((value) => value === 0)) return "inactive";
    if (mainValue.some((value) => value <= service.threshold)) return "warning";
    return "healthy";
  };

  if (isLoading) {
    return (
      <div className="h-full rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-1/3 rounded bg-gray-200 dark:bg-gray-700"></div>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-3 rounded bg-gray-200 dark:bg-gray-700"
              ></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="text-center">
          <p className="text-sm text-red-600 dark:text-red-400">
            Error loading third-party services
          </p>
        </div>
      </div>
    );
  }

  const services =
    servicesResponse?.data?.filter((service) => service.name !== "Intercom") ||
    [];
  const healthyServices = services.filter(
    (s) => getServiceStatus(s) === "healthy"
  ).length;
  const warningServices = services.filter(
    (s) => getServiceStatus(s) === "warning"
  ).length;
  const inactiveServices = services.filter(
    (s) => getServiceStatus(s) === "inactive"
  ).length;

  return (
    <div className="h-full rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-dark dark:text-white">
          SEO Third-Party Services
        </h3>
        <Link
          href="/sales-management?tab=third-party-services"
          className="text-sm font-medium text-primary hover:text-primary/80 dark:text-primary dark:hover:text-primary/80"
        >
          View Details
        </Link>
      </div>

      <div className="space-y-4">
        {/* Status Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div
              className={cn(
                "mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full",
                "bg-[#219653]/[0.08]"
              )}
            >
              <span className="text-sm font-bold text-[#219653]">
                {healthyServices}
              </span>
            </div>
            <p className="text-xs text-dark-6 dark:text-dark-5">Healthy</p>
          </div>
          <div className="text-center">
            <div
              className={cn(
                "mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full",
                "bg-[#FFA70B]/[0.08]"
              )}
            >
              <span className="text-sm font-bold text-[#FFA70B]">
                {warningServices}
              </span>
            </div>
            <p className="text-xs text-dark-6 dark:text-dark-5">Warning</p>
          </div>
          <div className="text-center">
            <div
              className={cn(
                "mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full",
                "bg-[#D34053]/[0.08]"
              )}
            >
              <span className="text-sm font-bold text-[#D34053]">
                {inactiveServices}
              </span>
            </div>
            <p className="text-xs text-dark-6 dark:text-dark-5">Inactive</p>
          </div>
        </div>

        {/* Service List */}
        <div className="space-y-3">
          {services.slice(0, 3).map((service) => (
            <div key={service.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-dark dark:text-white">
                  {service.name}
                </span>
              </div>
              <span
                className={cn(
                  "rounded-full px-2 py-1 text-xs font-medium",
                  getStatusColor(getServiceStatus(service))
                )}
              >
                {getStatusText(getServiceStatus(service))}
              </span>
            </div>
          ))}
          {services.length > 3 && (
            <div className="pt-2 text-center">
              <span className="text-xs text-dark-6 dark:text-dark-5">
                +{services.length - 3} more services
              </span>
            </div>
          )}
        </div>

        {/* Last Updated */}
        {services.length > 0 && (
          <div className="border-t border-stroke pt-3 dark:border-dark-3">
            <p className="text-xs text-dark-6 dark:text-dark-5">
              Last updated: {formatTime(new Date().toISOString())}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
