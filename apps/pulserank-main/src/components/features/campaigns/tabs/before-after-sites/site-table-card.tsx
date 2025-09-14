import {
  Table,
  TableBody,
  TableCell,
  SortableTableHead,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RankingData } from "@/types/campaigns";
import { Label } from "@/components/ui/label";
import { RankingHistoryModal } from "../../modals/ranking-history-modal";
import { PropertiesIcons } from "../../../serp/properties-icons";
import { flagMap } from "@/lib/utils/flag-static-map";
import { baseToCountryCode } from "@/lib/utils/flag-utils";
import { Favicon } from "@/components/ui/favicon";
import { useTranslations } from "next-intl";
import { useTableSort } from "@/hooks/use-table-sort";

// Calculate best, from, and to values from rankings array
function calculateRankingValues(
  rankings: RankingData["rankings"],
  dateFrom: string,
  dateTo: string,
) {
  // Find best ranking (lowest rank number)
  const bestRanking = rankings.reduce(
    (best, current) => {
      if (
        current.rank !== null &&
        (best.rank === null || current.rank < best.rank)
      ) {
        return current;
      }
      return best;
    },
    { date: "", rank: null as number | null, url: null as string | null },
  );

  // Find ranking at dateFrom (first day)
  const fromRanking = rankings.find((r) => r.date === dateFrom) || {
    date: "",
    rank: null,
    url: null,
  };

  // Find ranking at dateTo (last day)
  const toRanking = rankings.find((r) => r.date === dateTo) || {
    date: "",
    rank: null,
    url: null,
  };

  return {
    best: bestRanking.rank,
    bestUrl: bestRanking.url,
    from: fromRanking.rank,
    to: toRanking.rank,
  };
}

export function SiteTableCard({
  site,
  siteRankings,
  dateFrom,
  dateTo,
}: {
  site: string;
  siteRankings: RankingData[];
  dateFrom: string | undefined;
  dateTo: string | undefined;
}) {
  const t = useTranslations("campaigns.tableCards");

  // Add sorting functionality
  const { sortedData, sortConfig, handleSort } = useTableSort(
    siteRankings as unknown as Record<string, unknown>[],
  );

  return (
    <Card key={site}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Favicon url={site} size={20} />
          {site}
        </CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableTableHead
                sortKey="keyword"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("columns.keyword")}
              </SortableTableHead>
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
              <TableHead>{t("columns.from")}</TableHead>
              <TableHead>{t("columns.diff")}</TableHead>
              <TableHead>{t("columns.to")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((ranking, i) => {
              const typedRanking = ranking as unknown as RankingData;
              const { best, bestUrl, from, to } = calculateRankingValues(
                typedRanking.rankings,
                dateFrom!,
                dateTo!,
              );

              const change = from !== null && to !== null ? to - from : null;

              // Dynamic flag logic
              const countryCode = baseToCountryCode[typedRanking.base];
              const Flag = countryCode ? flagMap[countryCode] : null;

              return (
                <TableRow key={typedRanking.keyword + i}>
                  <TableCell>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {Flag ? (
                          <Flag title={countryCode} className="w-4 h-3" />
                        ) : (
                          <span className="w-4 h-3 bg-gray-200 rounded" />
                        )}
                        <Label>{typedRanking.keyword}</Label>
                      </div>
                      <RankingHistoryModal ranking={typedRanking} site={site} />
                    </div>
                  </TableCell>
                  <TableCell>{typedRanking.cpc}</TableCell>
                  <TableCell>{typedRanking.search_volume}</TableCell>
                  <TableCell>
                    <PropertiesIcons properties={typedRanking.properties} />
                  </TableCell>
                  <TableCell>{typedRanking.competition}</TableCell>
                  <TableCell>{typedRanking.interest}</TableCell>
                  <TableCell>
                    {bestUrl ? (
                      <a
                        href={bestUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline flex items-center gap-2"
                      >
                        <Favicon url={bestUrl} size={16} />
                        {bestUrl}
                      </a>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>{best ?? "-"}</TableCell>
                  <TableCell>{from ?? "-"}</TableCell>
                  <TableCell>
                    {change !== null && (
                      <Badge
                        className={
                          change > 0
                            ? "bg-red-200 text-red-800"
                            : change < 0
                              ? "bg-green-200 text-green-800"
                              : "bg-gray-200 text-gray-800"
                        }
                      >
                        {change > 0
                          ? `-${Math.abs(change)}`
                          : change < 0
                            ? `+${Math.abs(change)}`
                            : "0"}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{to ?? "-"}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
