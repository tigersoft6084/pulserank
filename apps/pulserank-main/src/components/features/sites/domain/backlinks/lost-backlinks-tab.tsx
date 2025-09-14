"use client";

import { useState } from "react";
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
import { FlagIcons } from "@/components/features/backlinks/flag-icons";
import { Favicon } from "@/components/ui/favicon";
import { extractRootDomain } from "@/lib/utils/url-utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BacklinksRefDomainsModal } from "./backlinks-refdomains-modal";
import { useTableSort } from "@/hooks/use-table-sort";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { useFlagFilter } from "@/hooks/features/sites/use-flag-filter";
import { FilterableTableHeader } from "@/components/features/sites/domain/backlinks/filterable-table-header";
import { BacklinkFlags } from "@/types/backlinks";

export function LostBacklinksTab() {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(100);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRefDomain, setSelectedRefDomain] = useState<string>("");
  const { domain } = useParams();
  const domainString = Array.isArray(domain) ? domain[0] : domain || "";
  const t = useTranslations("domainBacklinks");

  const {
    data: lostBacklinksData,
    isLoading: lostBacklinksLoading,
    error: lostBacklinksError,
  } = useGetDomainBacklinks(domainString, "lost", page, pageSize);

  // Use the flag filtering hook
  const { flagFilters, handleFlagClick, resetFlagFilters, filterByFlags } =
    useFlagFilter();

  // Add sorting functionality
  const { sortedData, sortConfig, handleSort } = useTableSort(
    (lostBacklinksData?.data as unknown as Record<string, unknown>[]) || [],
  );

  // Apply flag filtering to the sorted data
  const filteredData = filterByFlags(
    sortedData as {
      Flags: BacklinkFlags;
    }[],
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

  const handleBacklinkLeftClick = (url: string) => {
    const rootDomain = extractRootDomain(url);
    if (rootDomain) {
      setSelectedRefDomain(rootDomain);
      setIsModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedRefDomain("");
  };

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (lostBacklinksLoading) {
    return (
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
              sortKey="seen"
              currentSortKey={null}
              currentDirection={null}
              onSort={() => {}}
            >
              {t("table.seen")}
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
              sortKey="backlinkLeft"
              currentSortKey={null}
              currentDirection={null}
              onSort={() => {}}
            >
              {t("table.backlinkLeft")}
            </SortableTableHead>
            <SortableTableHead
              sortKey="lastCrawl"
              currentSortKey={null}
              currentDirection={null}
              onSort={() => {}}
            >
              {t("table.lastCrawl")}
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
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Skeleton className="h-6 w-6 rounded" />
                  <Skeleton className="h-6 w-6 rounded" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-8" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  if (lostBacklinksError) {
    return (
      <div className="text-center text-destructive py-8">{t("error")}</div>
    );
  }

  if (!lostBacklinksData?.data || lostBacklinksData.data.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        {t("noLostBacklinks")}
      </div>
    );
  }

  return (
    <>
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
              sortKey="seen"
              currentSortKey={sortConfig?.key || null}
              currentDirection={sortConfig?.direction || null}
              onSort={handleSort}
            >
              {t("table.seen")}
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
              sortKey="backlinkLeft"
              currentSortKey={sortConfig?.key || null}
              currentDirection={sortConfig?.direction || null}
              onSort={handleSort}
            >
              {t("table.backlinkLeft")}
            </SortableTableHead>
            <SortableTableHead
              sortKey="lastCrawl"
              currentSortKey={sortConfig?.key || null}
              currentDirection={sortConfig?.direction || null}
              onSort={handleSort}
            >
              {t("table.lastCrawl")}
            </SortableTableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.map((backlink, index) => {
            const typedBacklink =
              backlink as unknown as (typeof lostBacklinksData.data)[0];
            return (
              <TableRow key={index}>
                <TableCell>{renderUrl(typedBacklink.url)}</TableCell>
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
                <TableCell>{formatDate(typedBacklink.seen)}</TableCell>
                <TableCell>{typedBacklink.tf}</TableCell>
                <TableCell>
                  <Button
                    variant="link"
                    className="h-6"
                    onClick={() => handleBacklinkLeftClick(typedBacklink.url)}
                  >
                    {typedBacklink.backlinkLeft}
                  </Button>
                </TableCell>
                <TableCell
                  className="max-w-[150px] truncate"
                  title={typedBacklink.lastCrawl}
                >
                  {typedBacklink.lastCrawl}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <PaginationControls
        currentPage={page}
        totalPages={lostBacklinksData?.pagination?.pages || 1}
        totalCount={lostBacklinksData?.pagination?.total || 0}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      />

      <BacklinksRefDomainsModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        domain={domainString}
        refDomain={selectedRefDomain}
        count={10}
      />
    </>
  );
}
