"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  SortableTableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDomainTopBacklinks } from "@/hooks/features/sites/use-domain-top-backlinks";
import { useTableSort } from "@/hooks/use-table-sort";
import { useBacklinksFiltering } from "@/hooks/features/sites/use-backlinks-filtering";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { FilterableTableHeader } from "@/components/features/sites/domain/backlinks/filterable-table-header";
import { BacklinkTableRow } from "@/components/features/sites/domain/backlinks/backlink-table-row";
import { GoogleIndexStatusTracker } from "@/components/features/sites/domain/backlinks/google-index-status-tracker";

export default function DomainTopBacklinksPage() {
  const t = useTranslations("domainTopBacklinks");
  const params = useParams();
  const domain = params.domain as string;

  // Pagination state
  const [page, setPage] = useState(1);
  const pageSize = 100;

  // Use the custom filtering hook
  const {
    googleIndexFilter,
    flagFilters,
    googleIndexStatuses,
    handleGoogleIndexStatusChange,
    handleGoogleIndexClick,
    handleFlagClick,
    resetGoogleIndexFilter,
    resetFlagFilters,
    filterData,
  } = useBacklinksFiltering();

  // Fetch all data upfront (up to 1000 records)
  const {
    data: backlinksResponse,
    isLoading,
    error,
  } = useDomainTopBacklinks(domain, 0, 1000);

  const allBacklinksData = backlinksResponse?.data || [];

  // Add sorting functionality
  const { sortedData, sortConfig, handleSort } = useTableSort(
    allBacklinksData as unknown as Record<string, unknown>[],
  );

  // Filter the data using the custom hook
  const filteredData = filterData(sortedData);

  // Frontend pagination: slice the filtered data for current page
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Calculate pagination based on filtered data
  const filteredCount = filteredData.length;
  const totalPages = Math.ceil(filteredCount / pageSize);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [googleIndexFilter, flagFilters]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableTableHead
                sortKey="SourceURL"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("columns.sourceUrl")}
              </SortableTableHead>
              <SortableTableHead
                sortKey="AnchorText"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("columns.anchor")}
              </SortableTableHead>
              <SortableTableHead
                sortKey="keywordsCount"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("columns.keywords")}
              </SortableTableHead>
              <FilterableTableHeader
                title={t("columns.googleIndex")}
                activeFilter={googleIndexFilter}
                onResetFilter={resetGoogleIndexFilter}
                filterType="googleIndex"
              />
              <FilterableTableHeader
                title={`${t("columns.flag")}${flagFilters.size > 1 ? " (All)" : ""}`}
                activeFilter={flagFilters.size > 0 ? "active" : null}
                onResetFilter={resetFlagFilters}
                filterType="flag"
                flagFilters={flagFilters}
              />
              <SortableTableHead
                sortKey="LastSeenDate"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("columns.lastSeen")}
              </SortableTableHead>
              <SortableTableHead
                sortKey="SourceTopicalTrustFlow_Value_0"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("columns.tf")}
              </SortableTableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 10 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell className="truncate max-w-[300px]">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4 rounded" />
                      <Skeleton className="h-4 w-[180px]" />
                    </div>
                    <Skeleton className="h-3 w-[200px]" />
                  </div>
                </TableCell>
                <TableCell className="truncate max-w-[200px]">
                  <Skeleton className="h-4 w-[120px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-[50px] rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-[80px] rounded-full" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[80px]" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-8" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <PaginationControls
          currentPage={page}
          totalPages={totalPages}
          totalCount={filteredCount}
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
      {allBacklinksData && allBacklinksData.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <SortableTableHead
                sortKey="SourceURL"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("columns.sourceUrl")}
              </SortableTableHead>
              <SortableTableHead
                sortKey="AnchorText"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("columns.anchor")}
              </SortableTableHead>
              <SortableTableHead
                sortKey="keywordsCount"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("columns.keywords")}
              </SortableTableHead>
              <FilterableTableHeader
                title={t("columns.googleIndex")}
                activeFilter={googleIndexFilter}
                onResetFilter={resetGoogleIndexFilter}
                filterType="googleIndex"
              />
              <FilterableTableHeader
                title={`${t("columns.flag")}${flagFilters.size > 1 ? " (All)" : ""}`}
                activeFilter={flagFilters.size > 0 ? "active" : null}
                onResetFilter={resetFlagFilters}
                filterType="flag"
                flagFilters={flagFilters}
              />
              <SortableTableHead
                sortKey="LastSeenDate"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("columns.lastSeen")}
              </SortableTableHead>
              <SortableTableHead
                sortKey="SourceTopicalTrustFlow_Value_0"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("columns.tf")}
              </SortableTableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.map((backlink, index) => {
              const typedBacklink =
                backlink as unknown as (typeof allBacklinksData)[0];
              return (
                <BacklinkTableRow
                  key={index}
                  backlink={typedBacklink}
                  googleIndexStatuses={googleIndexStatuses}
                  googleIndexFilter={googleIndexFilter}
                  flagFilters={flagFilters}
                  onGoogleIndexClick={handleGoogleIndexClick}
                  onFlagClick={handleFlagClick}
                />
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
        totalCount={filteredCount}
        pageSize={pageSize}
        onPageChange={setPage}
      />

      {/* Hidden components to track Google Index status for each URL */}
      {allBacklinksData.map((backlink, index) => (
        <GoogleIndexStatusTracker
          key={`${backlink.SourceURL}-${index}`}
          url={backlink.SourceURL}
          onStatusChange={handleGoogleIndexStatusChange}
        />
      ))}
    </div>
  );
}
