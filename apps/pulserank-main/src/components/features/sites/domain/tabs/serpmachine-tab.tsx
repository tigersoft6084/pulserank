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
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Target,
  History,
} from "lucide-react";
import { useSerpMachineKeywords } from "@/hooks/features/sites/use-serpmachine-keywords";
import { flagMap } from "@/lib/utils/flag-static-map";
import { baseToCountryCode } from "@/lib/utils/flag-utils";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTableSort } from "@/hooks/use-table-sort";

interface SerpmachineTabProps {
  domain: string;
}

export function SerpmachineTab({ domain }: SerpmachineTabProps) {
  const t = useTranslations("domainKeywords");
  const router = useRouter();

  // State for SERPmachine keywords tab
  const [serpPage, setSerpPage] = useState(1);
  const [serpPageSize] = useState(50);
  const [serpSearchInput, setSerpSearchInput] = useState("");

  // Data fetching for SERPmachine keywords
  const {
    data: serpKeywordsData,
    isLoading: serpIsLoading,
    error: serpError,
  } = useSerpMachineKeywords(
    domain,
    (serpPage - 1) * serpPageSize,
    serpPageSize,
  );

  const serpKeywords = serpKeywordsData?.data || [];
  const serpTotalCount = serpKeywordsData?.totalCount || 0;

  // Add sorting functionality for the SERP keywords table
  const {
    sortedData: sortedSerpData,
    sortConfig: serpSortConfig,
    handleSort: handleSerpSort,
  } = useTableSort(serpKeywords as unknown as Record<string, unknown>[]);

  // Formatting functions
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  // SERPmachine pagination handlers
  const handleSerpPageChange = (newPage: number) => {
    setSerpPage(newPage);
  };

  const handleSerpSearch = (value: string) => {
    setSerpSearchInput(value);
    setSerpPage(1);
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
      <div className="flex items-center gap-4 justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            {t("serpMachineKeywords")}
          </span>
        </div>

        <div className="flex items-center gap-2 relative w-[300px]">
          <Search className="w-4 h-4 text-muted-foreground absolute left-2" />
          <Input
            placeholder={t("controls.searchPlaceholder")}
            value={serpSearchInput}
            onChange={(e) => handleSerpSearch(e.target.value)}
            className="w-full pl-8"
          />
        </div>
      </div>

      {/* Table */}
      {serpIsLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : serpError ? (
        <div className="text-center text-red-500">
          {t("error", { message: (serpError as Error).message })}
        </div>
      ) : serpKeywords.length === 0 ? (
        <div className="text-center text-muted-foreground">
          {t("noSerpData")}
        </div>
      ) : (
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableTableHead
                  sortKey="keyword"
                  currentSortKey={serpSortConfig?.key || null}
                  currentDirection={serpSortConfig?.direction || null}
                  onSort={handleSerpSort}
                >
                  {t("table.keyword")}
                </SortableTableHead>
                <SortableTableHead
                  sortKey="position"
                  currentSortKey={serpSortConfig?.key || null}
                  currentDirection={serpSortConfig?.direction || null}
                  onSort={handleSerpSort}
                >
                  {t("table.position")}
                </SortableTableHead>
                <SortableTableHead
                  sortKey="traffic"
                  currentSortKey={serpSortConfig?.key || null}
                  currentDirection={serpSortConfig?.direction || null}
                  onSort={handleSerpSort}
                >
                  {t("table.traffic")}
                </SortableTableHead>
                <SortableTableHead
                  sortKey="searchVolume"
                  currentSortKey={serpSortConfig?.key || null}
                  currentDirection={serpSortConfig?.direction || null}
                  onSort={handleSerpSort}
                >
                  {t("table.volume")}
                </SortableTableHead>
                <SortableTableHead
                  sortKey="cpc"
                  currentSortKey={serpSortConfig?.key || null}
                  currentDirection={serpSortConfig?.direction || null}
                  onSort={handleSerpSort}
                >
                  {t("table.cpc")}
                </SortableTableHead>
                <SortableTableHead
                  sortKey="competition"
                  currentSortKey={serpSortConfig?.key || null}
                  currentDirection={serpSortConfig?.direction || null}
                  onSort={handleSerpSort}
                >
                  {t("table.competition")}
                </SortableTableHead>
                <TableHead>{t("table.rankingUrl")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSerpData.map((keyword, index) => {
                const typedKeyword =
                  keyword as unknown as (typeof serpKeywords)[0];
                // Get flag component for the keyword base
                const countryCode = baseToCountryCode[typedKeyword.base];
                const Flag = countryCode ? flagMap[countryCode] : null;

                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2 justify-between">
                        <div className="flex items-center gap-2">
                          {Flag && (
                            <Flag title={countryCode} className="w-4 h-3" />
                          )}
                          <span>{typedKeyword.keyword}</span>
                        </div>
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
                    <TableCell>{typedKeyword.traffic || 0}</TableCell>
                    <TableCell>
                      {formatNumber(typedKeyword.searchVolume)}
                    </TableCell>
                    <TableCell>{formatCurrency(typedKeyword.cpc)}</TableCell>
                    <TableCell>
                      {typedKeyword.competition?.toFixed(2) || "N/A"}
                    </TableCell>
                    <TableCell>
                      {typedKeyword.rankingUrl ? (
                        <a
                          href={typedKeyword.rankingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline truncate block max-w-[200px]"
                        >
                          {typedKeyword.rankingUrl}
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

          {/* SERPmachine Pagination */}
          {serpTotalCount > serpPageSize && (
            <div className="flex flex-row justify-between mt-6">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSerpPageChange(1)}
                  disabled={serpPage === 1}
                  className="w-8 h-8 p-0"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSerpPageChange(serpPage - 1)}
                  disabled={serpPage === 1}
                  className="w-8 h-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <span className="text-sm text-muted-foreground">
                  {t("pagination.page", {
                    current: serpPage,
                    total: Math.ceil(serpTotalCount / serpPageSize),
                  })}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSerpPageChange(serpPage + 1)}
                  disabled={
                    serpPage >= Math.ceil(serpTotalCount / serpPageSize)
                  }
                  className="w-8 h-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleSerpPageChange(
                      Math.ceil(serpTotalCount / serpPageSize),
                    )
                  }
                  disabled={
                    serpPage >= Math.ceil(serpTotalCount / serpPageSize)
                  }
                  className="w-8 h-8 p-0"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-sm text-muted-foreground">
                {t("pagination.showing")} {(serpPage - 1) * serpPageSize + 1}{" "}
                {t("pagination.to")}{" "}
                {Math.min(serpPage * serpPageSize, serpTotalCount)}{" "}
                {t("pagination.of")} {serpTotalCount} {t("pagination.results")}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
