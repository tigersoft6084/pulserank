"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
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
  TableHead,
  TableHeader,
  TableRow,
  SortableTableHead,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetDomainReferringDomains } from "@/hooks/features/sites/use-sites";
import { ReferringDomain } from "@/types/urls";
import { TTF_COLOR_DATA } from "@/lib/config";
import { flagMap } from "@/lib/utils/flag-static-map";
import { useTableSort } from "@/hooks/use-table-sort";
import { PaginationControls } from "@/components/ui/pagination-controls";

export default function DomainRefDomainsPage() {
  const t = useTranslations("domainReferringDomains");
  const params = useParams();
  const domain = params.domain as string;
  const domainString = Array.isArray(domain) ? domain[0] : domain || "";

  // Pagination state
  const [page, setPage] = useState(1);
  const pageSize = 100;

  // Local filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filterInputs, setFilterInputs] = useState<
    Array<{ field: string; operator: string; value: string }>
  >([]);
  const [appliedFilters, setAppliedFilters] = useState<
    Array<{ field: string; operator: string; value: string }>
  >([]);

  // Data fetching
  const {
    data: referringDomainsData,
    isLoading,
    error,
  } = useGetDomainReferringDomains(
    domainString,
    appliedFilters,
    (page - 1) * pageSize,
    pageSize,
  );

  // Add sorting functionality
  const { sortedData, sortConfig, handleSort } = useTableSort(
    referringDomainsData?.data as unknown as Record<string, unknown>[],
  );

  const totalCount = referringDomainsData?.totalCount || 10000;
  const totalPages = Math.ceil(totalCount / pageSize);

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
      { field: "Domain", operator: "stringEqualTo", value: "" },
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
    setPage(1);
  };

  // Helper function to determine if a field is numeric
  const isNumericField = (field: string): boolean => {
    const numericFields = [
      "MatchedLinks",
      "RefDomains",
      "AlexaRank",
      "TrustFlow",
      "CitationFlow",
      "TopicalTrustFlow_Value_0",
    ];
    return numericFields.includes(field);
  };

  // Get available operators based on field type
  const getOperatorsForField = (field: string) => {
    if (isNumericField(field)) {
      return [
        { value: "numberEqualTo", label: t("operators.numberEqualTo") },
        { value: "numberGreaterThan", label: t("operators.numberGreaterThan") },
        { value: "numberLessThan", label: t("operators.numberLessThan") },
      ];
    } else {
      return [
        { value: "stringEqualTo", label: t("operators.stringEqualTo") },
        { value: "stringNotEqualTo", label: t("operators.stringNotEqualTo") },
      ];
    }
  };

  return (
    <div className="space-y-6">
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
                    <SelectItem value="Domain">{t("fields.domain")}</SelectItem>
                    <SelectItem value="MatchedLinks">
                      {t("fields.matchedLinks")}
                    </SelectItem>
                    <SelectItem value="RefDomains">
                      {t("fields.refDomains")}
                    </SelectItem>
                    <SelectItem value="AlexaRank">
                      {t("fields.alexaRank")}
                    </SelectItem>
                    <SelectItem value="IP">{t("fields.ip")}</SelectItem>
                    <SelectItem value="CountryCode">
                      {t("fields.countryCode")}
                    </SelectItem>
                    <SelectItem value="TLD">{t("fields.tld")}</SelectItem>
                    <SelectItem value="TrustFlow">
                      {t("fields.trustFlow")}
                    </SelectItem>
                    <SelectItem value="CitationFlow">
                      {t("fields.citationFlow")}
                    </SelectItem>
                    <SelectItem value="TopicalTrustFlow_Topic_0">
                      {t("fields.thematic")}
                    </SelectItem>
                    <SelectItem value="LastCrawl">
                      {t("fields.lastCrawl")}
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
                    {getOperatorsForField(filter.field || "Domain").map(
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

      {!domainString ? (
        <div className="text-center py-8 text-muted-foreground">
          {t("noDomain")}
        </div>
      ) : isLoading ? (
        <div className="space-y-6">
          <PaginationControls
            currentPage={page}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={setPage}
          />
          <Table>
            <TableHeader>
              <TableRow>
                <SortableTableHead
                  sortKey="Domain"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("table.domain")}
                </SortableTableHead>
                <SortableTableHead
                  sortKey="MatchedLinks"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("table.matchedLinks")}
                </SortableTableHead>
                <SortableTableHead
                  sortKey="RefDomains"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("table.refDomains")}
                </SortableTableHead>
                <SortableTableHead
                  sortKey="AlexaRank"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("table.alexaRank")}
                </SortableTableHead>
                <SortableTableHead
                  sortKey="IP"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("table.ip")}
                </SortableTableHead>
                <SortableTableHead
                  sortKey="CountryCode"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("table.country")}
                </SortableTableHead>
                <SortableTableHead
                  sortKey="TLD"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("table.tld")}
                </SortableTableHead>
                <SortableTableHead
                  sortKey="TrustFlow"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("table.tf")}
                </SortableTableHead>
                <SortableTableHead
                  sortKey="CitationFlow"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("table.cf")}
                </SortableTableHead>
                <TableHead>{t("table.percentage")}</TableHead>
                <TableHead>{t("table.theme")}</TableHead>
                <SortableTableHead
                  sortKey="LastCrawl"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                  className="min-w-[120px]"
                >
                  {t("table.lastCrawl")}
                </SortableTableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 10 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    <Skeleton className="h-4 w-[180px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[120px]" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3 w-4 rounded" />
                      <Skeleton className="h-3 w-8" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-8" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-8" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-12" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-[100px] rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[80px]" />
                  </TableCell>
                </TableRow>
              ))}
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
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500">{t("error")}</p>
        </div>
      ) : referringDomainsData &&
        referringDomainsData.data &&
        referringDomainsData.data.length > 0 ? (
        <>
          <PaginationControls
            currentPage={page}
            totalPages={totalPages}
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={setPage}
          />
          <Table>
            <TableHeader>
              <TableRow>
                <SortableTableHead
                  sortKey="Domain"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("table.domain")}
                </SortableTableHead>
                <SortableTableHead
                  sortKey="MatchedLinks"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("table.matchedLinks")}
                </SortableTableHead>
                <SortableTableHead
                  sortKey="RefDomains"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("table.refDomains")}
                </SortableTableHead>
                <SortableTableHead
                  sortKey="AlexaRank"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  Alexa
                </SortableTableHead>
                <SortableTableHead
                  sortKey="IP"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("table.ip")}
                </SortableTableHead>
                <SortableTableHead
                  sortKey="CountryCode"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("table.country")}
                </SortableTableHead>
                <SortableTableHead
                  sortKey="TLD"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("table.tld")}
                </SortableTableHead>
                <SortableTableHead
                  sortKey="TrustFlow"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("table.tf")}
                </SortableTableHead>
                <SortableTableHead
                  sortKey="CitationFlow"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("table.cf")}
                </SortableTableHead>
                <TableHead>{t("table.percentage")}</TableHead>
                <TableHead>{t("table.theme")}</TableHead>
                <SortableTableHead
                  sortKey="LastCrawl"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                  className="min-w-[120px]"
                >
                  {t("table.lastCrawl")}
                </SortableTableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedData.map((domain, index) => {
                const typedDomain = domain as unknown as ReferringDomain;
                const Flag = typedDomain.CountryCode
                  ? flagMap[typedDomain.CountryCode]
                  : null;
                const percentage =
                  typedDomain.TrustFlow > 0 && typedDomain.CitationFlow > 0
                    ? `${((typedDomain.TrustFlow / typedDomain.CitationFlow) * 100).toFixed(1)}%`
                    : "0%";

                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {typedDomain.Domain}
                    </TableCell>
                    <TableCell>{typedDomain.MatchedLinks}</TableCell>
                    <TableCell>{typedDomain.RefDomains}</TableCell>
                    <TableCell>{typedDomain.AlexaRank}</TableCell>
                    <TableCell>{typedDomain.IP}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {Flag ? (
                          <Flag
                            title={typedDomain.CountryCode}
                            className="w-4 h-3"
                          />
                        ) : (
                          <span className="w-4 h-3 bg-gray-200 rounded" />
                        )}
                        <span className="text-xs text-gray-500">
                          {typedDomain.CountryCode}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{typedDomain.TLD}</TableCell>
                    <TableCell>{typedDomain.TrustFlow}</TableCell>
                    <TableCell>{typedDomain.CitationFlow}</TableCell>
                    <TableCell>{percentage}</TableCell>
                    <TableCell>
                      {typedDomain.TopicalTrustFlow_Topic_0 && (
                        <Badge
                          style={{
                            backgroundColor:
                              TTF_COLOR_DATA[
                                typedDomain.TopicalTrustFlow_Topic_0.split(
                                  "/",
                                )[0] as keyof typeof TTF_COLOR_DATA
                              ],
                          }}
                        >
                          {typedDomain.TopicalTrustFlow_Value_0}{" "}
                          {typedDomain.TopicalTrustFlow_Topic_0}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{typedDomain.LastCrawl}</TableCell>
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
        </>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          {t("noData", { domain: domainString })}
        </div>
      )}
    </div>
  );
}
