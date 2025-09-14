"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SettingsTab from "@/components/features/campaigns/tabs/settings-tab";
import BeforeAfterSitesTab from "@/components/features/campaigns/tabs/before-after-sites-tab";
import BeforeAfterKeywordsTab from "@/components/features/campaigns/tabs/before-after-keywords-tab";
import BeforeAfterUrlsTab from "@/components/features/campaigns/tabs/before-after-urls-tab";
import DetailSitesTab from "@/components/features/campaigns/tabs/detail-sites-tab";
import DetailKeywordsTab from "@/components/features/campaigns/tabs/detail-keywords-tab";
import { SelectedTab, useCampaignsStore } from "@/store/campaigns-store";
import { useGetCampaign } from "@/hooks/features/campaign/use-campaign";

export default function CampaignViewPage() {
  const t = useTranslations("campaigns.view");
  const { campaignId } = useParams();
  const { selectedTab, setSelectedTab } = useCampaignsStore();

  const { data: campaign, isLoading: fetchingCampaign } = useGetCampaign(
    campaignId as string,
  );

  if (fetchingCampaign) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        {t("loading")}
      </div>
    );
  }
  if (!campaign) {
    return (
      <div className="p-8 text-center text-destructive">{t("notFound")}</div>
    );
  }

  return (
    <Tabs
      defaultValue={selectedTab}
      className="w-full"
      onValueChange={(value) => setSelectedTab(value as SelectedTab)}
    >
      <TabsList className="mb-6">
        <TabsTrigger value="before-after-site">
          {t("tabs.beforeAfterSite")}
        </TabsTrigger>
        <TabsTrigger value="before-after-keyword">
          {t("tabs.beforeAfterKeyword")}
        </TabsTrigger>
        <TabsTrigger value="before-after-url">
          {t("tabs.beforeAfterUrl")}
        </TabsTrigger>
        <TabsTrigger value="detail-site">{t("tabs.detailSite")}</TabsTrigger>
        <TabsTrigger value="detail-keyword">
          {t("tabs.detailKeyword")}
        </TabsTrigger>
        <TabsTrigger value="settings">{t("tabs.settings")}</TabsTrigger>
      </TabsList>
      {/* Placeholder tabs */}
      <TabsContent value="before-after-site">
        <BeforeAfterSitesTab campaignId={campaignId as string} />
      </TabsContent>
      <TabsContent value="before-after-keyword">
        <BeforeAfterKeywordsTab campaignId={campaignId as string} />
      </TabsContent>
      <TabsContent value="before-after-url">
        <BeforeAfterUrlsTab campaignId={campaignId as string} />
      </TabsContent>
      <TabsContent value="detail-site">
        <DetailSitesTab campaignId={campaignId as string} />
      </TabsContent>
      <TabsContent value="detail-keyword">
        <DetailKeywordsTab campaignId={campaignId as string} />
      </TabsContent>
      {/* Settings Tab */}
      <TabsContent value="settings">
        <SettingsTab campaignId={campaignId as string} campaign={campaign} />
      </TabsContent>
    </Tabs>
  );
}
