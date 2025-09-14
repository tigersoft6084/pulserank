"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CompactAlert } from "@/components/ui-elements/alert";
import {
  fetchThirdPartyServices,
  type ThirdPartyServiceData,
} from "@/services/third-party-services.service";
import { StatsCards } from "./stats-cards";
import { SubscriptionTable } from "./subscription-table";

export function OverviewTab() {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(
    new Set()
  );

  // Fetch third-party services to check for warnings
  const { data: servicesResponse } = useQuery({
    queryKey: ["third-party-services"],
    queryFn: fetchThirdPartyServices,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Function to get service status
  const getServiceStatus = (service: ThirdPartyServiceData) => {
    if (!service.data || service.data.length === 0) return "inactive";

    const mainValue = Object.values(service.data);
    // if any element is zero, return inactive
    if (mainValue.some((value) => value === 0)) return "inactive";
    if (mainValue.some((value) => value <= service.threshold)) return "warning";
    return "healthy";
  };

  // Function to handle alert dismissal
  const handleDismissAlert = (serviceId: string) => {
    setDismissedAlerts((prev) => new Set(prev).add(serviceId));
  };

  // Function to get alert message based on service status
  const getAlertMessage = (serviceName: string, status: string) => {
    switch (status) {
      case "inactive":
        return `${serviceName} service is inactive. Please configure it to restore functionality.`;
      case "warning":
        return `${serviceName} service is running low on resources. Please check the configuration.`;
      default:
        return "";
    }
  };

  return (
    <div className="space-y-4">
      {/* Individual Service Alerts */}
      {servicesResponse?.data
        ?.filter((service) => service.name !== "Intercom")
        .map((service) => {
          const status = getServiceStatus(service);
          const alertId = `${service.id}-${status}`;
          const isDismissed = dismissedAlerts.has(alertId);

          // Only show alerts for inactive or warning services
          if (status === "healthy" || isDismissed) return null;

          return (
            <CompactAlert
              key={alertId}
              variant={status === "inactive" ? "error" : "warning"}
              title={getAlertMessage(service.name, status)}
              dismissible
              onDismiss={() => handleDismissAlert(alertId)}
            />
          );
        })}

      {/* Statistics Cards */}
      <StatsCards />

      {/* Recent Subscriptions Table */}
      <SubscriptionTable />
    </div>
  );
}
