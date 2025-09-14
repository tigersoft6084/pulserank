"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { SemrushGrossTab } from "@/components/features/sites/domain/tabs/semrush-gross-tab";
import { SemrushUrlTab } from "@/components/features/sites/domain/tabs/semrush-url-tab";
import { SerpmachineTab } from "@/components/features/sites/domain/tabs/serpmachine-tab";
import { SerpmachineUrlTab } from "@/components/features/sites/domain/tabs/serpmachine-url-tab";
import { ComingSoonTab } from "@/components/features/sites/domain/tabs/coming-soon-tab";

export default function DomainKeywordsPage() {
  const { domain } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const domainString = Array.isArray(domain) ? domain[0] : domain || "";
  const t = useTranslations("domainKeywords");

  // Get default tab from URL search params
  const getDefaultTab = () => {
    const tabParam = searchParams.get("tab");
    if (tabParam) return tabParam;
    return "semrush-url";
  };

  const [activeTab, setActiveTab] = useState(getDefaultTab());

  // Handle tab changes and update URL
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", newTab);
      router.replace(url.pathname + url.search, { scroll: false });
    }
  };

  // Update active tab when search params change
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [searchParams, activeTab]);

  return (
    <div className="space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="mb-6">
          <TabsTrigger value="semrush-url">{t("tabs.semrushUrl")}</TabsTrigger>
          <TabsTrigger value="semrush-gross">
            {t("tabs.semrushGross")}
          </TabsTrigger>
          <TabsTrigger value="serpmachine">{t("tabs.serpmachine")}</TabsTrigger>
          <TabsTrigger value="serpmachine-url">
            {t("tabs.serpmachineUrl")}
          </TabsTrigger>
          <TabsTrigger value="archives">{t("tabs.archives")}</TabsTrigger>
        </TabsList>

        {/* SEMrush keywords by URL tab */}
        <TabsContent value="semrush-url">
          <SemrushUrlTab domain={domainString} />
        </TabsContent>

        {/* SEMrush keywords (gross) tab */}
        <TabsContent value="semrush-gross">
          <SemrushGrossTab domain={domainString} />
        </TabsContent>

        {/* SERPmachine keywords tab */}
        <TabsContent value="serpmachine">
          <SerpmachineTab domain={domainString} />
        </TabsContent>

        {/* SERPmachine keywords by URL tab */}
        <TabsContent value="serpmachine-url">
          <SerpmachineUrlTab domain={domainString} />
        </TabsContent>

        {/* Archives tab */}
        <TabsContent value="archives">
          <ComingSoonTab
            title={t("comingSoon.archives")}
            description="Historical keyword data and trends will be available here"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
