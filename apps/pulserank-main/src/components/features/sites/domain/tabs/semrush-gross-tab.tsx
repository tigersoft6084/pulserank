import { useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  SortableTableHead,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Target, History } from "lucide-react";
import { useDomainKeywords } from "@/hooks/features/sites/use-domain-keywords";
import useDebounce from "@/hooks/use-debounce";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useTableSort } from "@/hooks/use-table-sort";
import { useLanguageStore } from "@/store/language-store";

interface SemrushGrossTabProps {
  domain: string;
}

export function SemrushGrossTab({ domain }: SemrushGrossTabProps) {
  const t = useTranslations("domainKeywords");
  const router = useRouter();

  // State for SEMrush keywords (gross) tab
  const [page, setPage] = useState(1);
  const pageSize = 50;

  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 500);
  const { currentLocale } = useLanguageStore();

  const convertedLocale = currentLocale === "en" ? "us" : currentLocale;

  // Data fetching for SEMrush keywords
  const {
    data: keywordsData,
    isLoading,
    error,
  } = useDomainKeywords(
    domain,
    page,
    pageSize,
    debouncedSearch,
    convertedLocale,
  );

  const keywords = keywordsData?.data || [];
  const pagination = keywordsData?.pagination;

  // Add sorting functionality for the first table
  const { sortedData, sortConfig, handleSort } = useTableSort(
    keywords as unknown as Record<string, unknown>[],
  );

  // Formatting functions
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSearch = (value: string) => {
    setSearchInput(value);
    setPage(1); // Reset to first page when searching
  };

  // Action handlers
  const handleCompetitionCheck = (keyword: string) => {
    router.push(
      `/positions/competition?keyword=${encodeURIComponent(keyword)}`,
    );
  };

  const handleSerpMachine = (keyword: string) => {
    router.push(`/serpmachine?keyword=${encodeURIComponent(keyword)}`);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center gap-4 justify-end">
        <div className="flex items-center gap-2 relative w-[300px]">
          <Search className="w-4 h-4 text-muted-foreground absolute left-2" />
          <Input
            placeholder={t("controls.searchPlaceholder")}
            value={searchInput}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-8"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : error ? (
        <div className="text-center text-red-500">
          {t("error", { message: (error as Error).message })}
        </div>
      ) : keywords.length === 0 ? (
        <div className="text-center text-muted-foreground">{t("noData")}</div>
      ) : (
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableTableHead
                  sortKey="keyword"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("table.keyword")}
                </SortableTableHead>
                <SortableTableHead
                  sortKey="position"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("table.position")}
                </SortableTableHead>
                <SortableTableHead
                  sortKey="traffic"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("table.traffic")}
                </SortableTableHead>
                <SortableTableHead
                  sortKey="trafficCost"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("table.trafficCost")}
                </SortableTableHead>
                <SortableTableHead
                  sortKey="searchVolume"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("table.volume")}
                </SortableTableHead>
                <SortableTableHead
                  sortKey="cpc"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("table.cpc")}
                </SortableTableHead>
                <SortableTableHead
                  sortKey="competition"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("table.competition")}
                </SortableTableHead>
                <TableHead>{t("table.rankingUrl")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((keyword, index) => {
                const typedKeyword = keyword as unknown as (typeof keywords)[0];
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2 justify-between">
                        <span>{typedKeyword.keyword}</span>
                        <div className="flex items-center gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() =>
                                    handleCompetitionCheck(typedKeyword.keyword)
                                  }
                                >
                                  <Target className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t("actions.competitionChecker")}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() =>
                                    handleSerpMachine(typedKeyword.keyword)
                                  }
                                >
                                  <History className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t("actions.serpMachine")}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {typedKeyword.position || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatPercentage(typedKeyword.traffic || 0)}
                    </TableCell>
                    <TableCell>
                      {formatPercentage(typedKeyword.trafficCost || 0)}
                    </TableCell>
                    <TableCell>
                      {formatNumber(typedKeyword.searchVolume || 0)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(typedKeyword.cpc || 0)}
                    </TableCell>
                    <TableCell>
                      {typedKeyword.competition?.toFixed(2) || "N/A"}
                    </TableCell>
                    <TableCell>
                      {typedKeyword.url ? (
                        <a
                          href={typedKeyword.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline truncate block max-w-[200px]"
                        >
                          {typedKeyword.url}
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <PaginationControls
            currentPage={page}
            totalPages={pagination?.pages || 1}
            totalCount={pagination?.total || 0}
            pageSize={pageSize}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
