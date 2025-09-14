"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useTranslations } from "next-intl";

import { Input } from "@/components/ui/input";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TTF_COLOR_DATA } from "@/lib/config";
import { useDomainExtractor } from "@/hooks/features/sites/use-sites";
import { useTableSort } from "@/hooks/use-table-sort";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Favicon } from "@/components/ui/favicon";
import { DomainExtractorData } from "@/types/sites";
import { useLanguageStore } from "@/store/language-store";

export default function DomainExtractorPage() {
  const t = useTranslations("domainExtractor");

  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordsInput, setKeywordsInput] = useState("");
  const [position, setPosition] = useState("who-are-currently");
  const [rankRange, setRankRange] = useState("top-10");

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filterInputs, setFilterInputs] = useState<
    Array<{ field: string; operator: string; value: string }>
  >([]);
  const [appliedFilters, setAppliedFilters] = useState<
    Array<{ field: string; operator: string; value: string }>
  >([]);

  // Get flag for current search engine
  const { currentBase } = useLanguageStore();

  const {
    data: domainData,
    isLoading,
    error,
  } = useDomainExtractor({
    keywords,
    position,
    rankRange,
    base: currentBase,
    filters: appliedFilters,
  });

  // Add sorting functionality
  const { sortedData, sortConfig, handleSort } = useTableSort(
    (domainData?.data || []) as unknown as Record<string, unknown>[],
  );

  // Helper function to determine if a field is numeric
  const isNumericField = (field: string): boolean => {
    const numericFields = [
      "TrustFlow",
      "CitationFlow",
      "RefDomains",
      "TopicalTrustFlow_Value_0",
      "Percentage",
    ];
    return numericFields.includes(field);
  };

  // Get available operators based on field type
  const getOperatorsForField = (field: string) => {
    if (isNumericField(field)) {
      return [
        { value: "numberEqualTo", label: t("filters.operators.numberEqualTo") },
        {
          value: "numberGreaterThan",
          label: t("filters.operators.numberGreaterThan"),
        },
        {
          value: "numberLessThan",
          label: t("filters.operators.numberLessThan"),
        },
      ];
    } else {
      return [
        { value: "stringEqualTo", label: t("filters.operators.stringEqualTo") },
        {
          value: "stringNotEqualTo",
          label: t("filters.operators.stringNotEqualTo"),
        },
        { value: "contains", label: t("filters.operators.contains") },
        { value: "starts with", label: t("filters.operators.startsWith") },
        { value: "ends with", label: t("filters.operators.endsWith") },
      ];
    }
  };

  // Filter field change handler
  const handleFilterFieldChange = (index: number, field: string) => {
    const newFilterInputs = [...filterInputs];
    // Reset operator to first available option when field changes
    const operators = getOperatorsForField(field);
    newFilterInputs[index] = {
      ...newFilterInputs[index],
      field,
      operator: operators[0].value,
    };
    setFilterInputs(newFilterInputs);
  };

  // Filter operator change handler
  const handleFilterOperatorChange = (index: number, operator: string) => {
    const newFilterInputs = [...filterInputs];
    newFilterInputs[index] = { ...newFilterInputs[index], operator };
    setFilterInputs(newFilterInputs);
  };

  // Filter value change handler
  const handleFilterValueChange = (index: number, value: string) => {
    const newFilterInputs = [...filterInputs];
    newFilterInputs[index] = { ...newFilterInputs[index], value };
    setFilterInputs(newFilterInputs);
  };

  // Add filter handler
  const handleAddFilter = () => {
    setFilterInputs([
      ...filterInputs,
      { field: "URL", operator: "stringEqualTo", value: "" },
    ]);
  };

  // Remove filter handler
  const handleRemoveFilter = (index: number) => {
    setFilterInputs(filterInputs.filter((_, i) => i !== index));
  };

  // Filter apply handler
  const handleApplyFilters = () => {
    setAppliedFilters([...filterInputs]);
  };

  const handleClearFilters = () => {
    setAppliedFilters([]);
    setFilterInputs([]);
  };

  const handleFilter = () => {
    // Parse keywords from textarea
    const keywordsList = keywordsInput
      .split(/[,\n]/)
      .map((keyword) => keyword.trim())
      .filter((keyword) => keyword.length > 0);

    if (keywordsList.length > 0) {
      setKeywords(keywordsList);
    }
  };

  const handleReset = () => {
    setKeywordsInput("");
    setKeywords([]);
    setPosition("who-are-currently");
    setRankRange("top-10");
    setAppliedFilters([]);
    setFilterInputs([]);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {t("search.lookingFor")}
          </span>
          <Select value={position} onValueChange={setPosition}>
            <SelectTrigger className="w-[300px]">
              <SelectValue placeholder="Select position" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="who-are-currently">
                {t("search.whoAreCurrently")}
              </SelectItem>
              <SelectItem value="who-were-in-the-last-6-months">
                {t("search.whoWereInLast6Months")}
              </SelectItem>
              <SelectItem value="who-are-on-everything">
                {t("search.whoAreOnEverything")}
              </SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            {t("search.inThe")}
          </span>
          <Select value={rankRange} onValueChange={setRankRange}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Select position" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="top-10">{t("search.top10")}</SelectItem>
              <SelectItem value="top-50">{t("search.top50")}</SelectItem>
              <SelectItem value="top-100">{t("search.top100")}</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            {t("search.forTheseKeywords")}
          </span>
        </div>

        <div className="flex flex-col gap-4">
          <Textarea
            value={keywordsInput}
            onChange={(e) => setKeywordsInput(e.target.value)}
            placeholder={t("search.keywordsPlaceholder")}
            className="min-h-[100px]"
          />

          <div className="flex gap-2 self-end">
            <Button variant="outline" onClick={handleReset}>
              {t("search.reset")}
            </Button>
            <Button onClick={handleFilter} disabled={isLoading}>
              {isLoading ? t("search.loading") : t("search.showResults")}
            </Button>
          </div>
        </div>
      </div>

      {keywords.length > 0 && (
        <div className="rounded-md border">
          <button
            className="w-full flex items-center gap-2 p-4 text-left bg-muted rounded-md hover:bg-card hover:rounded-md transition-colors shadow-sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <svg
              className={`w-4 h-4 transition-transform ${showFilters ? "" : "-rotate-90"}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                d="M19 9l-7 7-7-7"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-sm text-gray-600">
              {t("filters.advancedFilters")}
            </span>
          </button>

          {showFilters && (
            <div className="p-4 space-y-4">
              {filterInputs.map((filter, index) => (
                <div key={index} className="flex gap-2">
                  <Select
                    value={filter.field}
                    onValueChange={(value) =>
                      handleFilterFieldChange(index, value)
                    }
                  >
                    <SelectTrigger className="w-[180px] p-5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="URL">
                        {t("filters.fields.url")}
                      </SelectItem>
                      <SelectItem value="TrustFlow">
                        {t("filters.fields.trustFlow")}
                      </SelectItem>
                      <SelectItem value="CitationFlow">
                        {t("filters.fields.citationFlow")}
                      </SelectItem>
                      <SelectItem value="RefDomains">
                        {t("filters.fields.refDomains")}
                      </SelectItem>
                      <SelectItem value="TopicalTrustFlow_Value_0">
                        {t("filters.fields.ttfValue")}
                      </SelectItem>
                      <SelectItem value="TopicalTrustFlow_Topic_0">
                        {t("filters.fields.ttfTopic")}
                      </SelectItem>
                      <SelectItem value="Percentage">
                        {t("filters.fields.percentage")}
                      </SelectItem>
                      <SelectItem value="Title">
                        {t("filters.fields.title")}
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filter.operator}
                    onValueChange={(value) =>
                      handleFilterOperatorChange(index, value)
                    }
                  >
                    <SelectTrigger className="w-[180px] p-5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getOperatorsForField(filter.field || "URL").map((op) => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    className="flex-1"
                    placeholder={t("filters.valuePlaceholder")}
                    value={filter.value || ""}
                    onChange={(e) =>
                      handleFilterValueChange(index, e.target.value)
                    }
                  />

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10"
                    onClick={() => handleRemoveFilter(index)}
                  >
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        d="M6 18L18 6M6 6l12 12"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </Button>
                </div>
              ))}

              <div className="flex justify-between">
                <Button
                  variant="ghost"
                  className="text-sm"
                  onClick={handleAddFilter}
                >
                  <span className="mr-2">+</span>
                  {t("filters.addFilter")}
                </Button>
                <div className="flex items-center gap-2">
                  {appliedFilters.length > 0 && (
                    <Button
                      variant="ghost"
                      className="text-sm"
                      onClick={handleClearFilters}
                    >
                      {t("filters.clearFilters")}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    className="text-sm"
                    onClick={handleApplyFilters}
                  >
                    {t("filters.filter")}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results Table */}
      {keywords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("results.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex space-x-4">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[50px]" />
                    <Skeleton className="h-4 w-[50px]" />
                    <Skeleton className="h-4 w-[50px]" />
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-4 w-[80px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  {t("results.error")}
                </AlertDescription>
              </Alert>
            ) : domainData && domainData.data.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableTableHead
                      sortKey="URL"
                      currentSortKey={sortConfig?.key || null}
                      currentDirection={sortConfig?.direction || null}
                      onSort={handleSort}
                    >
                      {t("results.columns.url")}
                    </SortableTableHead>
                    <SortableTableHead
                      sortKey="TrustFlow"
                      currentSortKey={sortConfig?.key || null}
                      currentDirection={sortConfig?.direction || null}
                      onSort={handleSort}
                    >
                      {t("results.columns.tf")}
                    </SortableTableHead>
                    <SortableTableHead
                      sortKey="CitationFlow"
                      currentSortKey={sortConfig?.key || null}
                      currentDirection={sortConfig?.direction || null}
                      onSort={handleSort}
                    >
                      {t("results.columns.cf")}
                    </SortableTableHead>
                    <SortableTableHead
                      sortKey="TopicalTrustFlow_Value_0"
                      currentSortKey={sortConfig?.key || null}
                      currentDirection={sortConfig?.direction || null}
                      onSort={handleSort}
                    >
                      {t("results.columns.ttf")}
                    </SortableTableHead>
                    <SortableTableHead
                      sortKey="percentage"
                      currentSortKey={sortConfig?.key || null}
                      currentDirection={sortConfig?.direction || null}
                      onSort={handleSort}
                    >
                      {t("results.columns.percentage")}
                    </SortableTableHead>
                    <SortableTableHead
                      sortKey="RefDomains"
                      currentSortKey={sortConfig?.key || null}
                      currentDirection={sortConfig?.direction || null}
                      onSort={handleSort}
                    >
                      {t("results.columns.refDomains")}
                    </SortableTableHead>
                    <SortableTableHead
                      sortKey="Title"
                      currentSortKey={sortConfig?.key || null}
                      currentDirection={sortConfig?.direction || null}
                      onSort={handleSort}
                    >
                      {t("results.columns.title")}
                    </SortableTableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedData.map((item, index) => {
                    const typedItem = item as unknown as DomainExtractorData;
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Favicon url={typedItem.URL} size={16} />
                            <a
                              href={`https://${typedItem.URL}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline"
                            >
                              {typedItem.URL}
                            </a>
                          </div>
                        </TableCell>
                        <TableCell>{typedItem.TrustFlow}</TableCell>
                        <TableCell>{typedItem.CitationFlow}</TableCell>
                        <TableCell>
                          {typedItem.TopicalTrustFlow_Value_0 > 0 ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
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
                                </TooltipTrigger>
                                <TooltipContent>
                                  <span>
                                    {typedItem.TopicalTrustFlow_Value_0}{" "}
                                    {typedItem.TopicalTrustFlow_Topic_0}
                                  </span>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          {typedItem.TrustFlow > 0 && typedItem.CitationFlow > 0
                            ? Math.round(
                                (typedItem.TrustFlow / typedItem.CitationFlow) *
                                  100,
                              )
                            : "-"}
                          %
                        </TableCell>
                        <TableCell>{typedItem.RefDomains}</TableCell>
                        <TableCell className="truncate">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span>{typedItem.Title}</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <span>{typedItem.Title}</span>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="mb-2">{t("results.noData")}</p>
                <p className="text-sm">{t("results.noDataDescription")}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
