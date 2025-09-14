import { useTranslations } from "next-intl";
import { LayoutGrid } from "lucide-react";
import { useViewUrlStore } from "@/store/view-url-store";
import {
  Table,
  TableBody,
  TableCell,
  SortableTableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Favicon } from "@/components/ui/favicon";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CrawlViewItem } from "@/hooks/features/sites/use-website-profiler";

interface ExtendedCrawlViewItem extends CrawlViewItem {
  originalURL: string;
  submittedItem: {
    original: string;
    type: "url" | "site" | "domain";
  };
}
import { useTableSort } from "@/hooks/use-table-sort";

interface WebsiteProfilerCrawlViewProps {
  data: CrawlViewItem[];
  submittedItems: Array<{
    original: string;
    type: "url" | "site" | "domain";
  }>;
}

export function WebsiteProfilerCrawlView({
  data,
  submittedItems,
}: WebsiteProfilerCrawlViewProps) {
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
        <CardTitle>{t("crawlView.title")}</CardTitle>
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
                sortKey="status"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("table.columns.status")}
              </SortableTableHead>
              <SortableTableHead
                sortKey="lastCrawlResult"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("table.columns.lastCrawlResult")}
              </SortableTableHead>
              <SortableTableHead
                sortKey="lastCrawlDate"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("table.columns.lastCrawlDate")}
              </SortableTableHead>
              <SortableTableHead
                sortKey="lastSeen"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("table.columns.lastSeen")}
              </SortableTableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((item, index) => {
              const typedItem = item as unknown as ExtendedCrawlViewItem;
              return (
                <TableRow key={index}>
                  <TableCell className="font-medium flex gap-2">
                    <div className="flex items-center gap-2">
                      <Favicon url={typedItem.URL} size={16} />
                      <a
                        href={`https://${typedItem.URL}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline truncate max-w-[200px]"
                      >
                        {typedItem.originalURL}
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
                  <TableCell>{typedItem.status}</TableCell>
                  <TableCell>
                    {typedItem.lastCrawlResult !== "N/A"
                      ? typedItem.lastCrawlResult
                      : ""}
                  </TableCell>
                  <TableCell>
                    {typedItem.lastCrawlDate !== "N/A"
                      ? typedItem.lastCrawlDate
                      : ""}
                  </TableCell>
                  <TableCell>
                    {typedItem.lastSeen !== "N/A" ? typedItem.lastSeen : ""}
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
