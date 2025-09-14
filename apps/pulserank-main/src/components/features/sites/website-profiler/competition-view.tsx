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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Favicon } from "@/components/ui/favicon";
import { CompetitionViewItem } from "@/hooks/features/sites/use-website-profiler";

interface ExtendedCompetitionViewItem extends CompetitionViewItem {
  originalURL: string;
  submittedItem: {
    original: string;
    type: "url" | "site" | "domain";
    extracted?: string;
  };
}
import { useTranslations } from "next-intl";
import { TTF_COLOR_DATA } from "@/lib/config";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LayoutGrid, Search, Loader2 } from "lucide-react";
import { useState } from "react";
import { useViewUrlStore } from "@/store/view-url-store";
import { useTableSort } from "@/hooks/use-table-sort";
import { useLanguageStore } from "@/store/language-store";

// Function to abbreviate numbers (e.g., 60884 -> 60.9K)
const abbreviateNumber = (num: number): string => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1).replace(/\.0$/, "") + "B";
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
};

// Function to calculate percentage for bar width
const calculatePercentage = (value: number, maxValue: number): number => {
  if (maxValue === 0) return 0;
  return Math.min((value / maxValue) * 100, 100);
};

interface WebsiteProfilerCompetitionViewProps {
  data: CompetitionViewItem[];
  submittedItems: Array<{
    original: string;
    type: "url" | "site" | "domain";
  }>;
}

