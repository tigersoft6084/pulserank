"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  SortableTableHead,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Campaign } from "@/types/campaigns";
import { Favicon } from "@/components/ui/favicon";
import { flagMap } from "@/lib/utils/flag-static-map";
import { baseToCountryCode } from "@/lib/utils/flag-utils";
import { useGetAllCampaignsRankings } from "@/hooks/features/campaign/use-ranking";
import { useTableSort } from "@/hooks/use-table-sort";
import { getPeriodDates } from "./shared";
import { SummaryTagFilters } from "./shared/summary-tag-filters";

interface CampaignSummaryViewProps {
  campaigns: Campaign[] | undefined;
}

interface SummaryRow {
  campaignId: string;
  campaignName: string;
  keyword: string;
  site: string;
  before: number | null;
  after: number | null;
  diff: number | null;
  base: string;
  searchVolume: number;
  cpc: number;
  competition: number;
  interest: number;
  [key: string]: string | number | null;
}

export function CampaignSummaryView({ campaigns }: CampaignSummaryViewProps) {
  const t = useTranslations("campaigns.summary");
  const period = "7d";
  const [keywordTag, setKeywordTag] = useState<string>("");
  const [siteTag, setSiteTag] = useState<string>("");
  const [showRankingData, setShowRankingData] = useState<boolean>(true);

  const { dateFrom, dateTo } = getPeriodDates(period);

  // Get rankings for all campaigns
  const { data: allRankings, isLoading } = useGetAllCampaignsRankings(
    dateFrom,
    dateTo,
  );

  // Process rankings data to create summary rows
  const summaryData: SummaryRow[] = useMemo(() => {
    if (!allRankings || !campaigns) return [];

    const data: SummaryRow[] = [];

    allRankings.forEach((ranking) => {
      // Find the campaign this ranking belongs to
      const campaign = campaigns.find((c) => {
        // Check if campaign has this keyword
        const hasKeyword = c.keywords.some(
          (k) => k.keyword === ranking.keyword,
        );

        // Check if campaign has this site
        const hasSite = c.sites.some((s) => s.url === ranking.site);

        return hasKeyword && hasSite;
      });

      if (!campaign) return;

      // Calculate before and after rankings (similar to Keywords Detail modal)
      const now = new Date();
      const beforeDate = new Date(now);
      beforeDate.setDate(now.getDate() - 7);

      // Get latest ranking (most recent date)
      const latestRanking = ranking.rankings
        .filter((r) => r.rank !== null)
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        )[0];

      // Get closest to 7 days ago ranking
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

      const before = beforeRanking?.rank ?? null;
      const after = latestRanking?.rank ?? null;
      const diff = before !== null && after !== null ? after - before : null;

      data.push({
        campaignId: campaign.id,
        campaignName: campaign.name,
        keyword: ranking.keyword,
        site: ranking.site,
        before,
        after,
        diff,
        base: ranking.base,
        searchVolume: ranking.search_volume,
        cpc: ranking.cpc,
        competition: ranking.competition,
        interest: ranking.interest,
      });
    });

    return data;
  }, [allRankings, campaigns]);

  // Filter data based on selected tags
  const filteredData = useMemo(() => {
    if (!summaryData || !campaigns) return [];

    return summaryData.filter((row) => {
      // Find the campaign and check tags
      const campaign = campaigns.find((c) => c.id === row.campaignId);
      if (!campaign) return false;

      // Check keyword tag filter
      if (keywordTag) {
        const keyword = campaign.keywords.find(
          (k) => k.keyword === row.keyword,
        );

        if (!keyword || !keyword.tags?.includes(keywordTag)) {
          return false;
        }
      }

      // Check site tag filter
      if (siteTag) {
        const site = campaign.sites.find((s) => s.url === row.site);

        if (!site || !site.tags?.includes(siteTag)) {
          return false;
        }
      }

      return true;
    });
  }, [summaryData, campaigns, keywordTag, siteTag]);

  // Add sorting functionality
  const { sortedData, sortConfig, handleSort } = useTableSort(filteredData);

  if (!campaigns || campaigns.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            {t("no campaigns available")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls Section */}
      <div className="flex items-center justify-between gap-4">
        {/* Tag Filters */}
        <SummaryTagFilters
          campaigns={campaigns}
          keywordTag={keywordTag}
          siteTag={siteTag}
          onKeywordTagChange={setKeywordTag}
          onSiteTagChange={setSiteTag}
        />

        {/* Show/Hide Columns Toggle */}
        <div className="flex items-center space-x-2">
          <Switch
            id="show-ranking-data"
            checked={showRankingData}
            onCheckedChange={setShowRankingData}
          />
          <Label htmlFor="show-ranking-data">
            {showRankingData ? "Hide Ranking Data" : "Show Ranking Data"}
          </Label>
        </div>
      </div>

      {/* Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("campaign summary")}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {isLoading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("campaign")}</TableHead>
                  <TableHead>{t("keyword")}</TableHead>
                  <TableHead>{t("domain/site/url")}</TableHead>
                  <TableHead>{t("before")}</TableHead>
                  <TableHead>{t("diff")}</TableHead>
                  <TableHead>{t("after")}</TableHead>
                  {showRankingData && (
                    <>
                      <TableHead>{t("base")}</TableHead>
                      <TableHead>{t("searchVolume")}</TableHead>
                      <TableHead>{t("cpc")}</TableHead>
                      <TableHead>{t("competition")}</TableHead>
                      <TableHead>{t("interest")}</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-48" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-16" />
                    </TableCell>
                    {showRankingData && (
                      <>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16" />
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableTableHead
                      sortKey="campaignName"
                      currentSortKey={sortConfig?.key || null}
                      currentDirection={sortConfig?.direction || null}
                      onSort={handleSort}
                    >
                      {t("campaign")}
                    </SortableTableHead>
                    <SortableTableHead
                      sortKey="keyword"
                      currentSortKey={sortConfig?.key || null}
                      currentDirection={sortConfig?.direction || null}
                      onSort={handleSort}
                    >
                      {t("keyword")}
                    </SortableTableHead>
                    <SortableTableHead
                      sortKey="site"
                      currentSortKey={sortConfig?.key || null}
                      currentDirection={sortConfig?.direction || null}
                      onSort={handleSort}
                    >
                      {t("domain/site/url")}
                    </SortableTableHead>
                    {showRankingData && (
                      <>
                        <SortableTableHead
                          sortKey="base"
                          currentSortKey={sortConfig?.key || null}
                          currentDirection={sortConfig?.direction || null}
                          onSort={handleSort}
                        >
                          {t("base")}
                        </SortableTableHead>
                        <SortableTableHead
                          sortKey="searchVolume"
                          currentSortKey={sortConfig?.key || null}
                          currentDirection={sortConfig?.direction || null}
                          onSort={handleSort}
                        >
                          {t("searchVolume")}
                        </SortableTableHead>
                        <SortableTableHead
                          sortKey="cpc"
                          currentSortKey={sortConfig?.key || null}
                          currentDirection={sortConfig?.direction || null}
                          onSort={handleSort}
                        >
                          {t("cpc")}
                        </SortableTableHead>
                        <SortableTableHead
                          sortKey="competition"
                          currentSortKey={sortConfig?.key || null}
                          currentDirection={sortConfig?.direction || null}
                          onSort={handleSort}
                        >
                          {t("competition")}
                        </SortableTableHead>
                        <SortableTableHead
                          sortKey="interest"
                          currentSortKey={sortConfig?.key || null}
                          currentDirection={sortConfig?.direction || null}
                          onSort={handleSort}
                        >
                          {t("interest")}
                        </SortableTableHead>
                      </>
                    )}
                    <SortableTableHead
                      sortKey="before"
                      currentSortKey={sortConfig?.key || null}
                      currentDirection={sortConfig?.direction || null}
                      onSort={handleSort}
                    >
                      {t("before")}
                    </SortableTableHead>
                    <SortableTableHead
                      sortKey="diff"
                      currentSortKey={sortConfig?.key || null}
                      currentDirection={sortConfig?.direction || null}
                      onSort={handleSort}
                    >
                      {t("diff")}
                    </SortableTableHead>
                    <SortableTableHead
                      sortKey="after"
                      currentSortKey={sortConfig?.key || null}
                      currentDirection={sortConfig?.direction || null}
                      onSort={handleSort}
                    >
                      {t("after")}
                    </SortableTableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedData.map((row, index) => {
                    const countryCode =
                      typeof row.base === "string"
                        ? baseToCountryCode[row.base]
                        : undefined;
                    const Flag = countryCode ? flagMap[countryCode] : null;

                    return (
                      <TableRow
                        key={`${row.campaignId}-${row.keyword}-${row.site}-${index}`}
                      >
                        <TableCell className="font-medium">
                          {row.campaignName}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {Flag && (
                              <Flag title={countryCode} className="w-4 h-3" />
                            )}
                            <span>{row.keyword}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Favicon url={row.site} size={16} />
                            <span className="truncate max-w-48">
                              {row.site}
                            </span>
                          </div>
                        </TableCell>
                        {showRankingData && (
                          <>
                            <TableCell>{row.base}</TableCell>
                            <TableCell>{row.searchVolume}</TableCell>
                            <TableCell>{row.cpc}</TableCell>
                            <TableCell>{row.competition}</TableCell>
                            <TableCell>{row.interest}</TableCell>
                          </>
                        )}
                        <TableCell>
                          {row.before !== null ? row.before : "-"}
                        </TableCell>
                        <TableCell>
                          {row.diff !== null ? (
                            <Badge
                              className={
                                row.diff > 0
                                  ? "bg-red-200 text-red-800"
                                  : row.diff < 0
                                    ? "bg-green-200 text-green-800"
                                    : "bg-gray-200 text-gray-800"
                              }
                            >
                              {row.diff > 0
                                ? `-${Math.abs(row.diff)}`
                                : row.diff < 0
                                  ? `+${Math.abs(row.diff)}`
                                  : "0"}
                            </Badge>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          {row.after !== null ? row.after : "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {sortedData.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  {t("no data matches the selected filters")}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
