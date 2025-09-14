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
import { SiteCompareData } from "@/types/sites";
import { TTF_COLOR_DATA } from "@/lib/config";
import { useTranslations } from "next-intl";
import { useTableSort } from "@/hooks/use-table-sort";

interface SiteCompareTableProps {
  data: SiteCompareData[];
  urls: string[];
}

export function SiteCompareTable({ data, urls }: SiteCompareTableProps) {
  const t = useTranslations("sitesCompare.table");

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t("noData")}
      </div>
    );
  }

  // Add sorting functionality
  const { sortedData, sortConfig, handleSort } = useTableSort(
    data as unknown as Record<string, unknown>[],
  );

  // Helper function to get color based on value ranking
  const getValueColor = (
    value: number,
    metric: string,
    allValues: number[],
  ) => {
    if (!value || allValues.length === 0) return "text-gray-500";

    // Filter out null/undefined values and get unique values
    const validValues = allValues.filter((v) => v && v > 0);
    if (validValues.length === 0) return "text-gray-500";

    const sortedValues = [...validValues].sort((a, b) => {
      // For ACRank (Alexa), lower is better
      if (metric === "ACRank") {
        return b - a;
      }
      // For all other metrics, higher is better
      return a - b;
    });

    const minValue = sortedValues[0];
    const maxValue = sortedValues[sortedValues.length - 1];

    // If all values are the same, show as gray
    if (minValue === maxValue) return "text-gray-500";

    // Determine if this is the best, worst, or middle value
    const isBest = value === maxValue;
    const isWorst = value === minValue;

    if (isBest) return "text-green-600 font-bold";
    if (isWorst) return "text-red-600 font-bold";
    return "text-yellow-600 font-bold";
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <SortableTableHead
            sortKey="metric"
            currentSortKey={sortConfig?.key || null}
            currentDirection={sortConfig?.direction || null}
            onSort={handleSort}
          >
            {t("columns.metric")}
          </SortableTableHead>
          {urls.map((url, index) => (
            <TableHead key={index} className="text-center">
              <div className="flex items-center justify-center gap-2">
                <Favicon url={url} size={16} />
                <span className="text-sm font-medium">{url}</span>
              </div>
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {/* PR */}
        <TableRow>
          <TableCell className="font-medium">{t("columns.pr")}</TableCell>
          {sortedData.map((siteData, siteIndex) => {
            const typedSiteData = siteData as unknown as SiteCompareData;
            return (
              <TableCell key={siteIndex} className="text-center">
                <span
                  className={getValueColor(
                    typedSiteData.ACRank,
                    "ACRank",
                    sortedData.map(
                      (d) => (d as unknown as SiteCompareData).ACRank,
                    ),
                  )}
                >
                  {typedSiteData.ACRank || "-"}
                </span>
              </TableCell>
            );
          })}
        </TableRow>

        {/* Alexa */}
        <TableRow>
          <TableCell className="font-medium">
            {t("columns.alexaRank")}
          </TableCell>
          {sortedData.map((siteData, siteIndex) => {
            const typedSiteData = siteData as unknown as SiteCompareData;
            return (
              <TableCell key={siteIndex} className="text-center">
                <span
                  className={getValueColor(
                    typedSiteData.ACRank,
                    "ACRank",
                    sortedData.map(
                      (d) => (d as unknown as SiteCompareData).ACRank,
                    ),
                  )}
                >
                  {typedSiteData.ACRank || "-"}
                </span>
              </TableCell>
            );
          })}
        </TableRow>

        {/* Ref Domains */}
        <TableRow>
          <TableCell className="font-medium">
            {t("columns.refDomains")}
          </TableCell>
          {sortedData.map((siteData, siteIndex) => {
            const typedSiteData = siteData as unknown as SiteCompareData;
            return (
              <TableCell key={siteIndex} className="text-center">
                <span
                  className={getValueColor(
                    typedSiteData.RefDomains,
                    "RefDomains",
                    sortedData.map(
                      (d) => (d as unknown as SiteCompareData).RefDomains,
                    ),
                  )}
                >
                  {typedSiteData.RefDomains?.toLocaleString() || "-"}
                </span>
              </TableCell>
            );
          })}
        </TableRow>

        {/* ExtBackLinks */}
        <TableRow>
          <TableCell className="font-medium">
            {t("columns.extBackLinks")}
          </TableCell>
          {sortedData.map((siteData, siteIndex) => {
            const typedSiteData = siteData as unknown as SiteCompareData;
            return (
              <TableCell key={siteIndex} className="text-center">
                <span
                  className={getValueColor(
                    typedSiteData.ExtBackLinks,
                    "ExtBackLinks",
                    sortedData.map(
                      (d) => (d as unknown as SiteCompareData).ExtBackLinks,
                    ),
                  )}
                >
                  {typedSiteData.ExtBackLinks?.toLocaleString() || "-"}
                </span>
              </TableCell>
            );
          })}
        </TableRow>

        {/* Ref IPs */}
        <TableRow>
          <TableCell className="font-medium">{t("columns.refIPs")}</TableCell>
          {sortedData.map((siteData, siteIndex) => {
            const typedSiteData = siteData as unknown as SiteCompareData;
            return (
              <TableCell key={siteIndex} className="text-center">
                <span
                  className={getValueColor(
                    typedSiteData.RefIPs,
                    "RefIPs",
                    sortedData.map(
                      (d) => (d as unknown as SiteCompareData).RefIPs,
                    ),
                  )}
                >
                  {typedSiteData.RefIPs?.toLocaleString() || "-"}
                </span>
              </TableCell>
            );
          })}
        </TableRow>

        {/* Ref SubNets */}
        <TableRow>
          <TableCell className="font-medium">
            {t("columns.refSubNets")}
          </TableCell>
          {sortedData.map((siteData, siteIndex) => {
            const typedSiteData = siteData as unknown as SiteCompareData;
            return (
              <TableCell key={siteIndex} className="text-center">
                <span
                  className={getValueColor(
                    typedSiteData.RefSubNets,
                    "RefSubNets",
                    sortedData.map(
                      (d) => (d as unknown as SiteCompareData).RefSubNets,
                    ),
                  )}
                >
                  {typedSiteData.RefSubNets?.toLocaleString() || "-"}
                </span>
              </TableCell>
            );
          })}
        </TableRow>

        {/* CitationFlow */}
        <TableRow>
          <TableCell className="font-medium">
            {t("columns.citationFlow")}
          </TableCell>
          {sortedData.map((siteData, siteIndex) => {
            const typedSiteData = siteData as unknown as SiteCompareData;
            return (
              <TableCell key={siteIndex} className="text-center">
                <span
                  className={getValueColor(
                    typedSiteData.CitationFlow,
                    "CitationFlow",
                    sortedData.map(
                      (d) => (d as unknown as SiteCompareData).CitationFlow,
                    ),
                  )}
                >
                  {typedSiteData.CitationFlow || "-"}
                </span>
              </TableCell>
            );
          })}
        </TableRow>

        {/* TrustFlow */}
        <TableRow>
          <TableCell className="font-medium">
            {t("columns.trustFlow")}
          </TableCell>
          {sortedData.map((siteData, siteIndex) => {
            const typedSiteData = siteData as unknown as SiteCompareData;
            return (
              <TableCell key={siteIndex} className="text-center">
                <span
                  className={getValueColor(
                    typedSiteData.TrustFlow,
                    "TrustFlow",
                    sortedData.map(
                      (d) => (d as unknown as SiteCompareData).TrustFlow,
                    ),
                  )}
                >
                  {typedSiteData.TrustFlow || "-"}
                </span>
              </TableCell>
            );
          })}
        </TableRow>

        {/* Topical TrustFlow */}
        <TableRow>
          <TableCell className="font-medium">
            {t("columns.topicalTrustFlow")}
          </TableCell>
          {sortedData.map((siteData, siteIndex) => {
            const typedSiteData = siteData as unknown as SiteCompareData;
            return (
              <TableCell key={siteIndex} className="text-center">
                {typedSiteData.TopicalTrustFlow_Value_0 &&
                typedSiteData.TopicalTrustFlow_Topic_0 ? (
                  <Badge
                    style={{
                      backgroundColor:
                        TTF_COLOR_DATA[
                          typedSiteData.TopicalTrustFlow_Topic_0.split(
                            "/",
                          )[0] as keyof typeof TTF_COLOR_DATA
                        ],
                    }}
                  >
                    {typedSiteData.TopicalTrustFlow_Value_0}{" "}
                    {typedSiteData.TopicalTrustFlow_Topic_0}
                  </Badge>
                ) : (
                  "-"
                )}
              </TableCell>
            );
          })}
        </TableRow>
      </TableBody>
    </Table>
  );
}
