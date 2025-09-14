import { useState } from "react";
import { useGetSiteRankings } from "@/hooks/features/campaign/use-ranking";
import { useGetCampaign } from "@/hooks/features/campaign/use-campaign";
import { Skeleton } from "@/components/ui/skeleton";
import { UrlTableCard } from "./before-after-urls/url-table-card";
import {
  PeriodSelector,
  TagFilters,
  getPeriodDates,
  useFilteredRankings,
  groupByBestUrl,
} from "../shared";
import { useTranslations } from "next-intl";

export default function BeforeAfterUrlsTab({
  campaignId,
}: {
  campaignId: string;
}) {
  const t = useTranslations("campaigns");
  const [period, setPeriod] = useState("7d");
  const [customDateFrom, setCustomDateFrom] = useState<Date>();
  const [customDateTo, setCustomDateTo] = useState<Date>();
  const [keywordTag, setKeywordTag] = useState<string>("");
  const [siteTag, setSiteTag] = useState<string>("");

  const { dateFrom, dateTo } = getPeriodDates(
    period,
    customDateFrom,
    customDateTo,
  );

  const { data: rankings, isLoading } = useGetSiteRankings(
    campaignId,
    dateFrom,
    dateTo,
  );

  const { data: campaignDetail } = useGetCampaign(campaignId);

  // Use shared filtering hook
  const filteredRankings = useFilteredRankings(
    rankings,
    campaignDetail,
    keywordTag,
    siteTag,
  );

  const groupedRankings = filteredRankings
    ? groupByBestUrl(filteredRankings)
    : {};

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-2">
        <PeriodSelector
          period={period}
          onPeriodChange={setPeriod}
          customDateFrom={customDateFrom}
          customDateTo={customDateTo}
          onCustomDateFromChange={setCustomDateFrom}
          onCustomDateToChange={setCustomDateTo}
        />

        <TagFilters
          campaignDetail={campaignDetail}
          keywordTag={keywordTag}
          siteTag={siteTag}
          onKeywordTagChange={setKeywordTag}
          onSiteTagChange={setSiteTag}
        />
      </div>

      {isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : (
        <div className="space-y-8">
          {Object.keys(groupedRankings).length > 0 ? (
            Object.entries(groupedRankings).map(([url, urlRankings]) => {
              if (urlRankings.length === 0) return null;
              return (
                <UrlTableCard
                  key={url}
                  url={url}
                  urlRankings={urlRankings}
                  dateFrom={dateFrom}
                  dateTo={dateTo}
                />
              );
            })
          ) : (
            <div className="text-center text-muted-foreground">
              {t("noData")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
