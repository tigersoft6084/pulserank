"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { Button } from "@/components/ui-elements/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { OverviewTab } from "./_components/overview-tab";
import { UserPlansTab } from "./_components/user-plans-tab";
import { ThirdPartyServicesTab } from "./_components/third-party-services-tab";
import { BillingHistoryTab } from "./_components/billing-history-tab";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "user-plans", label: "User Plans" },
  { id: "third-party-services", label: "Third-Party Services" },
  { id: "billing-history", label: "Billing History" },
];

const SubscriptionManagementPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  // Get tab from URL on component mount
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && tabs.some((tab) => tab.id === tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  // Update URL when tab changes
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    router.push(`/sales-management?${params.toString()}`);
  };

  return (
    <>
      <Breadcrumb pageName="Sales Management" />

      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-stroke dark:border-dark-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "px-6 py-3 text-sm font-medium transition-all duration-200",
                activeTab === tab.id
                  ? "border-b-2 border-primary text-primary dark:text-white"
                  : "text-dark-4 hover:text-dark dark:text-dark-6 dark:hover:text-white",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "user-plans" && <UserPlansTab />}
          {activeTab === "third-party-services" && <ThirdPartyServicesTab />}
          {activeTab === "billing-history" && <BillingHistoryTab />}
        </div>
      </div>
    </>
  );
};

export default SubscriptionManagementPage;
