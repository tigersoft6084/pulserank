"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useGetSERPResults } from "@/hooks/features/serp/use-serp";
import {
  Table,
  TableBody,
  TableCell,
  SortableTableHead,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Favicon } from "@/components/ui/favicon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BASE_DATA } from "@/lib/config";
import { baseToCountryCode } from "@/lib/utils/flag-utils";
import { flagMap } from "@/lib/utils/flag-static-map";
import { LatestBacklinksModal } from "@/components/features/backlinks/latest-backlinks-modal";
import { useSearchParams } from "next/navigation";
import { useTableSort } from "@/hooks/use-table-sort";

export default function SERPBacklinksPage() {
  const t = useTranslations("serpBacklinks");
  const searchParams = useSearchParams();
  const keywordFromUrl = searchParams.get("keyword") || "";
  const baseFromUrl = searchParams.get("base") || "com_en";

  const [keyword, setKeyword] = useState(keywordFromUrl);
  const [submittedKeyword, setSubmittedKeyword] = useState(keywordFromUrl);
  const [selectedBase, setSelectedBase] = useState(baseFromUrl);
  const [selections, setSelections] = useState<
    Record<number, "URL" | "Domain" | "Off">
  >({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUrls, setSelectedUrls] = useState<string[]>([]);

  // URL validation function
  const isValidUrl = (url: string): boolean => {
    if (!url) return false;

    try {
      const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`);
      return Boolean(urlObj.hostname && urlObj.hostname.length > 0);
    } catch {
      return false;
    }
  };

  const {
    data: serpResults,
    isLoading: fetchingSERPData,
    error,
  } = useGetSERPResults(submittedKeyword, selectedBase);

  // Filter valid results for sorting
  const validResults =
    serpResults?.filter((result) => result.url && isValidUrl(result.url)) || [];

  // Add sorting functionality
  const { sortedData, sortConfig, handleSort } = useTableSort(
    validResults as unknown as Record<string, unknown>[],
  );

  // Set default selections when SERP results are loaded
  useEffect(() => {
    if (serpResults && serpResults.length > 0) {
      const defaultSelections: Record<number, "URL" | "Domain" | "Off"> = {};

      serpResults.forEach((result, index) => {
        // Only set default selections for valid URLs
        if (result.url && isValidUrl(result.url)) {
          if (index < 10) {
            defaultSelections[result.rank] = "URL";
          } else {
            defaultSelections[result.rank] = "Off";
          }
        }
      });

      setSelections(defaultSelections);
    }
  }, [serpResults]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      setSubmittedKeyword(keyword.trim());
      setSelections({}); // Reset selections when new keyword is submitted
    }
  };

  const handleSelectionChange = (
    rank: number,
    value: "URL" | "Domain" | "Off",
  ) => {
    setSelections((prev) => ({
      ...prev,
      [rank]: value,
    }));
  };

  const handleBulkAction = (action: "URL" | "Domain" | "Off") => {
    if (serpResults) {
      const newSelections: Record<number, "URL" | "Domain" | "Off"> = {};
      serpResults.forEach((result) => {
        // Only apply bulk actions to valid URLs
        if (result.url && isValidUrl(result.url)) {
          newSelections[result.rank] = action;
        }
      });
      setSelections(newSelections);
    }
  };

  const handleShowLatestBacklinks = () => {
    if (!serpResults) return;

    // Extract URLs based on selections
    const urlsToCheck: string[] = [];

    serpResults.forEach((result) => {
      // Only process valid URLs
      if (!result.url || !isValidUrl(result.url)) return;

      const selection = selections[result.rank] || "Off";

      if (selection === "URL") {
        // For URL selection, use the full URL
        urlsToCheck.push(result.url);
      } else if (selection === "Domain") {
        // For Domain selection, extract domain from URL
        const domain = result.url
          .replace(/^https?:\/\//, "")
          .replace(/\/.*$/, "");
        urlsToCheck.push(domain);
      }
      // Skip "Off" selections
    });

    if (urlsToCheck.length > 0) {
      setSelectedUrls(urlsToCheck);
      setIsModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedUrls([]);
  };

  // Get flag component for the selected base
  const countryCode = baseToCountryCode[selectedBase] || "US";
  const Flag = flagMap[countryCode];

  return (
    <div className="space-y-6">
      <div className="flex gap-6">
        {/* Left: Select keyword and base */}
        <div className="min-w-72 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("form.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  type="text"
                  placeholder={t("form.keywordPlaceholder")}
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <Select value={selectedBase} onValueChange={setSelectedBase}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(BASE_DATA).map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </form>
            </CardContent>
          </Card>

          {/* Show latest backlinks button - only show when data is loaded */}
          {serpResults &&
            serpResults.filter((result) => result.url && isValidUrl(result.url))
              .length > 0 && (
              <Button
                onClick={handleShowLatestBacklinks}
                size="lg"
                className="w-full animate-pulse"
              >
                {t("form.showLatestBacklinks")}
              </Button>
            )}
        </div>

        {/* Right: SERP Results Table */}
        <Card className="flex-1">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              {submittedKeyword ? (
                <>
                  {t("results.title", { keyword: submittedKeyword })}
                  {Flag && <Flag title={countryCode} className="w-6 h-4" />}
                </>
              ) : (
                t("results.defaultTitle")
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!submittedKeyword ? (
              <span className="text-sm text-muted-foreground">
                {t("results.instruction")}
              </span>
            ) : fetchingSERPData ? (
              <div className="space-y-2">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="flex space-x-4">
                    <Skeleton className="h-4 w-[60px]" />
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  {t("errors.loading")}
                </AlertDescription>
              </Alert>
            ) : serpResults && serpResults.length > 0 ? (
              <>
                {/* Show info about filtered results */}
                {(() => {
                  const validResults = serpResults.filter(
                    (result) => result.url && isValidUrl(result.url),
                  );
                  const invalidCount = serpResults.length - validResults.length;

                  if (invalidCount > 0) {
                    return (
                      <Alert className="mb-4 border-blue-200 bg-blue-50">
                        <AlertDescription className="text-blue-800">
                          {t("filters.invalidUrlsFiltered", {
                            count: invalidCount,
                            plural: invalidCount !== 1 ? "s" : "",
                            validCount: validResults.length,
                            validPlural: validResults.length !== 1 ? "s" : "",
                          })}
                        </AlertDescription>
                      </Alert>
                    );
                  }
                  return null;
                })()}

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Select
                          onValueChange={(value: "URL" | "Domain" | "Off") =>
                            handleBulkAction(value)
                          }
                        >
                          <SelectTrigger className="w-[160px] h-8">
                            <SelectValue
                              placeholder={t("filters.bulkActions")}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="URL">
                              {t("filters.checkAllUrls")}
                            </SelectItem>
                            <SelectItem value="Domain">
                              {t("filters.checkAllDomains")}
                            </SelectItem>
                            <SelectItem value="Off">
                              {t("filters.ignoreAll")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableHead>
                      <SortableTableHead
                        sortKey="rank"
                        currentSortKey={sortConfig?.key || null}
                        currentDirection={sortConfig?.direction || null}
                        onSort={handleSort}
                      >
                        {t("table.columns.ranking")}
                      </SortableTableHead>
                      <SortableTableHead
                        sortKey="url"
                        currentSortKey={sortConfig?.key || null}
                        currentDirection={sortConfig?.direction || null}
                        onSort={handleSort}
                      >
                        {t("table.columns.url")}
                      </SortableTableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedData.map((result) => {
                      const typedResult =
                        result as unknown as (typeof validResults)[0];
                      const selection = selections[typedResult.rank] || "Off";
                      const isIgnored = selection === "Off";
                      const isCheckDomain = selection === "Domain";

                      return (
                        <TableRow
                          key={typedResult.rank}
                          className={isIgnored ? "opacity-50" : ""}
                        >
                          <TableCell className="py-0">
                            <Select
                              value={selection}
                              onValueChange={(
                                value: "URL" | "Domain" | "Off",
                              ) =>
                                handleSelectionChange(typedResult.rank, value)
                              }
                            >
                              <SelectTrigger className="w-[160px] h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="URL">
                                  {t("filters.checkUrl")}
                                </SelectItem>
                                <SelectItem value="Domain">
                                  {t("filters.checkDomain")}
                                </SelectItem>
                                <SelectItem value="Off">
                                  {t("filters.ignore")}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="font-medium">
                            {typedResult.rank}
                          </TableCell>
                          <TableCell
                            className={`truncate max-w-[600px] ${isCheckDomain ? "font-bold" : ""}`}
                          >
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center gap-2">
                                    <Favicon url={typedResult.url} size={16} />
                                    <a
                                      href={typedResult.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-600 hover:text-blue-800 underline truncate"
                                    >
                                      {typedResult.url}
                                    </a>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <span>{typedResult.url}</span>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {t("results.noResults", { keyword: submittedKeyword })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Latest Backlinks Modal */}
      <LatestBacklinksModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        urls={selectedUrls}
      />
    </div>
  );
}
