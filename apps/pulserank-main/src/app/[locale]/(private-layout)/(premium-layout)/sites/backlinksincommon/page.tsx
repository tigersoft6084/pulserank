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
import { useGetBacklinksInCommon } from "@/hooks/features/backlinks/use-backlink";
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
import { Skeleton } from "@/components/ui/skeleton";
import { TTF_COLOR_DATA } from "@/lib/config";
import { BacklinksDetailModal } from "@/components/features/backlinks/backlinks-detail-modal";
import { Favicon } from "@/components/ui/favicon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTableSort } from "@/hooks/use-table-sort";

export default function BacklinksInCommonPage() {
  const t = useTranslations("backlinksInCommon");
  const searchParams = useSearchParams();
  const [urls, setUrls] = useState("");
  const [validationResult, setValidationResult] =
    useState<MultiFormatValidationResult | null>(null);
  const [items, setItems] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedRefdomain, setSelectedRefdomain] = useState<string | null>(
    null,
  );
  const maxSites = 10;

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
  } = useGetBacklinksInCommon(items);

  // Add sorting functionality
  const { sortedData, sortConfig, handleSort } = useTableSort(
    (backlinksData || []) as unknown as Record<string, unknown>[],
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

  const handleBacklinkClick = (domain: string, refdomain: string) => {
    setSelectedItem(domain);
    setSelectedRefdomain(refdomain);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setSelectedRefdomain(null);
  };

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
            <CardTitle>{t("backlinksInCommonResults.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            {fetchingBacklinksData ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex space-x-4">
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
                  {t("backlinksInCommonResults.error")}
                </AlertDescription>
              </Alert>
            ) : backlinksData && backlinksData.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableTableHead
                      sortKey="Domain"
                      currentSortKey={sortConfig?.key || null}
                      currentDirection={sortConfig?.direction || null}
                      onSort={handleSort}
                    >
                      {t("backlinksInCommonResults.table.domain")}
                    </SortableTableHead>
                    <SortableTableHead
                      sortKey="RefDomains"
                      currentSortKey={sortConfig?.key || null}
                      currentDirection={sortConfig?.direction || null}
                      onSort={handleSort}
                    >
                      {t("backlinksInCommonResults.table.refDomains")}
                    </SortableTableHead>
                    <SortableTableHead
                      sortKey="TrustFlow"
                      currentSortKey={sortConfig?.key || null}
                      currentDirection={sortConfig?.direction || null}
                      onSort={handleSort}
                    >
                      {t("backlinksInCommonResults.table.trustFlow")}
                    </SortableTableHead>
                    <SortableTableHead
                      sortKey="CitationFlow"
                      currentSortKey={sortConfig?.key || null}
                      currentDirection={sortConfig?.direction || null}
                      onSort={handleSort}
                    >
                      {t("backlinksInCommonResults.table.citationFlow")}
                    </SortableTableHead>
                    <SortableTableHead
                      sortKey="AlexaRank"
                      currentSortKey={sortConfig?.key || null}
                      currentDirection={sortConfig?.direction || null}
                      onSort={handleSort}
                    >
                      {t("backlinksInCommonResults.table.alexaRank")}
                    </SortableTableHead>
                    <SortableTableHead
                      sortKey="Matches"
                      currentSortKey={sortConfig?.key || null}
                      currentDirection={sortConfig?.direction || null}
                      onSort={handleSort}
                    >
                      {t("backlinksInCommonResults.table.matches")}
                    </SortableTableHead>
                    {items.map((item, index) => (
                      <TableHead key={index} className="text-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span>
                                <Favicon url={item} size={16} />
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>{item}</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedData.map((backlink, index) => {
                    const typedBacklink =
                      backlink as unknown as (typeof backlinksData)[0];
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Favicon url={typedBacklink.Domain} size={16} />
                            <span>{typedBacklink.Domain}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {typedBacklink.RefDomains.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            style={{
                              backgroundColor:
                                TTF_COLOR_DATA[
                                  typedBacklink.TopicalTrustFlow_Topic_0.split(
                                    "/",
                                  )[0] as keyof typeof TTF_COLOR_DATA
                                ],
                            }}
                          >
                            {typedBacklink.TrustFlow || "-1"}
                          </Badge>
                        </TableCell>
                        <TableCell>{typedBacklink.CitationFlow}</TableCell>
                        <TableCell>
                          {typedBacklink.AlexaRank > 0
                            ? typedBacklink.AlexaRank.toLocaleString()
                            : "N/A"}
                        </TableCell>
                        <TableCell>{typedBacklink.Matches}</TableCell>
                        {items.map((item, index) => (
                          <TableCell key={index} className="py-0">
                            <Button
                              variant="link"
                              className="p-0"
                              onClick={() =>
                                handleBacklinkClick(item, typedBacklink.Domain)
                              }
                            >
                              {
                                typedBacklink.Backlinks_Counts[
                                  items.indexOf(item)
                                ]
                              }
                            </Button>
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {t("backlinksInCommonResults.noData")}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <BacklinksDetailModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        item={selectedItem}
        refdomain={selectedRefdomain}
        count={10}
      />
    </div>
  );
}
