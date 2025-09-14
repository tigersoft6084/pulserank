import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useGetSiteRankings } from "@/hooks/features/campaign/use-ranking";
import { useGetCampaign } from "@/hooks/features/campaign/use-campaign";
import { Skeleton } from "@/components/ui/skeleton";
import { PropertiesIcons } from "../../serp/properties-icons";
import { flagMap } from "@/lib/utils/flag-static-map";
import { baseToCountryCode } from "@/lib/utils/flag-utils";
import { Favicon } from "@/components/ui/favicon";
import {
  Table,
  TableBody,
  TableCell,
  SortableTableHead,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PeriodSelector,
  TagFilters,
  DetailTableControls,
  DetailTableCell,
  getPeriodDates,
  generateDateColumns,
  useFilteredRankings,
  groupBySite,
} from "../shared";
import { useTableSort } from "@/hooks/use-table-sort";

export default function DetailSitesTab({ campaignId }: { campaignId: string }) {
  const t = useTranslations("campaigns.detailSitesTab");

  const [period, setPeriod] = useState("7d");
  const [customDateFrom, setCustomDateFrom] = useState<Date>();
  const [customDateTo, setCustomDateTo] = useState<Date>();
  const [keywordTag, setKeywordTag] = useState<string>("");
  const [siteTag, setSiteTag] = useState<string>("");
  const [dateGrouping, setDateGrouping] = useState("day");
  const [showVariation, setShowVariation] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

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

  // Generate date columns
  const dateColumns = useMemo(() => {
    if (!dateFrom || !dateTo) return [];
    return generateDateColumns(dateFrom, dateTo, dateGrouping);
  }, [dateFrom, dateTo, dateGrouping]);

  // Use shared filtering hook
  const filteredRankings = useFilteredRankings(
    rankings,
    campaignDetail,
    keywordTag,
    siteTag,
  );

  const groupedRankings = filteredRankings ? groupBySite(filteredRankings) : {};

  // Convert grouped rankings to flat array for sorting
  const flatRankings = useMemo(() => {
    return Object.entries(groupedRankings).flatMap(([site, siteRankings]) =>
      siteRankings.map((ranking) => ({ ...ranking, site })),
    );
  }, [groupedRankings]);

  // Add sorting functionality
  const { sortedData, sortConfig, handleSort } = useTableSort(
    flatRankings as unknown as Record<string, unknown>[],
  );

  // Re-group sorted data
  const sortedGroupedRankings = useMemo(() => {
    const grouped: Record<string, typeof flatRankings> = {};
    sortedData.forEach((item) => {
      const typedItem = item as unknown as (typeof flatRankings)[0];
      if (!grouped[typedItem.site]) {
        grouped[typedItem.site] = [];
      }
      grouped[typedItem.site].push(typedItem);
    });
    return grouped;
  }, [sortedData]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <PeriodSelector
            period={period}
            onPeriodChange={setPeriod}
            customDateFrom={customDateFrom}
            customDateTo={customDateTo}
            onCustomDateFromChange={setCustomDateFrom}
            onCustomDateToChange={setCustomDateTo}
          />

          <DetailTableControls
            dateGrouping={dateGrouping}
            onDateGroupingChange={setDateGrouping}
            showVariation={showVariation}
            onShowVariationChange={setShowVariation}
            showDetails={showDetails}
            onShowDetailsChange={setShowDetails}
          />
        </div>

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
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableTableHead
                  sortKey="site"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("columns.site")}
                </SortableTableHead>
                <SortableTableHead
                  sortKey="keyword"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("columns.keyword")}
                </SortableTableHead>
                {showDetails && (
                  <>
                    <SortableTableHead
                      sortKey="cpc"
                      currentSortKey={sortConfig?.key || null}
                      currentDirection={sortConfig?.direction || null}
                      onSort={handleSort}
                    >
                      {t("columns.cpc")}
                    </SortableTableHead>
                    <SortableTableHead
                      sortKey="search_volume"
                      currentSortKey={sortConfig?.key || null}
                      currentDirection={sortConfig?.direction || null}
                      onSort={handleSort}
                    >
                      {t("columns.searchVolume")}
                    </SortableTableHead>
                    <TableHead>{t("columns.properties")}</TableHead>
                    <SortableTableHead
                      sortKey="competition"
                      currentSortKey={sortConfig?.key || null}
                      currentDirection={sortConfig?.direction || null}
                      onSort={handleSort}
                    >
                      {t("columns.competition")}
                    </SortableTableHead>
                    <SortableTableHead
                      sortKey="interest"
                      currentSortKey={sortConfig?.key || null}
                      currentDirection={sortConfig?.direction || null}
                      onSort={handleSort}
                    >
                      {t("columns.interest")}
                    </SortableTableHead>
                    <TableHead>{t("columns.url")}</TableHead>
                    <TableHead>{t("columns.best")}</TableHead>
                  </>
                )}
                {dateColumns.map((date) => (
                  <TableHead key={date} className="text-center">
                    {date}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(sortedGroupedRankings).map(
                ([site, siteRankings]) => {
                  return siteRankings.map((ranking, index) => {
                    // Dynamic flag logic
                    const countryCode = baseToCountryCode[ranking.base];
                    const Flag = countryCode ? flagMap[countryCode] : null;

                    return (
                      <TableRow key={`${site}-${ranking.keyword}-${index}`}>
                        {index === 0 && (
                          <TableCell
                            rowSpan={siteRankings.length}
                            className="align-top"
                          >
                            <div className="flex items-center gap-2">
                              <Favicon url={site} size={16} />
                              {site}
                            </div>
                          </TableCell>
                        )}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {Flag ? (
                              <Flag title={countryCode} className="w-4 h-3" />
                            ) : (
                              <span className="w-4 h-3 bg-gray-200 rounded" />
                            )}
                            <span>{ranking.keyword}</span>
                          </div>
                        </TableCell>
                        {showDetails && (
                          <>
                            <TableCell>{ranking.cpc}</TableCell>
                            <TableCell>{ranking.search_volume}</TableCell>
                            <TableCell>
                              <PropertiesIcons
                                properties={ranking.properties}
                              />
                            </TableCell>
                            <TableCell>{ranking.competition}</TableCell>
                            <TableCell>{ranking.interest}</TableCell>
                            <TableCell>
                              {ranking.rankings.find((r) => r.url)?.url ? (
                                <a
                                  href={
                                    ranking.rankings.find((r) => r.url)?.url ??
                                    ""
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 underline text-sm flex items-center gap-2"
                                >
                                  <Favicon
                                    url={
                                      ranking.rankings.find((r) => r.url)
                                        ?.url ?? ""
                                    }
                                    size={16}
                                  />
                                  {ranking.rankings.find((r) => r.url)?.url}
                                </a>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                            <TableCell>
                              {Math.min(
                                ...ranking.rankings.map(
                                  (r) => r.rank ?? Infinity,
                                ),
                              ) !== Infinity
                                ? Math.min(
                                    ...ranking.rankings.map(
                                      (r) => r.rank ?? Infinity,
                                    ),
                                  )
                                : "-"}
                            </TableCell>
                          </>
                        )}
                        {dateColumns.map((date) => (
                          <DetailTableCell
                            key={date}
                            ranking={ranking}
                            date={date}
                            dateGrouping={dateGrouping}
                            dateColumns={dateColumns}
                            showVariation={showVariation}
                          />
                        ))}
                      </TableRow>
                    );
                  });
                },
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
