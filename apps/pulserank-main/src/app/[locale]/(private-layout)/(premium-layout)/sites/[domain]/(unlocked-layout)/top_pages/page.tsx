"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  SortableTableHead,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TTF_COLOR_DATA } from "@/lib/config";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Favicon } from "@/components/ui/favicon";

import { useDomainTopPages } from "@/hooks/features/sites/use-domain-top-pages";
import { useTableSort } from "@/hooks/use-table-sort";
import { PaginationControls } from "@/components/ui/pagination-controls";

export default function DomainTopPagesPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("domainTopPages");
  const domain = params.domain as string;

  // Pagination state
  const [page, setPage] = useState(1);
  const pageSize = 100;

  const {
    data: topPagesResponse,
    isLoading,
    error,
  } = useDomainTopPages(domain, (page - 1) * pageSize, pageSize);

  const topPagesData = topPagesResponse?.data || [];
  const totalCount = topPagesResponse?.totalCount || 1000;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Add sorting functionality
  const { sortedData, sortConfig, handleSort } = useTableSort(
    topPagesData as unknown as Record<string, unknown>[],
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const getTitleFromURL = (url: string) => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      if (pathname === "/" || pathname === "") {
        return "Homepage";
      }
      // Extract title from pathname
      const segments = pathname.split("/").filter(Boolean);
      if (segments.length === 0) return "Homepage";

      // Convert path segments to title case
      const title = segments
        .map((segment) =>
          segment
            .replace(/[-_]/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase()),
        )
        .join(" > ");

      return title;
    } catch {
      return "Unknown";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableTableHead
                sortKey="URL"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("columns.titleAndUrl")}
              </SortableTableHead>
              <SortableTableHead
                sortKey="TrustFlow"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                TF
              </SortableTableHead>
              <SortableTableHead
                sortKey="CitationFlow"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                CF
              </SortableTableHead>
              <SortableTableHead
                sortKey="RefDomains"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                RD
              </SortableTableHead>
              <SortableTableHead
                sortKey="RefIPs"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                IPs
              </SortableTableHead>
              <SortableTableHead
                sortKey="TopicalTrustFlow_Value_0"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("columns.topicalTrustFlow")}
              </SortableTableHead>
              <SortableTableHead
                sortKey="Keywords"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("columns.keywords")}
              </SortableTableHead>
              <SortableTableHead
                sortKey="lastCrawlResult"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("columns.lastCrawlResult")}
              </SortableTableHead>
              <SortableTableHead
                sortKey="lastCrawlDate"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("columns.lastCrawlDate")}
              </SortableTableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(10)].map((_, i) => (
              <TableRow key={i}>
                <TableCell className="truncate max-w-[300px]">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 w-[120px]" />
                    </div>
                    <Skeleton className="h-3 w-[200px]" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-8" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-8" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-8" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-8" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-[80px] rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-[60px] rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[60px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[80px]" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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

  if (error) {
    return (
      <div className="space-y-6">
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {t("error")}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {topPagesData && topPagesData.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <SortableTableHead
                sortKey="URL"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("columns.titleAndUrl")}
              </SortableTableHead>
              <SortableTableHead
                sortKey="TrustFlow"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                TF
              </SortableTableHead>
              <SortableTableHead
                sortKey="CitationFlow"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                CF
              </SortableTableHead>
              <SortableTableHead
                sortKey="RefDomains"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                RD
              </SortableTableHead>
              <SortableTableHead
                sortKey="RefIPs"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                IPs
              </SortableTableHead>
              <SortableTableHead
                sortKey="TopicalTrustFlow_Value_0"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("columns.topicalTrustFlow")}
              </SortableTableHead>
              <SortableTableHead
                sortKey="Keywords"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("columns.keywords")}
              </SortableTableHead>
              <SortableTableHead
                sortKey="lastCrawlResult"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("columns.lastCrawlResult")}
              </SortableTableHead>
              <SortableTableHead
                sortKey="lastCrawlDate"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("columns.lastCrawlDate")}
              </SortableTableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((topPage, index) => {
              const typedTopPage =
                topPage as unknown as (typeof topPagesData)[0];
              return (
                <TableRow key={index}>
                  <TableCell className="truncate max-w-[300px]">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <Favicon url={typedTopPage.URL} size={16} />
                              <span className="font-medium text-sm">
                                {getTitleFromURL(typedTopPage.URL)}
                              </span>
                            </div>
                            <a
                              href={typedTopPage.URL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline text-xs"
                            >
                              {typedTopPage.URL}
                            </a>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="max-w-xs">
                            <div className="font-medium">
                              {getTitleFromURL(typedTopPage.URL)}
                            </div>
                            <div className="text-xs">{typedTopPage.URL}</div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>{typedTopPage.TrustFlow}</TableCell>
                  <TableCell>{typedTopPage.CitationFlow}</TableCell>
                  <TableCell>{typedTopPage.RefDomains}</TableCell>
                  <TableCell>{typedTopPage.RefIPs}</TableCell>
                  <TableCell>
                    <Badge
                      style={{
                        backgroundColor:
                          TTF_COLOR_DATA[
                            typedTopPage.TopicalTrustFlow_Topic_0.split(
                              "/",
                            )[0] as keyof typeof TTF_COLOR_DATA
                          ],
                      }}
                    >
                      {typedTopPage.TopicalTrustFlow_Topic_0}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="cursor-pointer hover:bg-secondary/80"
                      onClick={() => {
                        router.push(
                          `/urls/keywords?url=${encodeURIComponent(typedTopPage.URL)}`,
                        );
                      }}
                    >
                      {typedTopPage.Keywords}
                    </Badge>
                  </TableCell>
                  <TableCell>{typedTopPage.LastCrawlResult}</TableCell>

                  <TableCell>
                    {formatDate(typedTopPage.LastCrawlDate)}
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
