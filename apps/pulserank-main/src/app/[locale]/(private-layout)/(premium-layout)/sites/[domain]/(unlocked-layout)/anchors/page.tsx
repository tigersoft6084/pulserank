"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  SortableTableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useGetDomainAnchors } from "@/hooks/features/sites/use-sites";
import { AnchorTextItem } from "@/types/api/majestic";
import { useTableSort } from "@/hooks/use-table-sort";

interface AnchorWithPercentages extends AnchorTextItem {
  refDomainsPercentage: number;
  totalLinksPercentage: number;
  refDomainsPercentageDisplay: number;
  totalLinksPercentageDisplay: number;
}

export default function DomainAnchorsPage() {
  const { domain } = useParams();
  const domainString = Array.isArray(domain) ? domain[0] : domain || "";
  const t = useTranslations("domainAnchors");

  const {
    data: anchorsData,
    isLoading,
    error,
  } = useGetDomainAnchors(domainString);

  // Calculate percentages for visualization
  const calculatePercentages = (
    data:
      | {
          data: AnchorTextItem[];
          totalBacklinks: number;
          totalRefDomains: number;
        }
      | undefined,
  ): AnchorWithPercentages[] => {
    if (!data?.data || data.data.length === 0) return [];

    // Calculate actual percentages first
    const itemsWithPercentages = data.data.map((item: AnchorTextItem) => ({
      ...item,
      refDomainsPercentage:
        data.totalRefDomains > 0
          ? (item.RefDomains / data.totalRefDomains) * 100
          : 0,
      totalLinksPercentage:
        data.totalBacklinks > 0
          ? (item.TotalLinks / data.totalBacklinks) * 100
          : 0,
    }));

    // Find maximum percentages for scaling
    const maxRefDomainsPercentage = Math.max(
      ...itemsWithPercentages.map((item) => item.refDomainsPercentage),
    );
    const maxTotalLinksPercentage = Math.max(
      ...itemsWithPercentages.map((item) => item.totalLinksPercentage),
    );

    // Scale percentages relative to maximum for progress bars, but keep original for display
    return itemsWithPercentages.map((item) => ({
      ...item,
      refDomainsPercentageDisplay: item.refDomainsPercentage,
      totalLinksPercentageDisplay: item.totalLinksPercentage,
      refDomainsPercentage:
        maxRefDomainsPercentage > 0
          ? (item.refDomainsPercentage / maxRefDomainsPercentage) * 100
          : 0,
      totalLinksPercentage:
        maxTotalLinksPercentage > 0
          ? (item.totalLinksPercentage / maxTotalLinksPercentage) * 100
          : 0,
    }));
  };

  const anchorsWithPercentages = anchorsData
    ? calculatePercentages(anchorsData)
    : [];

  // Add sorting functionality
  const { sortedData, sortConfig, handleSort } = useTableSort(
    anchorsWithPercentages as unknown as Record<string, unknown>[],
  );

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-card p-4 rounded-lg border">
              <div className="text-sm text-muted-foreground">
                {t("stats.totalBacklinks")}
              </div>
              <Skeleton className="h-8 w-20 mt-2" />
            </div>
            <div className="bg-card p-4 rounded-lg border">
              <div className="text-sm text-muted-foreground">
                {t("stats.totalRefDomains")}
              </div>
              <Skeleton className="h-8 w-20 mt-2" />
            </div>
            <div className="bg-card p-4 rounded-lg border">
              <div className="text-sm text-muted-foreground">
                {t("stats.uniqueAnchors")}
              </div>
              <Skeleton className="h-8 w-16 mt-2" />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <SortableTableHead
                  sortKey="AnchorText"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                  className="w-[40%]"
                >
                  {t("table.anchor")}
                </SortableTableHead>
                <SortableTableHead
                  sortKey="RefDomains"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("table.refDomains")}
                </SortableTableHead>
                <SortableTableHead
                  sortKey="TotalLinks"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("table.totalLinks")}
                </SortableTableHead>
                <SortableTableHead
                  sortKey="NoFollowLinks"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                  className="text-right w-20"
                >
                  {t("table.nofollow")}
                </SortableTableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 8 }).map((_, index) => (
                <TableRow
                  key={index}
                  className={index % 2 === 0 ? "bg-muted/5" : ""}
                >
                  <TableCell className="font-medium truncate max-w-[400px] py-4">
                    <Skeleton className="h-4 w-[200px]" />
                  </TableCell>
                  <TableCell className="relative py-0">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1 h-6 bg-muted rounded-sm overflow-hidden">
                        <Skeleton className="h-full w-[60%] rounded-sm" />
                      </div>
                      <span className="absolute left-6 text-sm">
                        <Skeleton className="h-4 w-8" />
                      </span>
                      <span className="absolute right-6 text-sm text-muted-foreground">
                        <Skeleton className="h-4 w-12" />
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="relative py-0">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1 h-6 bg-muted rounded-sm overflow-hidden">
                        <Skeleton className="h-full w-[40%] rounded-sm" />
                      </div>
                      <span className="absolute left-6 text-sm">
                        <Skeleton className="h-4 w-8" />
                      </span>
                      <span className="absolute right-6 text-sm text-muted-foreground">
                        <Skeleton className="h-4 w-12" />
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right py-0">
                    <Skeleton className="h-4 w-8 ml-auto" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : error ? (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {t("error")}
          </AlertDescription>
        </Alert>
      ) : anchorsData?.data && anchorsData.data.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-card p-4 rounded-lg border">
              <div className="text-sm text-muted-foreground">
                {t("stats.totalBacklinks")}
              </div>
              <div className="text-2xl font-bold">
                {anchorsData.totalBacklinks?.toLocaleString() || 0}
              </div>
            </div>
            <div className="bg-card p-4 rounded-lg border">
              <div className="text-sm text-muted-foreground">
                {t("stats.totalRefDomains")}
              </div>
              <div className="text-2xl font-bold">
                {anchorsData.totalRefDomains?.toLocaleString() || 0}
              </div>
            </div>
            <div className="bg-card p-4 rounded-lg border">
              <div className="text-sm text-muted-foreground">
                {t("stats.uniqueAnchors")}
              </div>
              <div className="text-2xl font-bold">
                {anchorsData.data.length}
              </div>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <SortableTableHead
                  sortKey="AnchorText"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                  className="w-[40%]"
                >
                  {t("table.anchor")}
                </SortableTableHead>
                <SortableTableHead
                  sortKey="RefDomains"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("table.refDomains")}
                </SortableTableHead>
                <SortableTableHead
                  sortKey="TotalLinks"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("table.totalLinks")}
                </SortableTableHead>
                <SortableTableHead
                  sortKey="NoFollowLinks"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                  className="text-right w-20"
                >
                  {t("table.nofollow")}
                </SortableTableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((anchor, index) => {
                const typedAnchor = anchor as unknown as AnchorWithPercentages;
                return (
                  <TableRow
                    key={index}
                    className={index % 2 === 0 ? "bg-muted/5" : ""}
                  >
                    <TableCell className="font-medium truncate max-w-[400px] py-4">
                      {typedAnchor.AnchorText || t("emptyAnchorText")}
                    </TableCell>
                    <TableCell className="relative py-0">
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1 h-6 bg-muted rounded-sm overflow-hidden">
                          <div
                            className="absolute top-0 left-0 h-full bg-blue-500/20 rounded-sm"
                            style={{
                              width: `${typedAnchor.refDomainsPercentage}%`,
                            }}
                          />
                        </div>
                        <span className="absolute left-6 text-sm">
                          {typedAnchor.RefDomains}
                        </span>
                        <span className="absolute right-6 text-sm text-muted-foreground">
                          {typedAnchor.refDomainsPercentageDisplay.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="relative py-0">
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1 h-6 bg-muted rounded-sm overflow-hidden">
                          <div
                            className="absolute top-0 left-0 h-full bg-blue-500/20 rounded-sm"
                            style={{
                              width: `${typedAnchor.totalLinksPercentage}%`,
                            }}
                          />
                        </div>
                        <span className="absolute left-6 text-sm">
                          {typedAnchor.TotalLinks}
                        </span>
                        <span className="absolute right-6 text-sm text-muted-foreground">
                          {typedAnchor.totalLinksPercentageDisplay.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right py-0">
                      {typedAnchor.NoFollowLinks}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          {t("noData", { domain: domainString })}
        </div>
      )}
    </div>
  );
}
