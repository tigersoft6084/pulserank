import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
  SortableTableHead,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useSerpMachineKeywords } from "@/hooks/features/sites/use-serpmachine-keywords";
import { useBulkUrlInfo } from "@/hooks/features/urls/use-bulk-url-info";
import { useTableSort } from "@/hooks/use-table-sort";
import { SerpMachineKeyword } from "@/hooks/features/sites/use-serpmachine-keywords";
import { TTF_COLOR_DATA } from "@/lib/config";

interface SerpmachineUrlTabProps {
  domain: string;
}

interface UrlData {
  url: string;
  keywords: SerpMachineKeyword[];
  totalKeywords: number;
  totalTraffic: number;
  avgPosition: number;
  avgCpc: number;
  avgCompetition: number;
  title?: string;
  refDomains?: number;
  topicalTrustFlowTopic?: string;
  topicalTrustFlowValue?: number;
}

export function SerpmachineUrlTab({ domain }: SerpmachineUrlTabProps) {
  const t = useTranslations("domainKeywords");

  // Data fetching for SERPmachine keywords
  const {
    data: serpKeywordsData,
    isLoading: serpLoading,
    error: serpError,
  } = useSerpMachineKeywords(domain, 0, 1000); // Fetch more data to group by URL

  const serpKeywords = serpKeywordsData?.data || [];

  // Group keywords by URL
  const urlData = useMemo(() => {
    if (!serpKeywords.length) return [];

    const urlMap = new Map<string, SerpMachineKeyword[]>();

    serpKeywords.forEach((keyword) => {
      if (keyword.rankingUrl) {
        const url = keyword.rankingUrl;
        if (!urlMap.has(url)) {
          urlMap.set(url, []);
        }
        urlMap.get(url)!.push(keyword);
      }
    });

    return Array.from(urlMap.entries())
      .map(([url, keywords]) => {
        const totalKeywords = keywords.length;
        const totalTraffic = keywords.reduce(
          (sum, k) => sum + (k.traffic || 0),
          0,
        );
        const avgPosition =
          keywords.reduce((sum, k) => sum + (k.position || 0), 0) /
          totalKeywords;
        const avgCpc =
          keywords.reduce((sum, k) => sum + (k.cpc || 0), 0) / totalKeywords;
        const avgCompetition =
          keywords.reduce((sum, k) => sum + (k.competition || 0), 0) /
          totalKeywords;

        return {
          url,
          keywords,
          totalKeywords,
          totalTraffic,
          avgPosition: Math.round(avgPosition),
          avgCpc: Math.round(avgCpc * 100) / 100,
          avgCompetition: Math.round(avgCompetition * 100) / 100,
        } as UrlData;
      })
      .sort((a, b) => b.totalTraffic - a.totalTraffic); // Sort by traffic descending
  }, [serpKeywords]);

  // Extract URLs for Majestic API call
  const urlList = useMemo(() => urlData.map((item) => item.url), [urlData]);

  // Fetch Majestic data for the URLs
  const {
    data: majesticData,
    isLoading: majesticLoading,
    error: majesticError,
  } = useBulkUrlInfo(urlList);

  // Combine SERPmachine and Majestic data
  const combinedData = useMemo(() => {
    if (!urlData.length || !majesticData) return [];

    return urlData.map((urlItem) => {
      const majesticItem = majesticData.find(
        (majestic: {
          URL: string;
          Title: string;
          RefDomains: number;
          TopicalTrustFlow_Topic_0: string;
          TopicalTrustFlow_Value_0: number;
        }) => majestic.URL === urlItem.url,
      );

      return {
        ...urlItem,
        title: majesticItem?.Title || "N/A",
        refDomains: majesticItem?.RefDomains || 0,
        topicalTrustFlowTopic: majesticItem?.TopicalTrustFlow_Topic_0 || "",
        topicalTrustFlowValue: majesticItem?.TopicalTrustFlow_Value_0 || 0,
      } as UrlData;
    });
  }, [urlData, majesticData]);

  // Add sorting functionality
  const { sortedData, sortConfig, handleSort } = useTableSort(
    combinedData as unknown as Record<string, unknown>[],
  );

  // Formatting functions
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  // Loading and error states
  const isLoading = serpLoading || majesticLoading;
  const error = serpError || majesticError;

  return (
    <div className="space-y-6">
      {/* Table */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : error ? (
        <div className="text-center text-red-500">
          {t("error", { message: (error as Error).message })}
        </div>
      ) : combinedData.length === 0 ? (
        <div className="text-center text-muted-foreground">{t("noData")}</div>
      ) : (
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableTableHead
                  sortKey="url"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  Url
                </SortableTableHead>
                <SortableTableHead
                  sortKey="title"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  Title
                </SortableTableHead>
                <SortableTableHead
                  sortKey="refDomains"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  RefDomains
                </SortableTableHead>
                <SortableTableHead
                  sortKey="topicalTrustFlowValue"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  Theme
                </SortableTableHead>
                <SortableTableHead
                  sortKey="totalKeywords"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  NbKeywords
                </SortableTableHead>
                <SortableTableHead
                  sortKey="totalTraffic"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  Volume
                </SortableTableHead>
                <SortableTableHead
                  sortKey="avgPosition"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  Avg Position
                </SortableTableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((urlData, index) => {
                const typedUrlData = urlData as unknown as UrlData;
                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {typedUrlData.url ? (
                        <a
                          href={typedUrlData.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline truncate block max-w-[200px]"
                        >
                          {typedUrlData.url}
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="truncate max-w-[200px]">
                        {typedUrlData.title || "N/A"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {formatNumber(typedUrlData.refDomains || 0)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        style={{
                          backgroundColor:
                            TTF_COLOR_DATA[
                              typedUrlData.topicalTrustFlowTopic?.split(
                                "/",
                              )[0] as keyof typeof TTF_COLOR_DATA
                            ] || "#6B7280",
                        }}
                      >
                        {typedUrlData.topicalTrustFlowValue || "N/A"}{" "}
                        {typedUrlData.topicalTrustFlowTopic}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatNumber(typedUrlData.totalKeywords)}
                    </TableCell>
                    <TableCell>
                      {formatNumber(typedUrlData.totalTraffic)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {typedUrlData.avgPosition || "N/A"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
