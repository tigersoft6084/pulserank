"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  SortableTableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AnchorTextItem } from "@/types/api/majestic";
import { ExternalLink, Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { useUnlockDomain } from "@/hooks/features/user/use-unlocked-domains";
import { useToast } from "@/hooks/use-toast";
import { useTableSort } from "@/hooks/use-table-sort";

interface DomainAnchorsDetailPanelProps {
  domain: string;
  anchorsData?: {
    data: AnchorTextItem[];
    totalBacklinks: number;
    totalRefDomains: number;
  } | null;
  anchorsLoading: boolean;
  isUnlocked: boolean;
}

export function DomainAnchorsDetailPanel({
  domain,
  anchorsData,
  anchorsLoading,
  isUnlocked,
}: DomainAnchorsDetailPanelProps) {
  const t = useTranslations("identityCard.anchorsDetailPanel");
  const router = useRouter();
  const { toast } = useToast();
  const {
    mutate: unlockDomain,
    isPending: unlockingDomain,
    isSuccess: unlockedDomain,
    isError: unlockingDomainError,
    error: unlockingDomainErrorData,
  } = useUnlockDomain();

  const handleGoToAnchors = () => {
    // We need to get the domain from the current route
    if (typeof window !== "undefined") {
      const pathSegments = window.location.pathname.split("/");
      const domainIndex =
        pathSegments.findIndex((segment) => segment === "sites") + 1;
      const domain = pathSegments[domainIndex];
      router.push(`/sites/${domain}/anchors`);
    }
  };

  const handleUnlockDomainAndGoToAnchors = () => {
    unlockDomain(domain);
    handleGoToAnchors();
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

  if (anchorsLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t("loading")}
      </div>
    );
  }

  if (!anchorsData?.data || anchorsData.data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t("noData")}
      </div>
    );
  }

  // Take only the first 7 items
  const displayAnchors = anchorsData.data.slice(0, 7);

  // Add sorting functionality
  const { sortedData, sortConfig, handleSort } = useTableSort(
    displayAnchors as unknown as Record<string, unknown>[],
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {t("showing", {
            displayed: displayAnchors.length,
            total: anchorsData.data.length,
          })}
        </div>
        {isUnlocked ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleGoToAnchors}
            className="flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            {t("goToAnchorDetails")}
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleUnlockDomainAndGoToAnchors}
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
              sortKey="AnchorText"
              currentSortKey={sortConfig?.key || null}
              currentDirection={sortConfig?.direction || null}
              onSort={handleSort}
              className="w-[40%]"
            >
              {t("columns.anchor")}
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
              sortKey="TotalLinks"
              currentSortKey={sortConfig?.key || null}
              currentDirection={sortConfig?.direction || null}
              onSort={handleSort}
            >
              {t("columns.totalPages")}
            </SortableTableHead>
            <SortableTableHead
              sortKey="NoFollowLinks"
              currentSortKey={sortConfig?.key || null}
              currentDirection={sortConfig?.direction || null}
              onSort={handleSort}
              className="text-right"
            >
              {t("columns.nofollow")}
            </SortableTableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((anchor, index) => {
            const typedAnchor = anchor as unknown as AnchorTextItem;
            return (
              <TableRow
                key={index}
                className={index % 2 === 0 ? "bg-muted/5" : ""}
              >
                <TableCell className="font-medium truncate max-w-[200px]">
                  {typedAnchor.AnchorText || t("emptyAnchorText")}
                </TableCell>
                <TableCell>{typedAnchor.RefDomains.toLocaleString()}</TableCell>
                <TableCell>{typedAnchor.TotalLinks.toLocaleString()}</TableCell>
                <TableCell className="text-right">
                  {typedAnchor.NoFollowLinks.toLocaleString()}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
