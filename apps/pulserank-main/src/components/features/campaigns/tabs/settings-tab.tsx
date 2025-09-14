import FollowedKeywordsSection from "./settings/followed-keywords-section";
import TrackedSitesSection from "./settings/tracked-sites-section";
import AlertsSection from "./settings/alerts-section";
import { CampaignDetail } from "@/types/campaigns";

export default function SettingsTab({
  campaignId,
  campaign,
}: {
  campaignId: string;
  campaign: CampaignDetail;
}) {
  return (
    <>
      <div className="space-y-8">
        <FollowedKeywordsSection
          campaignId={campaignId}
          keywords={campaign?.keywords}
        />
        <TrackedSitesSection campaignId={campaignId} sites={campaign?.sites} />
        <AlertsSection campaignId={campaignId} alerts={campaign?.alerts} />
      </div>
    </>
  );
}