// Function to extract root domain from URL (removes trailing slash)
const extractRootDomain = (url: string): string => {
  let domain = url;
  try {
    // Remove protocol if present
    if (domain.startsWith("http://") || domain.startsWith("https://")) {
      domain = domain.replace(/^https?:\/\//, "");
    }
    // Remove www. if present
    domain = domain.replace(/^www\./, "");
    // Remove trailing slash if present
    domain = domain.replace(/\/$/, "");
    // Get root domain (last two parts)
    const parts = domain.split(".");
    if (parts.length >= 2) {
      domain = parts.slice(-2).join(".");
    }
  } catch {
    // Fallback to original URL if parsing fails
    domain = url;
  }
  return domain;
};

export function WebsiteProfilerCompetitionView({
  data,
  submittedItems,
}: WebsiteProfilerCompetitionViewProps) {
  const t = useTranslations("websiteProfiler");
  const { setUrl, setSubmittedUrl } = useViewUrlStore();
  const [compareUrl, setCompareUrl] = useState("");
  const [isComparing, setIsComparing] = useState(false);
  const [compareResult, setCompareResult] =
    useState<CompetitionViewItem | null>(null);
  const { currentBase } = useLanguageStore();

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

  // Calculate max values for bar scaling
  const maxUrlRefDomains = Math.max(
    ...data.map((item) => item.urlMetrics.refDomains),
  );
  const maxDomainRefDomains = Math.max(
    ...data.map((item) => item.domainMetrics.refDomains),
  );
  const maxKeywords = Math.max(
    ...data.map((item) => item.semrushMetrics.keywords),
  );
  const maxTraffic = Math.max(
    ...data.map((item) => item.semrushMetrics.traffic),
  );

  // Calculate min values for summary
  const minDomainRefDomains = Math.min(
    ...data.map((item) => item.domainMetrics.refDomains),
  );
  const minDomainTrustFlow = Math.min(
    ...data.map((item) => item.domainMetrics.topicalTrustFlowValue),
  );

  const handleCompareUrl = async () => {
    if (!compareUrl.trim()) return;

    // Basic URL validation
    let urlToCompare = compareUrl.trim();
    if (
      !urlToCompare.startsWith("http://") &&
      !urlToCompare.startsWith("https://")
    ) {
      urlToCompare = `https://${urlToCompare}`;
    }

    try {
      new URL(urlToCompare);
    } catch {
      alert(t("competitionView.compare.invalidUrl"));
      return;
    }

    setIsComparing(true);
    try {
      // Call the competition API with the single URL
      const response = await fetch("/api/seo/positions/competition", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          singleUrl: urlToCompare, // Using singleUrl parameter for direct domain analysis
          base: currentBase, // Default base
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.data && result.data.length > 0) {
          setCompareResult(result.data[0]);
        } else {
          alert(t("competitionView.compare.noData"));
        }
      } else {
        const errorData = await response.json();
        alert(
          `${t("competitionView.compare.error")}: ${errorData.message || t("competitionView.compare.failed")}`,
        );
      }
    } catch (error) {
      console.error("Error comparing URL:", error);
      alert(t("competitionView.compare.failed"));
    } finally {
      setIsComparing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCompareUrl();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("competitionView.title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead colSpan={2}>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {t("competitionView.summary.refDomainMini")}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {minDomainRefDomains.toLocaleString()}
                    </Badge>
                  </div>
                  <span className="text-muted-foreground">|</span>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      {t("competitionView.summary.trustFlowMini")}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {minDomainTrustFlow}
                    </Badge>
                  </div>
                </div>
              </TableHead>
              <TableHead colSpan={2}>
                {t("competitionView.columns.url")}
              </TableHead>
              <TableHead colSpan={2}>
                {t("competitionView.columns.rootDomain")}
              </TableHead>
              <TableHead colSpan={2}>
                {t("competitionView.columns.semrushDomain")}
              </TableHead>
            </TableRow>
            <TableRow>
              <TableHead>#</TableHead>
              <SortableTableHead
                sortKey="originalURL"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("table.columns.url")}
              </SortableTableHead>
              <SortableTableHead
                sortKey="urlMetrics.topicalTrustFlowValue"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
                className="text-xs text-muted-foreground"
              >
                TF (%)
              </SortableTableHead>
              <SortableTableHead
                sortKey="urlMetrics.refDomains"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
                className="text-xs text-muted-foreground"
              >
                RD
              </SortableTableHead>
              <SortableTableHead
                sortKey="domainMetrics.topicalTrustFlowValue"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
                className="text-xs text-muted-foreground"
              >
                TF (%)
              </SortableTableHead>
              <SortableTableHead
                sortKey="domainMetrics.refDomains"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
                className="text-xs text-muted-foreground"
              >
                RD
              </SortableTableHead>
              <SortableTableHead
                sortKey="semrushMetrics.keywords"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
                className="text-xs text-muted-foreground"
              >
                KWs
              </SortableTableHead>
              <SortableTableHead
                sortKey="semrushMetrics.traffic"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
                className="text-xs text-muted-foreground"
              >
                Hit
              </SortableTableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((item, index) => {
              const typedItem = item as unknown as ExtendedCompetitionViewItem;
              return (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
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
                                const domain =
                                  submittedItem.extracted || typedItem.URL;
                                window.open(
                                  `/sites/${encodeURIComponent(domain)}/view`,
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
                  <TableCell>
                    {typedItem.error ? (
                      <div className="text-red-600">
                        {t("competitionView.compare.error")}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {typedItem.urlMetrics.topicalTrustFlowTopic !==
                        "N/A" ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge
                                  style={{
                                    backgroundColor:
                                      TTF_COLOR_DATA[
                                        typedItem.urlMetrics.topicalTrustFlowTopic.split(
                                          "/",
                                        )[0] as keyof typeof TTF_COLOR_DATA
                                      ],
                                  }}
                                >
                                  {typedItem.urlMetrics.topicalTrustFlowValue}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <span>
                                  {typedItem.urlMetrics.topicalTrustFlowValue}{" "}
                                  {typedItem.urlMetrics.topicalTrustFlowTopic}
                                </span>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <Badge variant="secondary">
                            {typedItem.urlMetrics.trustFlow}
                          </Badge>
                        )}
                        <span className="text-green-600 text-sm">
                          {typedItem.urlMetrics.trustFlow > 0 &&
                          typedItem.urlMetrics.citationFlow > 0
                            ? Math.round(
                                (typedItem.urlMetrics.trustFlow /
                                  typedItem.urlMetrics.citationFlow) *
                                  100,
                              )
                            : 0}
                          %
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {typedItem.error ? (
                      <div className="text-red-600">
                        {t("competitionView.compare.error")}
                      </div>
                    ) : (
                      <div className="relative w-full">
                        <div
                          className="absolute inset-0 bg-blue-100 rounded-sm"
                          style={{
                            width: `${calculatePercentage(typedItem.urlMetrics.refDomains, maxUrlRefDomains)}%`,
                          }}
                        />
                        <span className="relative z-10 px-2">
                          {abbreviateNumber(typedItem.urlMetrics.refDomains)}
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {typedItem.error ? (
                      <div className="text-red-600">
                        {t("competitionView.compare.error")}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {typedItem.domainMetrics.topicalTrustFlowTopic !==
                        "N/A" ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge
                                  style={{
                                    backgroundColor:
                                      TTF_COLOR_DATA[
                                        typedItem.domainMetrics.topicalTrustFlowTopic.split(
                                          "/",
                                        )[0] as keyof typeof TTF_COLOR_DATA
                                      ],
                                  }}
                                >
                                  {
                                    typedItem.domainMetrics
                                      .topicalTrustFlowValue
                                  }
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <span>
                                  {
                                    typedItem.domainMetrics
                                      .topicalTrustFlowValue
                                  }{" "}
                                  {
                                    typedItem.domainMetrics
                                      .topicalTrustFlowTopic
                                  }
                                </span>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <Badge variant="secondary">
                            {typedItem.domainMetrics.trustFlow}
                          </Badge>
                        )}
                        <span className="text-green-600 text-sm">
                          {typedItem.domainMetrics.trustFlow > 0 &&
                          typedItem.domainMetrics.citationFlow > 0
                            ? Math.round(
                                (typedItem.domainMetrics.trustFlow /
                                  typedItem.domainMetrics.citationFlow) *
                                  100,
                              )
                            : 0}
                          %
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {typedItem.error ? (
                      <div className="text-red-600">
                        {t("competitionView.compare.error")}
                      </div>
                    ) : (
                      <div className="relative w-full">
                        <div
                          className="absolute inset-0 bg-green-100 rounded-sm"
                          style={{
                            width: `${calculatePercentage(typedItem.domainMetrics.refDomains, maxDomainRefDomains)}%`,
                          }}
                        />
                        <span className="relative z-10 px-2">
                          {abbreviateNumber(typedItem.domainMetrics.refDomains)}
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {typedItem.error ? (
                      <div className="text-red-600">
                        {t("competitionView.compare.error")}
                      </div>
                    ) : (
                      <div className="relative w-full">
                        <div
                          className="absolute inset-0 bg-purple-100 rounded-sm"
                          style={{
                            width: `${calculatePercentage(typedItem.semrushMetrics.keywords, maxKeywords)}%`,
                          }}
                        />
                        <span className="relative z-10 px-2">
                          {abbreviateNumber(typedItem.semrushMetrics.keywords)}
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {typedItem.error ? (
                      <div className="text-red-600">
                        {t("competitionView.compare.error")}
                      </div>
                    ) : (
                      <div className="relative w-full">
                        <div
                          className="absolute inset-0 bg-orange-100 rounded-sm"
                          style={{
                            width: `${calculatePercentage(typedItem.semrushMetrics.traffic, maxTraffic)}%`,
                          }}
                        />
                        <span className="relative z-10 px-2">
                          {abbreviateNumber(typedItem.semrushMetrics.traffic)}
                        </span>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}

            {/* Compare URL Row */}
            {compareResult && (
              <TableRow className="bg-blue-50 border-t-2 border-blue-200">
                <TableCell>
                  <Badge
                    variant="outline"
                    className="bg-blue-100 text-blue-800"
                  >
                    Compare
                  </Badge>
                </TableCell>
                <TableCell className="font-medium flex gap-2">
                  <div className="flex items-center gap-2">
                    <Favicon url={compareResult.URL} size={16} />
                    <a
                      href={`https://${compareResult.URL}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline truncate max-w-[200px]"
                    >
                      {compareResult.URL}
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
                            window.open(
                              `/sites/${encodeURIComponent(
                                extractRootDomain(compareResult.URL),
                              )}/view`,
                              "_blank",
                            );
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
                <TableCell>
                  {compareResult.error ? (
                    <div className="text-red-600">
                      {t("competitionView.compare.error")}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {compareResult.urlMetrics.topicalTrustFlowTopic !==
                      "N/A" ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                style={{
                                  backgroundColor:
                                    TTF_COLOR_DATA[
                                      compareResult.urlMetrics.topicalTrustFlowTopic.split(
                                        "/",
                                      )[0] as keyof typeof TTF_COLOR_DATA
                                    ],
                                }}
                              >
                                {compareResult.urlMetrics.topicalTrustFlowValue}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <span>
                                {compareResult.urlMetrics.topicalTrustFlowValue}{" "}
                                {compareResult.urlMetrics.topicalTrustFlowTopic}
                              </span>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <Badge variant="secondary">
                          {compareResult.urlMetrics.trustFlow}
                        </Badge>
                      )}
                      <span className="text-green-600 text-sm">
                        {compareResult.urlMetrics.trustFlow > 0 &&
                        compareResult.urlMetrics.citationFlow > 0
                          ? Math.round(
                              (compareResult.urlMetrics.trustFlow /
                                compareResult.urlMetrics.citationFlow) *
                                100,
                            )
                          : 0}
                        %
                      </span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {compareResult.error ? (
                    <div className="text-red-600">
                      {t("competitionView.compare.error")}
                    </div>
                  ) : (
                    <div className="relative w-full">
                      <div
                        className="absolute inset-0 bg-blue-100 rounded-sm"
                        style={{
                          width: `${calculatePercentage(compareResult.urlMetrics.refDomains, maxUrlRefDomains)}%`,
                        }}
                      />
                      <span className="relative z-10 px-2">
                        {abbreviateNumber(compareResult.urlMetrics.refDomains)}
                      </span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {compareResult.error ? (
                    <div className="text-red-600">
                      {t("competitionView.compare.error")}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {compareResult.domainMetrics.topicalTrustFlowTopic !==
                      "N/A" ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                style={{
                                  backgroundColor:
                                    TTF_COLOR_DATA[
                                      compareResult.domainMetrics.topicalTrustFlowTopic.split(
                                        "/",
                                      )[0] as keyof typeof TTF_COLOR_DATA
                                    ],
                                }}
                              >
                                {
                                  compareResult.domainMetrics
                                    .topicalTrustFlowValue
                                }
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <span>
                                {
                                  compareResult.domainMetrics
                                    .topicalTrustFlowValue
                                }{" "}
                                {
                                  compareResult.domainMetrics
                                    .topicalTrustFlowTopic
                                }
                              </span>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <Badge variant="secondary">
                          {compareResult.domainMetrics.trustFlow}
                        </Badge>
                      )}
                      <span className="text-green-600 text-sm">
                        {compareResult.domainMetrics.trustFlow > 0 &&
                        compareResult.domainMetrics.citationFlow > 0
                          ? Math.round(
                              (compareResult.domainMetrics.trustFlow /
                                compareResult.domainMetrics.citationFlow) *
                                100,
                            )
                          : 0}
                        %
                      </span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {compareResult.error ? (
                    <div className="text-red-600">
                      {t("competitionView.compare.error")}
                    </div>
                  ) : (
                    <div className="relative w-full">
                      <div
                        className="absolute inset-0 bg-green-100 rounded-sm"
                        style={{
                          width: `${calculatePercentage(compareResult.domainMetrics.refDomains, maxDomainRefDomains)}%`,
                        }}
                      />
                      <span className="relative z-10 px-2">
                        {abbreviateNumber(
                          compareResult.domainMetrics.refDomains,
                        )}
                      </span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {compareResult.error ? (
                    <div className="text-red-600">
                      {t("competitionView.compare.error")}
                    </div>
                  ) : (
                    <div className="relative w-full">
                      <div
                        className="absolute inset-0 bg-purple-100 rounded-sm"
                        style={{
                          width: `${calculatePercentage(compareResult.semrushMetrics.keywords, maxKeywords)}%`,
                        }}
                      />
                      <span className="relative z-10 px-2">
                        {abbreviateNumber(
                          compareResult.semrushMetrics.keywords,
                        )}
                      </span>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {compareResult.error ? (
                    <div className="text-red-600">
                      {t("competitionView.compare.error")}
                    </div>
                  ) : (
                    <div className="relative w-full">
                      <div
                        className="absolute inset-0 bg-orange-100 rounded-sm"
                        style={{
                          width: `${calculatePercentage(compareResult.semrushMetrics.traffic, maxTraffic)}%`,
                        }}
                      />
                      <span className="relative z-10 px-2">
                        {abbreviateNumber(compareResult.semrushMetrics.traffic)}
                      </span>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Compare URL Input Panel */}
        <div className="mt-6 p-4 border rounded-lg bg-gray-50">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                placeholder={t("competitionView.compare.placeholder")}
                value={compareUrl}
                onChange={(e) => setCompareUrl(e.target.value)}
                onKeyDown={handleKeyPress}
                className="pl-10"
              />
            </div>
            <Button
              onClick={handleCompareUrl}
              disabled={!compareUrl.trim() || isComparing}
              className="min-w-[140px]"
            >
              {isComparing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("competitionView.compare.comparing")}
                </>
              ) : (
                t("competitionView.compare.button")
              )}
            </Button>
            {compareResult && (
              <Button
                variant="outline"
                onClick={() => {
                  setCompareResult(null);
                  setCompareUrl("");
                }}
                className="min-w-[100px]"
              >
                {t("competitionView.compare.clear")}
              </Button>
            )}
          </div>
          {compareResult && (
            <div className="mt-3 text-sm text-muted-foreground">
              {t("competitionView.compare.success")}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
