import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Favicon } from "@/components/ui/favicon";
import {
  Table,
  TableBody,
  TableCell,
  SortableTableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BarChart3, History } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTableSort } from "@/hooks/use-table-sort";
import { baseToCountryCode } from "@/lib/utils/flag-utils";
import { flagMap } from "@/lib/utils/flag-static-map";
import { RankingData } from "@/types/campaigns";

interface CampaignKeywordsDetailModalProps {
  rankings: RankingData[] | undefined;
  campaignName: string;
  trigger?: React.ReactNode;
}

export function CampaignKeywordsDetailModal({
  rankings,
  campaignName,
  trigger,
}: CampaignKeywordsDetailModalProps) {
  const t = useTranslations("campaigns.modals.campaignKeywordsDetail");
  const router = useRouter();

  const handleSerpMachine = (keyword: string) => {
    router.push(`/serpmachine?keyword=${encodeURIComponent(keyword)}`);
  };
  if (!rankings || rankings.length === 0) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="outline" size="sm" className="w-9 h-9">
              <BarChart3 className="w-4 h-4" />
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="max-w-7xl">
          <DialogHeader>
            <DialogTitle>{t("title", { campaignName })}</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8 text-muted-foreground">
            {t("noData")}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Calculate before and after rankings for each keyword
  const processedRankings = rankings.map((ranking) => {
    const now = new Date();
    const beforeDate = new Date(now);
    beforeDate.setDate(now.getDate() - 7);

    // Get latest ranking (most recent date)
    const latestRanking = ranking.rankings
      .filter((r: { rank: number | null; date: string }) => r.rank !== null)
      .sort(
        (a: { date: string }, b: { date: string }) =>
          new Date(b.date).getTime() - new Date(a.date).getTime(),
      )[0];

    // Get closest to 7 days ago ranking
    const beforeRanking = ranking.rankings
      .filter((r: { rank: number | null; date: string }) => r.rank !== null)
      .sort((a: { date: string }, b: { date: string }) => {
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
    const difference =
      before !== null && after !== null ? after - before : null;

    // Calculate traffic estimates (rough calculation)
    const calculateTraffic = (rank: number | null, searchVolume: number) => {
      if (rank === null) return 0;
      // Simple traffic estimation: higher positions get more traffic
      const clickThroughRate = Math.max(0.01, 1 / Math.sqrt(rank));
      return Math.round(searchVolume * clickThroughRate);
    };

    const trafficBefore = calculateTraffic(before, ranking.search_volume);
    const trafficAfter = calculateTraffic(after, ranking.search_volume);

    return {
      ...ranking,
      before,
      after,
      difference,
      trafficBefore,
      trafficAfter,
    };
  });

  // Add sorting functionality
  const { sortedData, sortConfig, handleSort } = useTableSort(
    processedRankings as unknown as Record<string, unknown>[],
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="w-9 h-9">
            <BarChart3 className="w-4 h-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-7xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{t("title", { campaignName })}</DialogTitle>
        </DialogHeader>
        <div className="overflow-auto max-h-[calc(80vh-120px)]">
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
                  sortKey="site"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("columns.site")}
                </SortableTableHead>
                <SortableTableHead
                  sortKey="before"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("columns.before")}
                </SortableTableHead>
                <SortableTableHead
                  sortKey="difference"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("columns.diff")}
                </SortableTableHead>
                <SortableTableHead
                  sortKey="after"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("columns.after")}
                </SortableTableHead>
                <SortableTableHead
                  sortKey="trafficBefore"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("columns.trafficBefore")}
                </SortableTableHead>
                <SortableTableHead
                  sortKey="trafficAfter"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("columns.trafficAfter")}
                </SortableTableHead>
                <SortableTableHead
                  sortKey="searchVolume"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("columns.searchVolume")}
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
                  sortKey="competition"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("columns.competition")}
                </SortableTableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((ranking, index) => {
                const typedRanking =
                  ranking as unknown as (typeof processedRankings)[0];
                const countryCode = baseToCountryCode[typedRanking.base];
                const Flag = countryCode ? flagMap[countryCode] : null;

                return (
                  <TableRow
                    key={`${typedRanking.keyword}-${typedRanking.site}-${index}`}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2 justify-between">
                        <div className="flex items-center gap-2">
                          {Flag ? (
                            <Flag title={countryCode} className="w-4 h-3" />
                          ) : (
                            <span className="w-4 h-3 bg-gray-200 rounded" />
                          )}
                          <Label className="font-medium">
                            {typedRanking.keyword}
                          </Label>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  handleSerpMachine(typedRanking.keyword)
                                }
                              >
                                <History className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t("serpMachine")}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Favicon url={typedRanking.site} size={16} />
                        <span className="text-sm">{typedRanking.site}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {typedRanking.before !== null ? (
                        <Badge variant="outline">{typedRanking.before}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {typedRanking.difference !== null ? (
                        <Badge
                          variant="outline"
                          className={cn(
                            typedRanking.difference < 0
                              ? "bg-red-500 text-white"
                              : "bg-green-500 text-white",
                          )}
                        >
                          {typedRanking.difference > 0 ? "+" : "-"}
                          {typedRanking.difference}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {typedRanking.after !== null ? (
                        <Badge variant="outline">{typedRanking.after}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {typedRanking.trafficBefore !== null ? (
                        <span>
                          {typedRanking.trafficBefore.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {typedRanking.trafficAfter !== null ? (
                        <span>
                          {typedRanking.trafficAfter.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {typedRanking.search_volume !== null ? (
                        <span>
                          {typedRanking.search_volume.toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {typedRanking.cpc !== null ? (
                        <span>${typedRanking.cpc.toFixed(2)}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {typedRanking.competition !== null ? (
                        <span>{typedRanking.competition.toFixed(2)}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
