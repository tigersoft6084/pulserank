"use client";

import { useTranslations } from "next-intl";
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
import { FlagIcons } from "./flag-icons";
import { TTF_COLOR_DATA } from "@/lib/config";
import { useTableSort } from "@/hooks/use-table-sort";
import { useGetLatestBacklinks } from "@/hooks/features/backlinks/use-backlink";
import { Skeleton } from "@/components/ui/skeleton";
import { useFlagFilter } from "@/hooks/features/sites/use-flag-filter";
import { BacklinkFlags } from "@/types/backlinks";
import { FilterableTableHeader } from "@/components/features/sites/domain/backlinks/filterable-table-header";

interface LatestBacklinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  urls: string[];
}

export function LatestBacklinksModal({
  isOpen,
  onClose,
  urls,
}: LatestBacklinksModalProps) {
  const t = useTranslations("serpBacklinks.latestBacklinks");
  const { data: backlinksData, isLoading, error } = useGetLatestBacklinks(urls);

  // Use the flag filtering hook
  const { flagFilters, handleFlagClick, resetFlagFilters, filterByFlags } =
    useFlagFilter();

  // Add sorting functionality
  const { sortedData, sortConfig, handleSort } = useTableSort(
    backlinksData as unknown as Record<string, unknown>[],
  );

  // Apply flag filtering to the sorted data
  const filteredData = filterByFlags(
    sortedData as {
      Flags: BacklinkFlags;
    }[],
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex space-x-4">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-4 w-[200px]" />
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
          ) : backlinksData && backlinksData.length > 0 ? (
            <div className="rounded-md border overflow-y-auto">
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
                      sortKey="Anchor"
                      currentSortKey={sortConfig?.key || null}
                      currentDirection={sortConfig?.direction || null}
                      onSort={handleSort}
                    >
                      {t("columns.anchor")}
                    </SortableTableHead>
                    <SortableTableHead
                      sortKey="TargetURL"
                      currentSortKey={sortConfig?.key || null}
                      currentDirection={sortConfig?.direction || null}
                      onSort={handleSort}
                    >
                      {t("columns.targetUrl")}
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
                    <TableHead>{t("columns.theme")}</TableHead>
                    <SortableTableHead
                      sortKey="Discovered"
                      currentSortKey={sortConfig?.key || null}
                      currentDirection={sortConfig?.direction || null}
                      onSort={handleSort}
                    >
                      {t("columns.discovered")}
                    </SortableTableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((backlink, index) => {
                    const typedBacklink =
                      backlink as unknown as (typeof backlinksData)[0];
                    return (
                      <TableRow key={index}>
                        <TableCell className="truncate font-medium max-w-[200px]">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-2">
                                  <Favicon
                                    url={typedBacklink.SourceURL}
                                    size={16}
                                  />
                                  <a
                                    href={typedBacklink.SourceURL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 underline"
                                  >
                                    {typedBacklink.SourceURL}
                                  </a>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <span>{typedBacklink.SourceURL}</span>
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
                        <TableCell className="truncate max-w-[200px]">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-2">
                                  <Favicon
                                    url={typedBacklink.TargetURL}
                                    size={16}
                                  />
                                  <a
                                    href={typedBacklink.TargetURL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 underline"
                                  >
                                    {typedBacklink.TargetURL}
                                  </a>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <span>{typedBacklink.TargetURL}</span>
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
                        <TableCell className="truncate max-w-[200px]">
                          {typedBacklink.Theme[0] && typedBacklink.Theme[1] ? (
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
                                    {typedBacklink.Theme[0] &&
                                    typedBacklink.Theme[1]
                                      ? `${typedBacklink.Theme[1]} ${typedBacklink.Theme[0]}`
                                      : "N/A"}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <span>
                                    {typedBacklink.Theme[0] &&
                                    typedBacklink.Theme[1]
                                      ? `${typedBacklink.Theme[1]} ${typedBacklink.Theme[0]}`
                                      : "N/A"}
                                  </span>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            "N/A"
                          )}
                        </TableCell>
                        <TableCell>{typedBacklink.Discovered}</TableCell>
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
