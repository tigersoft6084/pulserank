import { useTranslations } from "next-intl";
import { LayoutGrid } from "lucide-react";
import { useViewUrlStore } from "@/store/view-url-store";
import {
  Table,
  TableBody,
  TableCell,
  SortableTableHead,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Favicon } from "@/components/ui/favicon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { CompactViewItem } from "@/hooks/features/sites/use-website-profiler";

interface ExtendedCompactViewItem extends CompactViewItem {
  originalURL: string;
  submittedItem: {
    original: string;
    type: "url" | "site" | "domain";
  };
}
import { TTF_COLOR_DATA } from "@/lib/config";
import { useTableSort } from "@/hooks/use-table-sort";

interface WebsiteProfilerCompactViewProps {
  data: CompactViewItem[];
  submittedItems: Array<{
    original: string;
    type: "url" | "site" | "domain";
  }>;
}

export function WebsiteProfilerCompactView({
  data,
  submittedItems,
}: WebsiteProfilerCompactViewProps) {
  const t = useTranslations("websiteProfiler");
  const { setUrl, setSubmittedUrl } = useViewUrlStore();

  // Add sorting functionality
  const { sortedData, sortConfig, handleSort } = useTableSort(
    data.map((item, index) => ({
      ...item,
      // Add original URL for sorting and include submitted item data
      originalURL: submittedItems[index]?.original || item.URL,
      submittedItem: submittedItems[index],
    })) as unknown as Record<string, unknown>[],
  );

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t("table.noData")}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("compactView.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <SortableTableHead
                sortKey="originalURL"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("table.columns.url")}
              </SortableTableHead>
              <SortableTableHead
                sortKey="RefDomains"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("table.columns.refDomains")}
              </SortableTableHead>
              <SortableTableHead
                sortKey="BackLinks"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("table.columns.backLinks")}
              </SortableTableHead>
              <SortableTableHead
                sortKey="RefIPs"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("table.columns.refIPs")}
              </SortableTableHead>
              <SortableTableHead
                sortKey="RefSubnets"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("table.columns.refSubnets")}
              </SortableTableHead>
              <SortableTableHead
                sortKey="TF"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("table.columns.tf")}
              </SortableTableHead>
              <SortableTableHead
                sortKey="CF"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("table.columns.cf")}
              </SortableTableHead>
              <SortableTableHead
                sortKey="Percent"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("table.columns.percent")}
              </SortableTableHead>
              <TableHead>{t("table.columns.theme")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((item, index) => {
              const typedItem = item as unknown as ExtendedCompactViewItem;
              return (
                <TableRow
                  key={index}
                  className={index % 2 === 0 ? "bg-muted/5" : ""}
                >
                  <TableCell className="font-medium flex gap-2">
                    <div className="flex items-center gap-2">
                      <Favicon url={typedItem.URL} size={16} />
                      <a
                        href={`https://${typedItem.URL}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline truncate max-w-[200px]"
                      >
                        {typedItem.submittedItem?.original || typedItem.URL}
                      </a>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            className="p-2"
                            size="sm"
                            onClick={() => {
                              const submittedItem = typedItem.submittedItem;
                              if (!submittedItem) return;

                              if (submittedItem.type === "url") {
                                // If it's a URL, go to URL info page
                                setUrl(submittedItem.original);
                                setSubmittedUrl(submittedItem.original);
                                window.open(`/urls/info`, "_blank");
                              } else {
                                // If it's a site or domain, go to site view page
                                window.open(
                                  `/sites/${encodeURIComponent(typedItem.URL)}/view`,
                                  "_blank",
                                );
                              }
                            }}
                          >
                            <LayoutGrid className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <span>{t("table.viewSiteDetails")}</span>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>{typedItem.RefDomains.toLocaleString()}</TableCell>
                  <TableCell>{typedItem.BackLinks.toLocaleString()}</TableCell>
                  <TableCell>{typedItem.RefIPs.toLocaleString()}</TableCell>
                  <TableCell>{typedItem.RefSubnets.toLocaleString()}</TableCell>
                  <TableCell>{typedItem.TrustFlow}</TableCell>
                  <TableCell>{typedItem.CitationFlow}</TableCell>
                  <TableCell>
                    {typedItem.TrustFlow > 0 && typedItem.CitationFlow > 0
                      ? Math.round(
                          (typedItem.TrustFlow / typedItem.CitationFlow) * 100,
                        )
                      : "-"}
                    %
                  </TableCell>
                  <TableCell>
                    {typedItem.TopicalTrustFlow_Value_0 > 0 ? (
                      <Badge
                        style={{
                          backgroundColor:
                            TTF_COLOR_DATA[
                              typedItem.TopicalTrustFlow_Topic_0.split(
                                "/",
                              )[0] as keyof typeof TTF_COLOR_DATA
                            ],
                        }}
                      >
                        {typedItem.TopicalTrustFlow_Value_0}{" "}
                        {typedItem.TopicalTrustFlow_Topic_0}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
