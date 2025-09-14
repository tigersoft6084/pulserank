"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { NewBacklinksTab } from "@/components/features/sites/domain/backlinks/new-backlinks-tab";
import { LostBacklinksTab } from "@/components/features/sites/domain/backlinks/lost-backlinks-tab";
import { useCheckWatchlistStatus } from "@/hooks/features/watchlist/use-watchlist";

export default function DomainBacklinksPage() {
  const { domain } = useParams();
  const domainString = Array.isArray(domain) ? domain[0] : domain || "";
  const t = useTranslations("domainBacklinks");
  const [activeTab, setActiveTab] = useState<"new" | "lost">("new");
  const { data: isInWatchlist } = useCheckWatchlistStatus(domainString);

  if (!domainString) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t("noDomain")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as "new" | "lost")}
        className="w-full"
      >
        <TabsList className="mb-6 w-96">
          <TabsTrigger value="new" className="w-1/2">
            {t("tabs.newBacklinks")}
          </TabsTrigger>
          <TabsTrigger value="lost" className="w-1/2">
            {t("tabs.lostBacklinks")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new">
          <NewBacklinksTab isInWatchlist={isInWatchlist || false} />
        </TabsContent>

        <TabsContent value="lost">
          <LostBacklinksTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
