import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  SortableTableHead,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useSubdomainOrganic } from "@/hooks/features/sites/use-subdomain-organic";
import { useBulkUrlInfo } from "@/hooks/features/urls/use-bulk-url-info";
import { useTableSort } from "@/hooks/use-table-sort";
import { SubdomainOrganicData } from "@/types/api/semrush";
import { TTF_COLOR_DATA } from "@/lib/config";
import { PaginationControls } from "@/components/ui/pagination-controls";

interface SemrushUrlTabProps {
  domain: string;
}

interface CombinedUrlData extends SubdomainOrganicData {
  title?: string;
  refDomains?: number;
  topicalTrustFlowTopic?: string;
  topicalTrustFlowValue?: number;
}

export function SemrushUrlTab({ domain }: SemrushUrlTabProps) {
  const t = useTranslations("domainKeywords");

  // State for SEMrush URLs tab
  const [page, setPage] = useState(1);
  const pageSize = 50;

  // Data fetching for SEMrush subdomain organic data
  const {
    data: subdomainData,
    isLoading: semrushLoading,
    error: semrushError,
  } = useSubdomainOrganic(domain, page, pageSize, "us");

  const urls = subdomainData?.data || [];
  const pagination = subdomainData?.pagination;

  // Extract URLs for Majestic API call
  const urlList = useMemo(
    () => urls.map((item: SubdomainOrganicData) => item.url),
    [urls],
  );

  // Fetch Majestic data for the URLs
  const {
    data: majesticData,
    isLoading: majesticLoading,
    error: majesticError,
  } = useBulkUrlInfo(urlList);

  // Combine SEMrush and Majestic data
  const combinedData = useMemo(() => {
    if (!urls.length || !majesticData) return [];

    return urls.map((semrushItem: SubdomainOrganicData) => {
      const majesticItem = majesticData.find(
        (majestic: {
          URL: string;
          Title: string;
          RefDomains: number;
          TopicalTrustFlow_Topic_0: string;
          TopicalTrustFlow_Value_0: number;
        }) => majestic.URL === semrushItem.url,
      );

      return {
        ...semrushItem,
        title: majesticItem?.Title || "N/A",
        refDomains: majesticItem?.RefDomains || 0,
        topicalTrustFlowTopic: majesticItem?.TopicalTrustFlow_Topic_0 || "",
        topicalTrustFlowValue: majesticItem?.TopicalTrustFlow_Value_0 || 0,
      } as CombinedUrlData;
    });
  }, [urls, majesticData]);

  // Add sorting functionality
  const { sortedData, sortConfig, handleSort } = useTableSort(
    combinedData as unknown as Record<string, unknown>[],
  );

  // Formatting functions
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  // Loading and error states
  const isLoading = semrushLoading || majesticLoading;
  const error = semrushError || majesticError;

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="space-y-6">
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
      ) : combinedData.length === 0 ? (
        <div className="text-center text-muted-foreground">{t("noData")}</div>
      ) : (
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableTableHead
                  sortKey="url"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  Url
                </SortableTableHead>
                <SortableTableHead
                  sortKey="title"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  Title
                </SortableTableHead>
                <SortableTableHead
                  sortKey="refDomains"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  RefDomains
                </SortableTableHead>
                <SortableTableHead
                  sortKey="trustFlow"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  Theme
                </SortableTableHead>
                <SortableTableHead
                  sortKey="nbKeywords"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  NbKeywords
                </SortableTableHead>
                <SortableTableHead
                  sortKey="volume"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  Volume
                </SortableTableHead>
                <SortableTableHead
                  sortKey="trafficPercent"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  Traffic (%)
                </SortableTableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((urlData, index) => {
                const typedUrlData = urlData as unknown as CombinedUrlData;
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {typedUrlData.url ? (
                        <a
                          href={typedUrlData.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline truncate block max-w-[200px]"
                        >
                          {typedUrlData.url}
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="truncate max-w-[300px]">
                        {typedUrlData.title || "N/A"}
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatNumber(typedUrlData.refDomains || 0)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        style={{
                          backgroundColor:
                            TTF_COLOR_DATA[
                              typedUrlData.topicalTrustFlowTopic?.split(
                                "/",
                              )[0] as keyof typeof TTF_COLOR_DATA
                            ] || "#6B7280",
                        }}
                      >
                        {typedUrlData.topicalTrustFlowValue || "N/A"}{" "}
                        {typedUrlData.topicalTrustFlowTopic}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatNumber(typedUrlData.nbKeywords)}
                    </TableCell>
                    <TableCell>{formatNumber(typedUrlData.volume)}</TableCell>
                    <TableCell>
                      {formatPercentage(typedUrlData.trafficPercent)}
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
