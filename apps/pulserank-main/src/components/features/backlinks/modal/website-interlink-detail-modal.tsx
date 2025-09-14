"use client";

import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Favicon } from "@/components/ui/favicon";
import {
  Table,
  TableBody,
  TableCell,
  SortableTableHead,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FlagIcons } from "../flag-icons";
import { TTF_COLOR_DATA } from "@/lib/config";
import { useTableSort } from "@/hooks/use-table-sort";
import { WebsiteInterlinkDetail } from "@/types/backlinks";
import { useFlagFilter } from "@/hooks/features/sites/use-flag-filter";
import { FilterableTableHeader } from "@/components/features/sites/domain/backlinks/filterable-table-header";
import { BacklinkFlags } from "@/types/backlinks";

interface WebsiteInterlinkDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string | null;
  interlinkDetails: WebsiteInterlinkDetail[];
  isLoading: boolean;
  error: string | null;
}

export function WebsiteInterlinkDetailModal({
  isOpen,
  onClose,
  url,
  interlinkDetails,
  isLoading,
  error,
}: WebsiteInterlinkDetailModalProps) {
  const t = useTranslations("websiteInterlink.detailModal");

  // Use the flag filtering hook
  const { flagFilters, handleFlagClick, resetFlagFilters, filterByFlags } =
    useFlagFilter();

  // Add sorting functionality
  const { sortedData, sortConfig, handleSort } = useTableSort(
    interlinkDetails as unknown as Record<string, unknown>[],
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
          <DialogTitle>{t("title", { url: url || "" })}</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex space-x-4">
                  <Skeleton className="h-4 w-[200px]" />
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
          ) : interlinkDetails && interlinkDetails.length > 0 ? (
            <div className="rounded-md border overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableTableHead
                      sortKey="Source"
                      currentSortKey={sortConfig?.key || null}
                      currentDirection={sortConfig?.direction || null}
                      onSort={handleSort}
                    >
                      {t("columns.source")}
                    </SortableTableHead>
                    <SortableTableHead
                      sortKey="Target"
                      currentSortKey={sortConfig?.key || null}
                      currentDirection={sortConfig?.direction || null}
                      onSort={handleSort}
                    >
                      {t("columns.target")}
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
                      sortKey="LastCrawl"
                      currentSortKey={sortConfig?.key || null}
                      currentDirection={sortConfig?.direction || null}
                      onSort={handleSort}
                    >
                      {t("columns.lastCrawl")}
                    </SortableTableHead>
                    <TableHead>{t("columns.theme")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((detail, index) => {
                    const typedDetail =
                      detail as unknown as WebsiteInterlinkDetail;
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium truncate max-w-[200px]">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-2">
                                  <Favicon url={typedDetail.Source} size={16} />
                                  <a
                                    href={typedDetail.Source}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 underline"
                                  >
                                    {typedDetail.Source}
                                  </a>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <span>{typedDetail.Source}</span>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell className="truncate max-w-[200px]">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-2">
                                  <Favicon url={typedDetail.Target} size={16} />
                                  <a
                                    href={typedDetail.Target}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 underline"
                                  >
                                    {typedDetail.Target}
                                  </a>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <span>{typedDetail.Target}</span>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell className="truncate max-w-[150px]">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>{typedDetail.Anchor || "N/A"}</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <span>{typedDetail.Anchor || "N/A"}</span>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell>
                          <FlagIcons
                            Flags={typedDetail.Flags}
                            onFlagClick={handleFlagClick}
                            activeFilters={flagFilters}
                          />
                        </TableCell>
                        <TableCell>{typedDetail.TF || "-1"}</TableCell>
                        <TableCell>{typedDetail.CF || "-1"}</TableCell>
                        <TableCell>
                          {formatDate(typedDetail.LastCrawl)}
                        </TableCell>
                        <TableCell>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge
                                  style={{
                                    backgroundColor:
                                      TTF_COLOR_DATA[
                                        typedDetail.Theme[0].split(
                                          "/",
                                        )[0] as keyof typeof TTF_COLOR_DATA
                                      ],
                                  }}
                                >
                                  {typedDetail.Theme[1]} {typedDetail.Theme[0]}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <span>
                                  {typedDetail.Theme[1]} {typedDetail.Theme[0]}
                                </span>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
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
