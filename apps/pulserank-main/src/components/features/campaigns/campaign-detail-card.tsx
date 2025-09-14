import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { DeleteCampaignAlertButton } from "./modals/delete-campaign-alert-button";
import { CampaignKeywordsDetailModal } from "./modals/campaign-keywords-detail-modal";
import { toast } from "@/hooks/use-toast";
import { useTranslations } from "next-intl";
import {
  useGetCampaign,
  useDeleteCampaign,
} from "@/hooks/features/campaign/use-campaign";
import { useGetSiteRankings } from "@/hooks/features/campaign/use-ranking";
import { RANK_RANGES, getRangeColor } from "@/lib/config";
import { useCampaignsStore } from "@/store/campaigns-store";
import { TagFilters, useFilteredRankings } from "./shared";

export function CampaignCard({
  campaignId,
  name,
}: {
  campaignId: string;
  name: string;
}) {
  const t = useTranslations("campaigns");
  const [keywordTag, setKeywordTag] = useState<string>("");
  const [siteTag, setSiteTag] = useState<string>("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();

  const { setSelectedTab } = useCampaignsStore();

  const { data: campaignDetail, isLoading: loading } =
    useGetCampaign(campaignId);

  // Get rankings for the last 7 days
  const sevenDaysAgo = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 7);
    return date.toISOString().split("T")[0];
  }, []);

  const today = useMemo(() => {
    return new Date().toISOString().split("T")[0];
  }, []);

  const { data: rankings } = useGetSiteRankings(
    campaignId,
    sevenDaysAgo,
    today,
  );

  // Use shared filtering hook
  const filteredRankings = useFilteredRankings(
    rankings,
    campaignDetail,
    keywordTag,
    siteTag,
  );

  const {
    mutate: deleteCampaign,
    isPending: deletingCampaign,
    isSuccess: campaignDeleted,
    isError: campaignDeleteError,
    error: campaignDeleteErrorData,
  } = useDeleteCampaign();

  // Get latest and closest-to-7-days-ago ranking distributions
  const [latestDist, beforeDist] = useMemo(() => {
    if (!filteredRankings)
      return [
        Array(RANK_RANGES.length).fill(0),
        Array(RANK_RANGES.length).fill(0),
      ];

    const now = new Date();
    const beforeDate = new Date(now);
    beforeDate.setDate(now.getDate() - 7);
    const latestCounts = Array(RANK_RANGES.length).fill(0);
    const beforeCounts = Array(RANK_RANGES.length).fill(0);

    filteredRankings.forEach((ranking) => {
      // Latest ranking (most recent date)
      const latestRanking = ranking.rankings
        .filter((r) => r.rank !== null)
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        )[0];

      if (latestRanking) {
        const idx = RANK_RANGES.findIndex(
          (r) => latestRanking.rank! >= r.min && latestRanking.rank! <= r.max,
        );
        if (idx !== -1) latestCounts[idx]++;
      }

      // 7 days before ranking - find the closest date to exactly 7 days ago
      const beforeRanking = ranking.rankings
        .filter((r) => r.rank !== null)
        .sort((a, b) => {
          const aDiff = Math.abs(
            new Date(a.date).getTime() - beforeDate.getTime(),
          );
          const bDiff = Math.abs(
            new Date(b.date).getTime() - beforeDate.getTime(),
          );
          return aDiff - bDiff;
        })[0];

      if (beforeRanking) {
        const idx = RANK_RANGES.findIndex(
          (r) => beforeRanking.rank! >= r.min && beforeRanking.rank! <= r.max,
        );
        if (idx !== -1) beforeCounts[idx]++;
      }
    });

    return [latestCounts, beforeCounts];
  }, [filteredRankings]);

  // Function to filter rankings by range
  const getRankingsByRange = (rangeIndex: number, isLatest: boolean) => {
    if (!filteredRankings) return [];

    const range = RANK_RANGES[rangeIndex];
    const now = new Date();
    const beforeDate = new Date(now);
    beforeDate.setDate(now.getDate() - 7);

    return filteredRankings.filter((ranking) => {
      if (isLatest) {
        // Filter for latest rankings in the specified range
        const latestRanking = ranking.rankings
          .filter((r) => r.rank !== null)
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          )[0];

        return (
          latestRanking &&
          latestRanking.rank! >= range.min &&
          latestRanking.rank! <= range.max
        );
      } else {
        // Filter for 7 days ago rankings in the specified range
        const beforeRanking = ranking.rankings
          .filter((r) => r.rank !== null)
          .sort((a, b) => {
            const aDiff = Math.abs(
              new Date(a.date).getTime() - beforeDate.getTime(),
            );
            const bDiff = Math.abs(
              new Date(b.date).getTime() - beforeDate.getTime(),
            );
            return aDiff - bDiff;
          })[0];

        return (
          beforeRanking &&
          beforeRanking.rank! >= range.min &&
          beforeRanking.rank! <= range.max
        );
      }
    });
  };

  useEffect(() => {
    if (campaignDeleted) {
      router.push("/campaigns");
      toast({
        title: t("settings"),
        description: t("detailCard.campaignDeleted"),
      });
    }
    if (campaignDeleteError) {
      toast({
        title: t("detailCard.error"),
        description: campaignDeleteErrorData?.message,
        variant: "destructive",
      });
    }
    setShowDeleteDialog(false);
  }, [
    campaignDeleted,
    router,
    campaignDeleteError,
    campaignDeleteErrorData,
    t,
  ]);

  if (loading || !campaignDetail)
    return (
      <Card>
        <CardHeader>
          <CardTitle>{name}</CardTitle>
        </CardHeader>
        <CardContent>{t("detailCard.loading")}</CardContent>
      </Card>
    );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <CardTitle>
            <Link
              href={`/campaigns/${campaignId}`}
              onClick={() => {
                setSelectedTab("before-after-site");
              }}
              className="text-xl font-semibold hover:underline"
            >
              {name}
            </Link>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="w-9 h-9"
              onClick={() => {
                setSelectedTab("settings");
                router.push(`/campaigns/${campaignId}`);
              }}
            >
              <Settings className="w-4 h-4" />
            </Button>
            <DeleteCampaignAlertButton
              showDeleteDialog={showDeleteDialog}
              setShowDeleteDialog={setShowDeleteDialog}
              deleting={deletingCampaign}
              handleDelete={() => deleteCampaign(campaignId)}
              isIcon={true}
            />
          </div>
        </div>
        <TagFilters
          campaignDetail={campaignDetail}
          keywordTag={keywordTag}
          siteTag={siteTag}
          onKeywordTagChange={setKeywordTag}
          onSiteTagChange={setSiteTag}
        />
      </CardHeader>
      <CardContent>
        <div className="flex gap-8">
          <div className="flex-1 space-y-4">
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                {t("detailCard.mostRecent")}
              </div>
              <div className="flex items-end gap-1 h-8">
                {latestDist.map((count, idx) => (
                  <div
                    key={idx}
                    className="flex-1 relative rounded h-full flex items-center justify-center"
                    style={{ background: getRangeColor(idx) }}
                  >
                    {count > 0 && (
                      <CampaignKeywordsDetailModal
                        rankings={getRankingsByRange(idx, true)}
                        campaignName={`${name} - ${RANK_RANGES[idx].label} (${t("detailCard.mostRecent")})`}
                        trigger={
                          <Badge className="absolute right-1 font-semibold text-xs cursor-pointer hover:bg-primary/80">
                            {count}
                          </Badge>
                        }
                      />
                    )}
                    <Label className="text-sm text-white font-semibold">
                      {RANK_RANGES[idx].label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                {t("detailCard.sevenDaysAgo")}
              </div>
              <div className="flex items-end gap-1 h-8">
                {beforeDist.map((count, idx) => (
                  <div
                    key={idx}
                    className="flex-1 relative rounded h-full flex items-center justify-center"
                    style={{ background: getRangeColor(idx) }}
                  >
                    {count > 0 && (
                      <CampaignKeywordsDetailModal
                        rankings={getRankingsByRange(idx, false)}
                        campaignName={`${name} - ${RANK_RANGES[idx].label} (7 Days Ago)`}
                        trigger={
                          <Badge className="absolute right-1 font-semibold text-xs cursor-pointer hover:bg-primary/80">
                            {count}
                          </Badge>
                        }
                      />
                    )}
                    <Label className="text-sm text-white font-semibold">
                      {RANK_RANGES[idx].label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
