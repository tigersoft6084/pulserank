"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui-elements/button";
import { cn } from "@/lib/utils";
import {
  fetchThirdPartyServices,
  type ThirdPartyServiceData,
} from "@/services/third-party-services.service";
import { formatTime } from "@/lib/format-time";
import { ConfigDialog, type ThirdPartyService } from "./config-dialog";

// Service Cards Component
function ServiceCard({
  service,
  onConfigure,
}: {
  service: ThirdPartyServiceData;
  onConfigure: (serviceId: string) => void;
}) {
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

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const getServiceStatus = (service: ThirdPartyServiceData) => {
    if (!service.data || service.data.length === 0) return "inactive";

    const mainValue = Object.values(service.data);
    // if any element is zero, return inactive
    if (mainValue.some((value) => value === 0)) return "inactive";
    if (mainValue.some((value) => value <= service.threshold)) return "warning";
    return "healthy";
  };

  const renderServiceData = () => {
    if (!service.data) return null;

    return (
      <div className="space-y-2">
        {Object.entries(service.data).map(([key, value]) => (
          <div key={key} className="flex justify-between text-sm">
            <span className="text-dark-6 dark:text-dark-5">{key}:</span>
            <span className="font-medium text-dark dark:text-white">
              {key.toLowerCase().includes("balance")
                ? `$${formatNumber(value)}`
                : formatNumber(value)}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h3 className="text-lg font-bold text-dark dark:text-white">
              {service.name}
            </h3>
          </div>
        </div>
        {service.name !== "Intercom" && (
          <span
            className={cn(
              "rounded-full px-3 py-1 text-sm font-medium",
              getStatusColor(getServiceStatus(service))
            )}
          >
            {getStatusText(getServiceStatus(service))}
          </span>
        )}
      </div>

      <div className="mt-6 flex-1 space-y-4">
        {renderServiceData()}
        <div className="flex justify-between text-sm">
          <span className="text-dark-6 dark:text-dark-5">Last Sync:</span>
          <span className="text-dark dark:text-white">
            {service.name === "Intercom"
              ? "N/A"
              : service.lastSync
                ? formatTime(service.lastSync)
                : "Never"}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-dark-6 dark:text-dark-5">Last Configured:</span>
          <span className="text-dark dark:text-white">
            {service.updatedAt ? formatTime(service.updatedAt) : "Never"}
          </span>
        </div>
      </div>

      <div className="mt-6">
        <Button
          className="w-full"
          label="Configure"
          variant="outlinePrimary"
          size="small"
          onClick={() => onConfigure(service.id)}
        />
      </div>
    </div>
  );
}

export function ThirdPartyServicesTab() {
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  const [selectedService, setSelectedService] =
    useState<ThirdPartyService | null>(null);

  // Fetch third-party services using React Query
  const {
    data: servicesResponse,
    isLoading,
    isFetching,
    error,
  } = useQuery({
    queryKey: ["third-party-services"],
    queryFn: fetchThirdPartyServices,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleConfigure = (serviceId: string) => {
    const service = servicesResponse?.data.find((s) => s.id === serviceId);
    if (service) {
      setSelectedService(service);
      setIsConfigDialogOpen(true);
    }
  };

  const handleConfigClose = () => {
    setIsConfigDialogOpen(false);
    setSelectedService(null);
  };

  const handleConfigSave = (config: unknown) => {
    // Handle successful save if needed
    console.log("Configuration saved:", config);
  };

  if (isLoading || isFetching) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-bold text-dark dark:text-white">
              SEO Services
            </h3>
            <p className="text-sm text-dark-6 dark:text-dark-5">
              Manage your SEO and analytics service integrations
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-[10px] bg-gray-200 dark:bg-gray-700"
            />
          ))}
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-bold text-dark dark:text-white">
              Intercom Service
            </h3>
            <p className="text-sm text-dark-6 dark:text-dark-5">
              Manage your intercom service integrations
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {[1].map((i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-[10px] bg-gray-200 dark:bg-gray-700"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-bold text-dark dark:text-white">
              SEO Services
            </h3>
            <p className="text-sm text-dark-6 dark:text-dark-5">
              Manage your SEO and analytics service integrations
            </p>
          </div>
        </div>
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-red-600 dark:text-red-400">
            Error loading third-party services. Please try again.
          </p>
        </div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-bold text-dark dark:text-white">
              Intercom Service
            </h3>
            <p className="text-sm text-dark-6 dark:text-dark-5">
              Manage your intercom service integrations
            </p>
          </div>
        </div>
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <p className="text-red-600 dark:text-red-400">
            Error loading third-party services. Please try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-dark dark:text-white">
            SEO Services
          </h3>
          <p className="text-sm text-dark-6 dark:text-dark-5">
            Manage your SEO and analytics service integrations
          </p>
        </div>
      </div>

      {/* Service Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {servicesResponse?.data
          .filter((service) => service.name !== "Intercom")
          .map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onConfigure={handleConfigure}
            />
          ))}
      </div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-bold text-dark dark:text-white">
            Intercom Service{" "}
          </h3>
          <p className="text-sm text-dark-6 dark:text-dark-5">
            Manage your intercom service integrations
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {servicesResponse?.data
          .filter((service) => service.name === "Intercom")
          .map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onConfigure={handleConfigure}
            />
          ))}
      </div>

      {/* Config Dialog */}
      <ConfigDialog
        isOpen={isConfigDialogOpen}
        onClose={handleConfigClose}
        service={selectedService}
        onSave={handleConfigSave}
      />
    </div>
  );
}
