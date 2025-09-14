"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import {
  validateMultiFormatList,
  type MultiFormatValidationResult,
} from "@/lib/utils/url-utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGetTopBacklinks } from "@/hooks/features/backlinks/use-backlink";
import {
  Table,
  TableBody,
  TableCell,
  SortableTableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TTF_COLOR_DATA } from "@/lib/config";
import { FlagIcons } from "@/components/features/backlinks/flag-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Favicon } from "@/components/ui/favicon";
import { useTableSort } from "@/hooks/use-table-sort";
import { useFlagFilter } from "@/hooks/features/sites/use-flag-filter";
import { FilterableTableHeader } from "@/components/features/sites/domain/backlinks/filterable-table-header";
import { BacklinkFlags } from "@/types/backlinks";

export default function ListTopBacklinksPage() {
  const t = useTranslations("listTopBacklinks");
  const searchParams = useSearchParams();
  const [urls, setUrls] = useState("");
  const [validationResult, setValidationResult] =
    useState<MultiFormatValidationResult | null>(null);
  const [items, setItems] = useState<string[]>([]);
  const maxSites = 10;

  // Use the flag filtering hook
  const { flagFilters, handleFlagClick, resetFlagFilters, filterByFlags } =
    useFlagFilter();

  // Handle URL parameter
  useEffect(() => {
    const urlsParam = searchParams.get("urls");
    if (urlsParam) {
      const decodedUrls = decodeURIComponent(urlsParam);
      setUrls(decodedUrls);

      // Auto-submit if URLs are provided
      const validationTranslations = {
        empty: t("validation.empty"),
        tooMany: (max: number, count: number) =>
          t("validation.tooMany", { max, count }),
        invalidFormat: (line: number, url: string) =>
          t("validation.invalidFormat", { line, url }),
      };

      const result = validateMultiFormatList(
        decodedUrls,
        maxSites,
        validationTranslations,
      );
      setValidationResult(result);

      if (result.isValid) {
        setItems(result.validItems);
      }
    }
  }, [searchParams]);

  const {
    data: backlinksData,
    isLoading: fetchingBacklinksData,
    error,
  } = useGetTopBacklinks(items);

  // Add sorting functionality
  const { sortedData, sortConfig, handleSort } = useTableSort(
    (backlinksData || []) as unknown as Record<string, unknown>[],
  );

  // Apply flag filtering to the sorted data
  const filteredData = filterByFlags(
    sortedData as {
      Flags: BacklinkFlags;
    }[],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Create translation functions for the validator
    const validationTranslations = {
      empty: t("validation.empty"),
      tooMany: (max: number, count: number) =>
        t("validation.tooMany", { max, count }),
      invalidFormat: (line: number, url: string) =>
        t("validation.invalidFormat", { line, url }),
    };

    // Validate the input
    const result = validateMultiFormatList(
      urls,
      maxSites,
      validationTranslations,
    );
    setValidationResult(result);

    if (result.isValid) {
      setItems(result.validItems);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Data loaded successfully

  return (
    <div className="space-y-6">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Textarea
          id="urls"
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
          placeholder={t("form.placeholder")}
          className="min-h-[120px]"
        />
        <div className="flex items-center gap-3 self-end">
          <span className="text-muted-foreground text-sm">
            {t("form.maxSites", { max: maxSites })}
          </span>
          <Button type="submit" disabled={fetchingBacklinksData}>
            {fetchingBacklinksData ? "Validating..." : t("form.submit")}
          </Button>
        </div>
      </form>

      {/* Validation Results */}
      {validationResult && !validationResult.isValid && (
        <Alert className="border-red-200 bg-red-50 mt-4">
          <AlertDescription className="text-red-800">
            <ul className="list-disc list-inside space-y-1">
              {validationResult.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Results Table */}
      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("listTopBacklinksResults.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            {fetchingBacklinksData ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex space-x-4">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-4 w-[100px]" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  {t("listTopBacklinksResults.error")}
                </AlertDescription>
              </Alert>
            ) : backlinksData && backlinksData.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableTableHead
                      sortKey="SourceURL"
                      currentSortKey={sortConfig?.key || null}
                      currentDirection={sortConfig?.direction || null}
                      onSort={handleSort}
                    >
                      {t("listTopBacklinksResults.table.sourceUrl")}
                    </SortableTableHead>
                    <SortableTableHead
                      sortKey="AnchorText"
                      currentSortKey={sortConfig?.key || null}
                      currentDirection={sortConfig?.direction || null}
                      onSort={handleSort}
                    >
                      {t("listTopBacklinksResults.table.anchor")}
                    </SortableTableHead>
                    <FilterableTableHeader
                      title={t("listTopBacklinksResults.table.flag")}
                      activeFilter={flagFilters.size > 0 ? "active" : null}
                      onResetFilter={resetFlagFilters}
                      filterType="flag"
                      flagFilters={flagFilters}
                    />
                    <SortableTableHead
                      sortKey="Domain"
                      currentSortKey={sortConfig?.key || null}
                      currentDirection={sortConfig?.direction || null}
                      onSort={handleSort}
                    >
                      {t("listTopBacklinksResults.table.domain")}
                    </SortableTableHead>
                    <SortableTableHead
                      sortKey="LastSeenDate"
                      currentSortKey={sortConfig?.key || null}
                      currentDirection={sortConfig?.direction || null}
                      onSort={handleSort}
                    >
                      {t("listTopBacklinksResults.table.lastSeen")}
                    </SortableTableHead>
                    <SortableTableHead
                      sortKey="SourceTrustFlow"
                      currentSortKey={sortConfig?.key || null}
                      currentDirection={sortConfig?.direction || null}
                      onSort={handleSort}
                    >
                      {t("listTopBacklinksResults.table.tf")}
                    </SortableTableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((backlink, index) => {
                    const typedBacklink =
                      backlink as unknown as (typeof backlinksData)[0];
                    return (
                      <TableRow key={index}>
                        <TableCell className="truncate max-w-[200px]">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-2">
                                  <Favicon
                                    url={typedBacklink.SourceURL}
                                    size={16}
                                  />
                                  <a
                                    href={typedBacklink.SourceURL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:text-blue-800 underline"
                                  >
                                    {typedBacklink.SourceURL}
                                  </a>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <span>{typedBacklink.SourceURL}</span>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell className="truncate max-w-[200px]">
                          {typedBacklink.AnchorText || "N/A"}
                        </TableCell>
                        <TableCell>
                          <FlagIcons
                            Flags={typedBacklink.Flags}
                            onFlagClick={handleFlagClick}
                            activeFilters={flagFilters}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Favicon url={typedBacklink.Domain} size={16} />
                            <span>{typedBacklink.Domain}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDate(typedBacklink.LastSeenDate)}
                        </TableCell>
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
                            {typedBacklink.SourceTrustFlow}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {t("listTopBacklinksResults.noData")}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
