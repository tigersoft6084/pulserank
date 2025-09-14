"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  SortableTableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { flagMap } from "@/lib/utils/flag-static-map";
import { baseToCountryCode } from "@/lib/utils/flag-utils";
import { ExternalLink, Lock } from "lucide-react";
import { UrlKeywordsResponse } from "@/hooks/features/urls/use-url-keywords";
import { useUnlockDomain } from "@/hooks/features/user/use-unlocked-domains";
import { useToast } from "@/hooks/use-toast";
import { useTableSort } from "@/hooks/use-table-sort";

interface DomainSEObserverKeywordsPanelProps {
  domain: string;
  data?: UrlKeywordsResponse;
  isLoading: boolean;
  isUnlocked: boolean;
}

export function DomainSEObserverKeywordsPanel({
  domain,
  data: keywordsResponse,
  isLoading,
  isUnlocked,
}: DomainSEObserverKeywordsPanelProps) {
  const t = useTranslations("identityCard.seobserverKeywordsPanel");
  const router = useRouter();
  const { toast } = useToast();
  const {
    mutate: unlockDomain,
    isPending: unlockingDomain,
    isSuccess: unlockedDomain,
    isError: unlockingDomainError,
    error: unlockingDomainErrorData,
  } = useUnlockDomain();

  const keywordsData = keywordsResponse?.data || [];

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  // Take only the first 5 items
  const displayKeywords = keywordsData?.slice(0, 5) || [];

  // Add sorting functionality
  const { sortedData, sortConfig, handleSort } = useTableSort(
    displayKeywords as unknown as Record<string, unknown>[],
  );

  const handleGoToKeywordDetails = () => {
    router.push(`/urls/keywords?url=${encodeURIComponent(domain)}`);
  };

  const handleUnlockDomainAndGoToKeywordDetails = () => {
    unlockDomain(domain);
    handleGoToKeywordDetails();
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

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex space-x-4">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[50px]" />
            <Skeleton className="h-4 w-[80px]" />
            <Skeleton className="h-4 w-[80px]" />
            <Skeleton className="h-4 w-[80px]" />
          </div>
        ))}
      </div>
    );
  }

  if (!keywordsData || keywordsData.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t("noData")}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-muted-foreground">
          {t("title", { count: 5 })}
        </h3>
        {isUnlocked ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleGoToKeywordDetails}
            className="flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            {t("goToDetails")}
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={handleUnlockDomainAndGoToKeywordDetails}
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
              sortKey="keyword"
              currentSortKey={sortConfig?.key || null}
              currentDirection={sortConfig?.direction || null}
              onSort={handleSort}
            >
              {t("columns.keyword")}
            </SortableTableHead>
            <SortableTableHead
              sortKey="position"
              currentSortKey={sortConfig?.key || null}
              currentDirection={sortConfig?.direction || null}
              onSort={handleSort}
            >
              {t("columns.position")}
            </SortableTableHead>
            <SortableTableHead
              sortKey="searchVolume"
              currentSortKey={sortConfig?.key || null}
              currentDirection={sortConfig?.direction || null}
              onSort={handleSort}
            >
              {t("columns.searchVolume")}
            </SortableTableHead>
            <SortableTableHead
              sortKey="cpc"
              currentSortKey={sortConfig?.key || null}
              currentDirection={sortConfig?.direction || null}
              onSort={handleSort}
            >
              {t("columns.cpc")}
            </SortableTableHead>
            <SortableTableHead
              sortKey="competition"
              currentSortKey={sortConfig?.key || null}
              currentDirection={sortConfig?.direction || null}
              onSort={handleSort}
            >
              {t("columns.competition")}
            </SortableTableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((keyword, index) => {
            const typedKeyword =
              keyword as unknown as (typeof displayKeywords)[0];
            // Dynamic flag logic
            const countryCode = baseToCountryCode[typedKeyword.base];
            const Flag = countryCode ? flagMap[countryCode] : null;

            return (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {Flag ? (
                      <Flag title={countryCode} className="w-4 h-3" />
                    ) : (
                      <span className="w-4 h-3 bg-gray-200 rounded" />
                    )}
                    <span className="truncate max-w-[150px]">
                      {typedKeyword.keyword}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{typedKeyword.position || "N/A"}</TableCell>
                <TableCell>{formatNumber(typedKeyword.searchVolume)}</TableCell>
                <TableCell>{formatCurrency(typedKeyword.cpc)}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{typedKeyword.competition}</Badge>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
