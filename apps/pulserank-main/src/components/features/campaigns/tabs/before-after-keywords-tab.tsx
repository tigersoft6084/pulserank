import { useState } from "react";
import { useGetSiteRankings } from "@/hooks/features/campaign/use-ranking";
import { useGetCampaign } from "@/hooks/features/campaign/use-campaign";
import { Skeleton } from "@/components/ui/skeleton";
import { KeywordTableCard } from "./before-after-keywords/keyword-table-card";
import {
  PeriodSelector,
  TagFilters,
  getPeriodDates,
  useFilteredRankings,
  groupByKeyword,
} from "../shared";
import { useTranslations } from "next-intl";

export default function BeforeAfterKeywordsTab({
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
    ? groupByKeyword(filteredRankings)
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
            Object.entries(groupedRankings).map(
              ([keyword, keywordRankings]) => {
                if (keywordRankings.length === 0) return null;
                return (
                  <KeywordTableCard
                    key={keyword}
                    keyword={keyword}
                    keywordRankings={keywordRankings}
                    dateFrom={dateFrom}
                    dateTo={dateTo}
                  />
                );
              },
            )
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
