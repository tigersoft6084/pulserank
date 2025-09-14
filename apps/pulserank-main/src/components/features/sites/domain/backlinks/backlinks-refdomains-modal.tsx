"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { useGetDomainBacklinksRefDomains } from "@/hooks/features/sites/use-domain-backlinks-refdomains";
import { useTableSort } from "@/hooks/use-table-sort";
import { TTF_COLOR_DATA } from "@/lib/config";
import { FlagIcons } from "@/components/features/backlinks/flag-icons";
import { useFlagFilter } from "@/hooks/features/sites/use-flag-filter";
import { FilterableTableHeader } from "@/components/features/sites/domain/backlinks/filterable-table-header";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Favicon } from "@/components/ui/favicon";
import { useTranslations } from "next-intl";
import { BacklinkFlags } from "@/types/backlinks";

interface BacklinksRefDomainsModalProps {
  isOpen: boolean;
  onClose: () => void;
  domain: string;
  refDomain: string;
  count?: number;
}

export function BacklinksRefDomainsModal({
  isOpen,
  onClose,
  domain,
  refDomain,
  count = 10,
}: BacklinksRefDomainsModalProps) {
  const t = useTranslations("domainBacklinks.refDomainsModal");

  const {
    data: backlinksData,
    isLoading,
    error,
  } = useGetDomainBacklinksRefDomains(domain, refDomain, count);

  // Use the flag filtering hook
  const { flagFilters, handleFlagClick, resetFlagFilters, filterByFlags } =
    useFlagFilter();

  // Add sorting functionality
  const { sortedData, sortConfig, handleSort } = useTableSort(
    backlinksData?.data as unknown as Record<string, unknown>[],
  );

  // Apply flag filtering to the sorted data
  const filteredData = filterByFlags(
    sortedData as {
      Flags: BacklinkFlags;
    }[],
  );

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("title", { domain, refDomain })}</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex space-x-4">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[50px]" />
                  <Skeleton className="h-4 w-[50px]" />
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-[100px]" />
                </div>
              ))}
            </div>
          ) : error ? (
            <Alert className="border-red-200 bg-red-50">
              <AlertDescription className="text-red-800">
                {t("error")}
              </AlertDescription>
            </Alert>
          ) : backlinksData && backlinksData.data.length > 0 ? (
            <div className="rounded-md border overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableTableHead
                      sortKey="URL"
                      currentSortKey={sortConfig?.key || null}
                      currentDirection={sortConfig?.direction || null}
                      onSort={handleSort}
                    >
                      {t("columns.url")}
                    </SortableTableHead>
                    <SortableTableHead
                      sortKey="Anchor"
                      currentSortKey={sortConfig?.key || null}
                      currentDirection={sortConfig?.direction || null}
                      onSort={handleSort}
                    >
                      {t("columns.anchor")}
                    </SortableTableHead>
                    <FilterableTableHeader
                      title={t("columns.type")}
                      activeFilter={flagFilters.size > 0 ? "active" : null}
                      onResetFilter={resetFlagFilters}
                      filterType="flag"
                      flagFilters={flagFilters}
                    />
                    <SortableTableHead
                      sortKey="TF"
                      currentSortKey={sortConfig?.key || null}
                      currentDirection={sortConfig?.direction || null}
                      onSort={handleSort}
                    >
                      {t("columns.tf")}
                    </SortableTableHead>
                    <SortableTableHead
                      sortKey="CF"
                      currentSortKey={sortConfig?.key || null}
                      currentDirection={sortConfig?.direction || null}
                      onSort={handleSort}
                    >
                      {t("columns.cf")}
                    </SortableTableHead>
                    <SortableTableHead
                      sortKey="LastSeen"
                      currentSortKey={sortConfig?.key || null}
                      currentDirection={sortConfig?.direction || null}
                      onSort={handleSort}
                    >
                      {t("columns.lastSeen")}
                    </SortableTableHead>
                    <SortableTableHead
                      sortKey="Theme"
                      currentSortKey={sortConfig?.key || null}
                      currentDirection={sortConfig?.direction || null}
                      onSort={handleSort}
                    >
                      {t("columns.theme")}
                    </SortableTableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((backlink, index) => {
                    const typedBacklink =
                      backlink as unknown as (typeof backlinksData.data)[0];
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium truncate max-w-[200px]">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-2">
                                  <Favicon url={typedBacklink.URL} size={16} />
                                  <a
                                    href={typedBacklink.URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 underline"
                                  >
                                    {typedBacklink.URL}
                                  </a>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <span>{typedBacklink.URL}</span>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell className="truncate max-w-[150px]">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>{typedBacklink.Anchor || "N/A"}</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <span>{typedBacklink.Anchor || "N/A"}</span>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell>
                          <FlagIcons
                            Flags={typedBacklink.Flags}
                            onFlagClick={handleFlagClick}
                            activeFilters={flagFilters}
                          />
                        </TableCell>
                        <TableCell>{typedBacklink.TF}</TableCell>
                        <TableCell>{typedBacklink.CF}</TableCell>
                        <TableCell>
                          {formatDate(typedBacklink.LastSeen)}
                        </TableCell>
                        <TableCell>
                          {typedBacklink.Theme[0] !== "N/A" ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge
                                    style={{
                                      backgroundColor:
                                        TTF_COLOR_DATA[
                                          typedBacklink.Theme[0].split(
                                            "/",
                                          )[0] as keyof typeof TTF_COLOR_DATA
                                        ],
                                    }}
                                  >
                                    {typedBacklink.Theme[1]}{" "}
                                    {typedBacklink.Theme[0]}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <span>
                                    {typedBacklink.Theme[1]}{" "}
                                    {typedBacklink.Theme[0]}
                                  </span>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {t("noData")}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
