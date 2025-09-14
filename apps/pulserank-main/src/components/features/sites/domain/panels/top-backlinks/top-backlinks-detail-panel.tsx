"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  SortableTableHead,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Favicon } from "@/components/ui/favicon";
import { ExternalLink, Lock } from "lucide-react";
import { FlagIcons } from "@/components/features/backlinks/flag-icons";
import { TTF_COLOR_DATA } from "@/lib/config";
import { useTranslations } from "next-intl";
import { DomainTopBacklinksResponse } from "@/hooks/features/sites/use-domain-top-backlinks";
import { useUnlockDomain } from "@/hooks/features/user/use-unlocked-domains";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useTableSort } from "@/hooks/use-table-sort";
import { useFlagFilter } from "@/hooks/features/sites/use-flag-filter";
import { FilterableTableHeader } from "@/components/features/sites/domain/backlinks/filterable-table-header";
import { BacklinkFlags } from "@/types/backlinks";

interface DomainTopBacklinksDetailPanelProps {
  domain: string;
  topBacklinksData?: DomainTopBacklinksResponse;
  topBacklinksLoading: boolean;
  isUnlocked: boolean;
}

export function DomainTopBacklinksDetailPanel({
  domain,
  topBacklinksData,
  topBacklinksLoading,
  isUnlocked,
}: DomainTopBacklinksDetailPanelProps) {
  const router = useRouter();
  const t = useTranslations("identityCard.topBacklinksPanel");

  const {
    mutate: unlockDomain,
    isPending: unlockingDomain,
    isSuccess: unlockedDomain,
    isError: unlockingDomainError,
    error: unlockingDomainErrorData,
  } = useUnlockDomain();

  // Use the flag filtering hook
  const { flagFilters, handleFlagClick, resetFlagFilters, filterByFlags } =
    useFlagFilter();

  // Add sorting functionality
  const { sortedData, sortConfig, handleSort } = useTableSort(
    topBacklinksData?.data as unknown as Record<string, unknown>[],
  );

  // Apply flag filtering to the sorted data
  const filteredData = filterByFlags(
    sortedData as {
      Flags: BacklinkFlags;
    }[],
  );

  const handleGoToTopBacklinks = () => {
    // We need to get the domain from the current route
    if (typeof window !== "undefined") {
      const pathSegments = window.location.pathname.split("/");
      const domainIndex =
        pathSegments.findIndex((segment) => segment === "sites") + 1;
      const domain = pathSegments[domainIndex];
      router.push(`/sites/${domain}/top`);
    }
  };

  const handleUnlockDomainAndGoToTopBacklinks = () => {
    unlockDomain(domain);
    handleGoToTopBacklinks();
  };

  useEffect(() => {
    if (unlockedDomain) {
      toast({
        title: "Success",
        description: "Domain unlocked",
      });
    }
    if (unlockingDomainError) {
      toast({
        title: "Error",
        description: unlockingDomainErrorData?.message,
        variant: "destructive",
      });
    }
  }, [unlockedDomain, unlockingDomainError, unlockingDomainErrorData, toast]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  if (topBacklinksLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t("loading")}
      </div>
    );
  }

  if (!topBacklinksData?.data || topBacklinksData.data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t("noData")}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {t("summary", {
            showing: topBacklinksData.data.length,
            total: topBacklinksData.totalCount,
          })}
        </div>
        {isUnlocked ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleGoToTopBacklinks}
            className="flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            {t("goToDetails")}
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleUnlockDomainAndGoToTopBacklinks}
            disabled={unlockingDomain}
          >
            <Lock className="w-4 h-4" />
            {t("unlockAdvancedView")}
          </Button>
        )}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <SortableTableHead
              sortKey="SourceURL"
              currentSortKey={sortConfig?.key || null}
              currentDirection={sortConfig?.direction || null}
              onSort={handleSort}
              className="w-[50%]"
            >
              {t("columns.url")}
            </SortableTableHead>
            <FilterableTableHeader
              title={t("columns.flag")}
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
          {filteredData.map((backlink, index) => {
            const typedBacklink =
              backlink as unknown as (typeof topBacklinksData.data)[0];
            return (
              <TableRow
                key={index}
                className={index % 2 === 0 ? "bg-muted/5" : ""}
              >
                <TableCell className="max-w-[300px]">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Favicon url={typedBacklink.SourceURL} size={16} />
                      <a
                        href={typedBacklink.SourceURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline text-sm truncate"
                      >
                        {typedBacklink.SourceURL}
                      </a>
                    </div>
                    {typedBacklink.AnchorText ? (
                      <div
                        className="text-xs text-muted-foreground truncate max-w-[280px]"
                        title={typedBacklink.AnchorText}
                      >
                        {typedBacklink.AnchorText}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground truncate max-w-[280px]">
                        N/A
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <FlagIcons
                    Flags={typedBacklink.Flags}
                    onFlagClick={handleFlagClick}
                    activeFilters={flagFilters}
                  />
                </TableCell>
                <TableCell>{formatDate(typedBacklink.LastSeenDate)}</TableCell>
                <TableCell>
                  <Badge
                    style={{
                      backgroundColor:
                        TTF_COLOR_DATA[
                          typedBacklink.SourceTopicalTrustFlow_Topic_0.split(
                            "/",
                          )[0] as keyof typeof TTF_COLOR_DATA
                        ],
                    }}
                  >
                    {typedBacklink.SourceTopicalTrustFlow_Value_0}
                  </Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
