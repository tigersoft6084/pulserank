"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  SortableTableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PropertiesIcons } from "@/components/features/serp/properties-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Target, History } from "lucide-react";
import {
  UrlKeyword,
  useUrlKeywords,
} from "@/hooks/features/urls/use-url-keywords";
import { flagMap } from "@/lib/utils/flag-static-map";
import { baseToCountryCode } from "@/lib/utils/flag-utils";
import { useTableSort } from "@/hooks/use-table-sort";
import { UrlInput } from "@/components/features/urls/url-input";
import { useViewUrlStore } from "@/store/view-url-store";
import { PaginationControls } from "@/components/ui/pagination-controls";

export default function UrlKeywordsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("urlKeywords");

  // Use shared URL store like other pages
  const { url, submittedUrl, setUrl, setSubmittedUrl } = useViewUrlStore();

  // Handle URL from query parameters (only if not already set in store)
  useEffect(() => {
    const urlFromParams = searchParams.get("url");
    if (urlFromParams && !submittedUrl) {
      setUrl(urlFromParams);
      setSubmittedUrl(urlFromParams);
    }
  }, [searchParams, submittedUrl, setUrl, setSubmittedUrl]);

  // Pagination state
  const [page, setPage] = useState(1);
  const pageSize = 100;

  const {
    data: keywordsResponse,
    isLoading,
    error,
  } = useUrlKeywords(submittedUrl, (page - 1) * pageSize, pageSize);

  const keywordsData = keywordsResponse?.data || [];
  const totalCount = keywordsResponse?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Add sorting functionality
  const { sortedData, sortConfig, handleSort } = useTableSort(
    keywordsData as unknown as Record<string, unknown>[],
  );

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  // Handle form submission
  const handleSubmit = (submittedUrl: string) => {
    setSubmittedUrl(submittedUrl);
    setPage(1); // Reset to first page when submitting new URL
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
      <UrlInput
        url={url}
        onUrlChange={setUrl}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        submitButtonText={t("search")}
        placeholder="https://..."
      />

      {!submittedUrl ? (
        <div className="text-center py-8 text-muted-foreground">
          {t("enterUrl")}
        </div>
      ) : isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex space-x-4">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[50px]" />
              <Skeleton className="h-4 w-[80px]" />
              <Skeleton className="h-4 w-[80px]" />
              <Skeleton className="h-4 w-[80px]" />
              <Skeleton className="h-4 w-[80px]" />
              <Skeleton className="h-4 w-[80px]" />
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-[80px]" />
            </div>
          ))}
        </div>
      ) : error ? (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {t("error")}
          </AlertDescription>
        </Alert>
      ) : keywordsData && keywordsData.length > 0 ? (
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
                sortKey="position"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("columns.position")}
              </SortableTableHead>
              <SortableTableHead
                sortKey="traffic"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("columns.traffic")}
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
              <SortableTableHead
                sortKey="interest"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("columns.interest")}
              </SortableTableHead>
              <SortableTableHead
                sortKey="properties"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("columns.properties")}
              </SortableTableHead>
              <SortableTableHead
                sortKey="actions"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("columns.actions")}
              </SortableTableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((keyword, index) => {
              const typedKeyword = keyword as unknown as UrlKeyword;
              // Get flag component for the keyword base
              const countryCode = baseToCountryCode[typedKeyword.base];
              const Flag = countryCode ? flagMap[countryCode] : null;

              return (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {Flag && <Flag title={countryCode} className="w-4 h-3" />}
                      <span>{typedKeyword.keyword}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {typedKeyword.position || "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatNumber(typedKeyword.traffic)}</TableCell>
                  <TableCell>
                    {formatNumber(typedKeyword.searchVolume)}
                  </TableCell>
                  <TableCell>{formatCurrency(typedKeyword.cpc)}</TableCell>
                  <TableCell>{typedKeyword.competition}</TableCell>
                  <TableCell>{typedKeyword.interest}</TableCell>
                  <TableCell>
                    <PropertiesIcons properties={typedKeyword.properties} />
                  </TableCell>
                  <TableCell>
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
                            <p>{t("tooltips.competitionChecker")}</p>
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
                            <p>{t("tooltips.serpMachine")}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          {t("noData")}
        </div>
      )}

      <PaginationControls
        currentPage={page}
        totalPages={totalPages}
        totalCount={totalCount}
        pageSize={pageSize}
        onPageChange={setPage}
      />
    </div>
  );
}
