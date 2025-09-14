"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  SortableTableHead,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { LayoutGrid } from "lucide-react";
import { useGetDomainBacklinks } from "@/hooks/features/sites/use-domain-backlinks";
import { useTableSort } from "@/hooks/use-table-sort";
import { FlagIcons } from "@/components/features/backlinks/flag-icons";
import { CmsIcon } from "@/components/features/backlinks/cms-icons";
import { Favicon } from "@/components/ui/favicon";
import { extractRootDomain } from "@/lib/utils/url-utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useFlagFilter } from "@/hooks/features/sites/use-flag-filter";
import { FilterableTableHeader } from "@/components/features/sites/domain/backlinks/filterable-table-header";

export function NewBacklinksTab({ isInWatchlist }: { isInWatchlist: boolean }) {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(100);
  const { domain } = useParams();
  const domainString = Array.isArray(domain) ? domain[0] : domain || "";
  const t = useTranslations("domainBacklinks");

  // Use the flag filtering hook
  const { flagFilters, handleFlagClick, resetFlagFilters } = useFlagFilter();

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [flagFilters]);

  const {
    data: newBacklinksData,
    isLoading: newBacklinksLoading,
    error: newBacklinksError,
  } = useGetDomainBacklinks(
    domainString,
    "new",
    page,
    pageSize,
    Array.from(flagFilters),
  );

  // Add sorting functionality
  const { sortedData, sortConfig, handleSort } = useTableSort(
    (newBacklinksData?.data as unknown as Record<string, unknown>[]) || [],
  );

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === "N/A") return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const renderUrl = (url: string) => {
    const rootDomain = extractRootDomain(url);
    return (
      <div className="flex items-center gap-2">
        <Favicon url={url} size={16} />
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline truncate max-w-[200px]"
        >
          {url}
        </a>
        {rootDomain && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() =>
                    window.open(
                      `/sites/${encodeURIComponent(rootDomain)}/view`,
                      "_blank",
                    )
                  }
                >
                  <LayoutGrid className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <span>View site details</span>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  };

  const renderTargetUrl = (url: string) => {
    return (
      <div className="flex items-center gap-2">
        <Favicon url={url} size={16} />
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline truncate max-w-[200px]"
        >
          {url}
        </a>
      </div>
    );
  };

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (newBacklinksLoading) {
    return (
      <div className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableTableHead
                sortKey="url"
                currentSortKey={null}
                currentDirection={null}
                onSort={() => {}}
              >
                {t("table.url")}
              </SortableTableHead>
              <SortableTableHead
                sortKey="cms"
                currentSortKey={null}
                currentDirection={null}
                onSort={() => {}}
              >
                {t("table.cms")}
              </SortableTableHead>
              <SortableTableHead
                sortKey="anchor"
                currentSortKey={null}
                currentDirection={null}
                onSort={() => {}}
              >
                {t("table.anchor")}
              </SortableTableHead>
              <SortableTableHead
                sortKey="flags"
                currentSortKey={null}
                currentDirection={null}
                onSort={() => {}}
              >
                {t("table.flags")}
              </SortableTableHead>
              <SortableTableHead
                sortKey="targetUrl"
                currentSortKey={null}
                currentDirection={null}
                onSort={() => {}}
              >
                {t("table.targetUrl")}
              </SortableTableHead>
              <SortableTableHead
                sortKey="ip"
                currentSortKey={null}
                currentDirection={null}
                onSort={() => {}}
              >
                {t("table.ip")}
              </SortableTableHead>
              <SortableTableHead
                sortKey="tf"
                currentSortKey={null}
                currentDirection={null}
                onSort={() => {}}
              >
                {t("table.tf")}
              </SortableTableHead>
              <SortableTableHead
                sortKey="cf"
                currentSortKey={null}
                currentDirection={null}
                onSort={() => {}}
              >
                {t("table.cf")}
              </SortableTableHead>
              <SortableTableHead
                sortKey="percentage"
                currentSortKey={null}
                currentDirection={null}
                onSort={() => {}}
              >
                {t("table.percentage")}
              </SortableTableHead>
              <SortableTableHead
                sortKey="foundDate"
                currentSortKey={null}
                currentDirection={null}
                onSort={() => {}}
              >
                {t("table.foundDate")}
              </SortableTableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-6 w-6 rounded" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-6 rounded" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Skeleton className="h-6 w-6 rounded" />
                    <Skeleton className="h-6 w-6 rounded" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-8" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-8" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-12" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (newBacklinksError) {
    return (
      <div className="text-center text-destructive py-8">{t("error")}</div>
    );
  }

  if (!newBacklinksData?.data || newBacklinksData.data.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8 space-y-2">
        <p>{t("noNewBacklinks")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!isInWatchlist && (
        <div className="text-sm text-muted-foreground">
          {t("newBacklinksDescription")}
        </div>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <SortableTableHead
              sortKey="url"
              currentSortKey={sortConfig?.key || null}
              currentDirection={sortConfig?.direction || null}
              onSort={handleSort}
            >
              {t("table.url")}
            </SortableTableHead>
            <SortableTableHead
              sortKey="cms"
              currentSortKey={sortConfig?.key || null}
              currentDirection={sortConfig?.direction || null}
              onSort={handleSort}
            >
              {t("table.cms")}
            </SortableTableHead>
            <SortableTableHead
              sortKey="anchor"
              currentSortKey={sortConfig?.key || null}
              currentDirection={sortConfig?.direction || null}
              onSort={handleSort}
            >
              {t("table.anchor")}
            </SortableTableHead>
            <FilterableTableHeader
              title={t("table.flags")}
              activeFilter={flagFilters.size > 0 ? "active" : null}
              onResetFilter={resetFlagFilters}
              filterType="flag"
              flagFilters={flagFilters}
            />
            <SortableTableHead
              sortKey="targetUrl"
              currentSortKey={sortConfig?.key || null}
              currentDirection={sortConfig?.direction || null}
              onSort={handleSort}
            >
              {t("table.targetUrl")}
            </SortableTableHead>
            <SortableTableHead
              sortKey="ip"
              currentSortKey={sortConfig?.key || null}
              currentDirection={sortConfig?.direction || null}
              onSort={handleSort}
            >
              {t("table.ip")}
            </SortableTableHead>
            <SortableTableHead
              sortKey="tf"
              currentSortKey={sortConfig?.key || null}
              currentDirection={sortConfig?.direction || null}
              onSort={handleSort}
            >
              {t("table.tf")}
            </SortableTableHead>
            <SortableTableHead
              sortKey="cf"
              currentSortKey={sortConfig?.key || null}
              currentDirection={sortConfig?.direction || null}
              onSort={handleSort}
            >
              {t("table.cf")}
            </SortableTableHead>
            <SortableTableHead
              sortKey="percentage"
              currentSortKey={sortConfig?.key || null}
              currentDirection={sortConfig?.direction || null}
              onSort={handleSort}
            >
              {t("table.percentage")}
            </SortableTableHead>
            <SortableTableHead
              sortKey="foundDate"
              currentSortKey={sortConfig?.key || null}
              currentDirection={sortConfig?.direction || null}
              onSort={handleSort}
            >
              {t("table.foundDate")}
            </SortableTableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((backlink, index) => {
            const typedBacklink =
              backlink as unknown as (typeof newBacklinksData.data)[0];
            return (
              <TableRow key={index}>
                <TableCell>{renderUrl(typedBacklink.url)}</TableCell>
                <TableCell>
                  <CmsIcon cms={typedBacklink.cms} />
                </TableCell>
                <TableCell
                  className="max-w-[200px] truncate"
                  title={typedBacklink.anchor}
                >
                  {typedBacklink.anchor || "[Empty]"}
                </TableCell>
                <TableCell>
                  <FlagIcons
                    Flags={typedBacklink.Flags}
                    onFlagClick={handleFlagClick}
                    activeFilters={flagFilters}
                  />
                </TableCell>
                <TableCell>
                  {renderTargetUrl(typedBacklink.targetUrl)}
                </TableCell>
                <TableCell>{typedBacklink.ip}</TableCell>
                <TableCell>{typedBacklink.tf}</TableCell>
                <TableCell>{typedBacklink.cf}</TableCell>
                <TableCell>{typedBacklink.percentage}%</TableCell>
                <TableCell>{formatDate(typedBacklink.foundDate)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <PaginationControls
        currentPage={page}
        totalPages={newBacklinksData?.pagination?.pages || 1}
        totalCount={newBacklinksData?.pagination?.total || 0}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
