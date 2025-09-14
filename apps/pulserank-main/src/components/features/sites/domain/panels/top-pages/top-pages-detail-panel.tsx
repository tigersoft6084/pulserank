"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  SortableTableHead,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Favicon } from "@/components/ui/favicon";
import { ExternalLink, Lock } from "lucide-react";
import { TTF_COLOR_DATA } from "@/lib/config";
import { DomainTopPagesResponse } from "@/hooks/features/sites/use-domain-top-pages";
import { useUnlockDomain } from "@/hooks/features/user/use-unlocked-domains";
import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useTableSort } from "@/hooks/use-table-sort";

interface DomainTopPagesDetailPanelProps {
  domain: string;
  topPagesData?: DomainTopPagesResponse;
  topPagesLoading: boolean;
  isUnlocked: boolean;
}

export function DomainTopPagesDetailPanel({
  domain,
  topPagesData,
  topPagesLoading,
  isUnlocked,
}: DomainTopPagesDetailPanelProps) {
  const router = useRouter();
  const t = useTranslations("identityCard.topPagesPanel");

  const {
    mutate: unlockDomain,
    isPending: unlockingDomain,
    isSuccess: unlockedDomain,
    isError: unlockingDomainError,
    error: unlockingDomainErrorData,
  } = useUnlockDomain();

  const handleGoToTopPages = () => {
    // We need to get the domain from the current route
    if (typeof window !== "undefined") {
      const pathSegments = window.location.pathname.split("/");
      const domainIndex =
        pathSegments.findIndex((segment) => segment === "sites") + 1;
      const domain = pathSegments[domainIndex];
      router.push(`/sites/${domain}/top_pages`);
    }
  };

  const handleUnlockDomainAndGoToTopPages = () => {
    unlockDomain(domain);
    handleGoToTopPages();
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

  const getTitleFromURL = (url: string) => {
    try {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      if (pathname === "/" || pathname === "") {
        return t("homepage");
      }
      // Extract title from pathname
      const segments = pathname.split("/").filter(Boolean);
      if (segments.length === 0) return t("homepage");

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
      return t("unknown");
    }
  };

  if (topPagesLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t("loading")}
      </div>
    );
  }

  if (!topPagesData?.data || topPagesData.data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t("noData")}
      </div>
    );
  }

  const displayTopPages = topPagesData.data.slice(0, 10);

  // Add sorting functionality
  const { sortedData, sortConfig, handleSort } = useTableSort(
    displayTopPages as unknown as Record<string, unknown>[],
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {t("showing", {
            displayed: displayTopPages.length,
            total: topPagesData.totalCount,
          })}
        </div>
        {isUnlocked ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleGoToTopPages}
            className="flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            {t("goToDetails")}
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleUnlockDomainAndGoToTopPages}
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
              sortKey="URL"
              currentSortKey={sortConfig?.key || null}
              currentDirection={sortConfig?.direction || null}
              onSort={handleSort}
              className="w-[20%]"
            >
              {t("columns.titleAndUrl")}
            </SortableTableHead>
            <SortableTableHead
              sortKey="TrustFlow"
              currentSortKey={sortConfig?.key || null}
              currentDirection={sortConfig?.direction || null}
              onSort={handleSort}
            >
              {t("columns.trustFlow")}
            </SortableTableHead>
            <SortableTableHead
              sortKey="RefDomains"
              currentSortKey={sortConfig?.key || null}
              currentDirection={sortConfig?.direction || null}
              onSort={handleSort}
            >
              {t("columns.refDomains")}
            </SortableTableHead>
            <SortableTableHead
              sortKey="RefIPs"
              currentSortKey={sortConfig?.key || null}
              currentDirection={sortConfig?.direction || null}
              onSort={handleSort}
            >
              {t("columns.refIPs")}
            </SortableTableHead>
            <TableHead>{t("columns.topicalTrustFlow")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((topPage, index) => {
            const typedTopPage =
              topPage as unknown as (typeof displayTopPages)[0];
            return (
              <TableRow
                key={index}
                className={index % 2 === 0 ? "bg-muted/5" : ""}
              >
                <TableCell className="truncate max-w-[160px]">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Favicon url={typedTopPage.URL} size={16} />
                      <span className="font-medium text-sm truncate">
                        {getTitleFromURL(typedTopPage.URL)}
                      </span>
                    </div>
                    <a
                      href={typedTopPage.URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline text-xs truncate"
                    >
                      {typedTopPage.URL}
                    </a>
                  </div>
                </TableCell>
                <TableCell>{typedTopPage.TrustFlow}</TableCell>
                <TableCell>
                  {typedTopPage.RefDomains.toLocaleString()}
                </TableCell>
                <TableCell>{typedTopPage.RefIPs.toLocaleString()}</TableCell>
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
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
