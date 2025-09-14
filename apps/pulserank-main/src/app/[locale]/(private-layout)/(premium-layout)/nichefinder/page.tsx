"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  useNicheFinder,
  type NicheFinderFilters,
  type NicheFinderKeyword,
} from "@/hooks/features/serp/use-niche-finder";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  SortableTableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import useDebounce from "@/hooks/use-debounce";
import { ExternalLink, Search, Target, History } from "lucide-react";
import { PaginationControls } from "@/components/ui/pagination-controls";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import { useTableSort } from "@/hooks/use-table-sort";
import { useLanguageStore } from "@/store/language-store";

export default function NicheFinderPage() {
  const t = useTranslations("nicheFinder");
  const router = useRouter();

  // Pagination state
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // Search state
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebounce(searchInput, 500);

  // Get flag for current search engine
  const { currentBase } = useLanguageStore();

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filterInputs, setFilterInputs] = useState<NicheFinderFilters[]>([]);
  const [appliedFilters, setAppliedFilters] = useState<NicheFinderFilters[]>(
    [],
  );

  // Data fetching
  const {
    data: nicheFinderData,
    isLoading,
    error,
  } = useNicheFinder({
    page,
    limit: pageSize,
    search: debouncedSearch,
    filters: appliedFilters,
    base: currentBase,
  });

  // Add sorting functionality
  const { sortedData, sortConfig, handleSort } = useTableSort(
    (nicheFinderData?.data || []) as unknown as Record<string, unknown>[],
  );

  const totalCount = nicheFinderData?.pagination.total || 0;
  const totalPages = nicheFinderData?.pagination.pages || 0;

  // Helper function to determine if a field is numeric
  const isNumericField = (field: string): boolean => {
    const numericFields = [
      "search_volume",
      "cpc",
      "competition",
      "interest",
      "trends",
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
      { field: "keyword", operator: "stringEqualTo", value: "" },
    ]);
  };

  // Remove filter handler
  const handleRemoveFilter = (index: number) => {
    setFilterInputs(filterInputs.filter((_, i) => i !== index));
  };

  // Filter apply handler
  const handleApplyFilters = () => {
    setAppliedFilters([...filterInputs]);
    setPage(1);
  };

  const handleClearFilters = () => {
    setAppliedFilters([]);
    setFilterInputs([]);
    setPage(1);
  };

  // Pagination handlers

  // Action handlers
  const handleCompetitionCheck = (keyword: string) => {
    router.push(
      `/positions/competition?keyword=${encodeURIComponent(keyword)}`,
    );
  };

  const handleSerpMachine = (keyword: string) => {
    router.push(`/serpmachine?keyword=${encodeURIComponent(keyword)}`);
  };

  const handleRelatedSearch = (keyword: string) => {
    // Split keyword into individual words and create filter
    const words = keyword.split(/\s+/).filter((word) => word.length > 0);
    const filterValue = words.map((word) => `"${word}"`).join(" ");

    // Set the search input to the filter value
    setSearchInput(filterValue);
    setPage(1);
  };

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(2)}`;
  };

  // Get the data to display (either sorted or original)
  const displayData = sortConfig ? sortedData : nicheFinderData?.data || [];

  return (
    <div className="space-y-6">
      {/* Search and Base Selector */}
      <div className="flex justify-end items-center">
        <Input
          placeholder={t("search.placeholder")}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Advanced Filters */}
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
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="keyword">
                      {t("filters.fields.keyword")}
                    </SelectItem>
                    <SelectItem value="search_volume">
                      {t("filters.fields.searchVolume")}
                    </SelectItem>
                    <SelectItem value="cpc">
                      {t("filters.fields.cpc")}
                    </SelectItem>
                    <SelectItem value="competition">
                      {t("filters.fields.competition")}
                    </SelectItem>
                    <SelectItem value="interest">
                      {t("filters.fields.interest")}
                    </SelectItem>
                    <SelectItem value="trends">
                      {t("filters.fields.trends")}
                    </SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filter.operator}
                  onValueChange={(value) =>
                    handleFilterOperatorChange(index, value)
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getOperatorsForField(filter.field || "keyword").map(
                      (op) => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ),
                    )}
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

            <div className="flex items-center gap-2 justify-between">
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

      {/* Results Table */}
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : error ? (
        <div className="text-center text-red-500">
          {t("error", { message: error?.message || "Unknown error" })}
        </div>
      ) : displayData.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-muted-foreground text-lg">
            {t("noData", { defaultValue: "No data is available" })}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <SortableTableHead
                  sortKey="keyword"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("table.columns.keyword")}
                </SortableTableHead>
                <SortableTableHead
                  sortKey="search_volume"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("table.columns.searchVolume")}
                </SortableTableHead>
                <SortableTableHead
                  sortKey="cpc"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("table.columns.cpc")}
                </SortableTableHead>
                <SortableTableHead
                  sortKey="competition"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("table.columns.competition")}
                </SortableTableHead>
                <SortableTableHead
                  sortKey="interest"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("table.columns.interest")}
                </SortableTableHead>
                <SortableTableHead
                  sortKey="trends"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("table.columns.trends")}
                </SortableTableHead>
                <SortableTableHead
                  sortKey="actions"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                  className="w-[120px]"
                >
                  {t("table.columns.actions")}
                </SortableTableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayData.map((keyword) => {
                const typedKeyword = keyword as unknown as NicheFinderKeyword;
                return (
                  <TableRow key={typedKeyword.id}>
                    <TableCell className="font-medium flex items-center gap-2 justify-between">
                      <span>{typedKeyword.keyword}</span>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(typedKeyword.keyword)}`;
                          window.open(searchUrl, "_blank");
                        }}
                        title={t("search.viewInGoogleSERP")}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </TableCell>
                    <TableCell>
                      {formatNumber(typedKeyword.search_volume)}
                    </TableCell>
                    <TableCell>{formatCurrency(typedKeyword.cpc)}</TableCell>
                    <TableCell>{typedKeyword.competition}</TableCell>
                    <TableCell>{typedKeyword.interest}</TableCell>
                    <TableCell>
                      <div className="text-xs text-muted-foreground">
                        <span className="text-green-600">↗</span>{" "}
                        {t("table.trending")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  handleCompetitionCheck(typedKeyword.keyword)
                                }
                              >
                                <Target className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t("actions.competitionChecker")}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  handleSerpMachine(typedKeyword.keyword)
                                }
                              >
                                <History className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t("actions.serpMachine")}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() =>
                                  handleRelatedSearch(typedKeyword.keyword)
                                }
                              >
                                <Search className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t("actions.relatedSearch")}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          <PaginationControls
            currentPage={page}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
