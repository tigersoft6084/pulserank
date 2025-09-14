"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGetSameIPChecker } from "@/hooks/features/backlinks/use-backlink";
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
import { Favicon } from "@/components/ui/favicon";
import { LayoutGrid } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TTF_COLOR_DATA } from "@/lib/config";
import React from "react";
import { useTableSort } from "@/hooks/use-table-sort";

export default function SameIPCheckerPage() {
  const t = useTranslations("sameIpChecker");

  const [domain, setDomain] = useState("");
  const [dataSource, setDataSource] = useState("fresh");
  const [filterType, setFilterType] = useState("all");
  const [submittedDomain, setSubmittedDomain] = useState<string | null>(null);
  // const [showIPAlert, setShowIPAlert] = useState(true);

  const {
    data: sameIpData,
    isLoading: fetchingData,
    error,
  } = useGetSameIPChecker(submittedDomain, dataSource);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (domain.trim()) {
      setSubmittedDomain(domain.trim());
      // setShowIPAlert(true); // Reset alert visibility on new search
    }
  };

  const handleReset = () => {
    setDomain("");
    setDataSource("fresh");
    setFilterType("all");
    setSubmittedDomain(null);
    // setShowIPAlert(true);
  };

  // Filter data based on selected type
  const filteredData =
    sameIpData?.data.filter((item) => {
      if (filterType === "all") return true;
      return item.type === filterType;
    }) || [];

  // Add sorting functionality
  const { sortedData, sortConfig, handleSort } = useTableSort(
    filteredData as unknown as Record<string, unknown>[],
  );

  return (
    <div className="container pt-4 space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4 mx-auto">
        <div className="flex gap-4">
          <Label className="pt-2.5 w-40 text-right">{t("form.domain")}</Label>
          <Input
            className="h-9 p-2.5 text-sm"
            placeholder={t("form.domainPlaceholder")}
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          />
        </div>

        <div className="flex gap-4">
          <Label className="pt-2.5 w-40 text-right">
            {t("form.dataSource")}
          </Label>
          <Select value={dataSource} onValueChange={setDataSource}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fresh">{t("form.fresh")}</SelectItem>
              <SelectItem value="historic">{t("form.historic")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={handleReset}>
            {t("form.reset")}
          </Button>
          <Button
            type="submit"
            className="gap-2"
            disabled={fetchingData || !domain.trim()}
          >
            {fetchingData ? t("form.analyzing") : t("form.analyze")}
          </Button>
        </div>
      </form>

      {/* {submittedDomain &&
        sameIpData &&
        sameIpData.ipInfo.hasDifferentIPs &&
        showIPAlert && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800 flex items-center justify-between">
              <span>
                {t("alert.recommendation", {
                  ip: sameIpData.ipInfo.recommendedIP,
                })}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-red-600 hover:text-red-800 hover:bg-red-100"
                onClick={() => setShowIPAlert(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </AlertDescription>
          </Alert>
        )} */}

      {submittedDomain && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {t("results.title")}
            </CardTitle>
            <div className="flex items-center gap-2 justify-between">
              {sameIpData && (
                <div className="text-sm text-muted-foreground">
                  {t("results.summary", {
                    count:
                      filterType === "all"
                        ? sameIpData.totalFound
                        : filteredData.length,
                    searchType: sameIpData.searchType.toLowerCase(),
                    dataSource: sameIpData.dataSource,
                    sameIP: sameIpData.summary?.sameIP || 0,
                    sameSubnet: sameIpData.summary?.sameSubnet || 0,
                  })}
                  {filterType !== "all" && (
                    <span className="ml-2 text-blue-600">
                      {t("results.filtered", {
                        filterType:
                          filterType === "same-ip"
                            ? t("table.sameIp")
                            : t("table.sameSubnet"),
                      })}
                    </span>
                  )}
                </div>
              )}
              {submittedDomain && sameIpData && (
                <div className="flex gap-4 items-center">
                  <Label className="text-sm font-medium">
                    {t("results.filterByType")}
                  </Label>
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {t("results.all", { count: sameIpData.data.length })}
                      </SelectItem>
                      <SelectItem value="same-ip">
                        {t("results.sameIp", {
                          count: sameIpData.summary.sameIP,
                        })}
                      </SelectItem>
                      <SelectItem value="same-subnet">
                        {t("results.sameSubnet", {
                          count: sameIpData.summary.sameSubnet,
                        })}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {fetchingData ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex space-x-4">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-4 w-[100px]" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  {t("errors.loading")}
                </AlertDescription>
              </Alert>
            ) : sameIpData && sameIpData.data.length > 0 ? (
              <div className="space-y-6">
                {/* Original Domain Info */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">
                        {t("originalDomain.domain")}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <Favicon
                          url={sameIpData.originalDomain.domain}
                          size={16}
                        />
                        {sameIpData.originalDomain.domain}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">
                        {t("originalDomain.ip")}
                      </span>
                      <div className="mt-1">{sameIpData.originalDomain.ip}</div>
                    </div>
                    <div>
                      <span className="font-medium">
                        {t("originalDomain.trustFlow")}
                      </span>
                      <div className="mt-1">
                        {sameIpData.originalDomain.trustFlow}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">
                        {t("originalDomain.citationFlow")}
                      </span>
                      <div className="mt-1">
                        {sameIpData.originalDomain.citationFlow}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Results Table */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <SortableTableHead
                        sortKey="domain"
                        currentSortKey={sortConfig?.key || null}
                        currentDirection={sortConfig?.direction || null}
                        onSort={handleSort}
                      >
                        {t("table.columns.domain")}
                      </SortableTableHead>
                      <SortableTableHead
                        sortKey="ip"
                        currentSortKey={sortConfig?.key || null}
                        currentDirection={sortConfig?.direction || null}
                        onSort={handleSort}
                      >
                        {t("table.columns.ip")}
                      </SortableTableHead>
                      <SortableTableHead
                        sortKey="refDomains"
                        currentSortKey={sortConfig?.key || null}
                        currentDirection={sortConfig?.direction || null}
                        onSort={handleSort}
                      >
                        {t("table.columns.refDomains")}
                      </SortableTableHead>
                      <SortableTableHead
                        sortKey="backLinks"
                        currentSortKey={sortConfig?.key || null}
                        currentDirection={sortConfig?.direction || null}
                        onSort={handleSort}
                      >
                        {t("table.columns.backlinks")}
                      </SortableTableHead>
                      <SortableTableHead
                        sortKey="trustFlow"
                        currentSortKey={sortConfig?.key || null}
                        currentDirection={sortConfig?.direction || null}
                        onSort={handleSort}
                      >
                        {t("table.columns.tf")}
                      </SortableTableHead>
                      <SortableTableHead
                        sortKey="citationFlow"
                        currentSortKey={sortConfig?.key || null}
                        currentDirection={sortConfig?.direction || null}
                        onSort={handleSort}
                      >
                        {t("table.columns.cf")}
                      </SortableTableHead>
                      <SortableTableHead
                        sortKey="percentage"
                        currentSortKey={sortConfig?.key || null}
                        currentDirection={sortConfig?.direction || null}
                        onSort={handleSort}
                      >
                        {t("table.columns.percentage")}
                      </SortableTableHead>
                      <TableHead>{t("table.columns.theme")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedData.map((item, index) => {
                      const typedItem =
                        item as unknown as (typeof filteredData)[0];
                      return (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Favicon url={typedItem.domain} size={16} />
                              <a
                                href={`https://${typedItem.domain}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline truncate max-w-[200px]"
                              >
                                {typedItem.domain}
                              </a>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      className="p-2"
                                      size="sm"
                                      onClick={() =>
                                        window.open(
                                          `/sites/${encodeURIComponent(typedItem.domain)}/view`,
                                          "_blank",
                                        )
                                      }
                                    >
                                      <LayoutGrid className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <span>{t("table.viewSiteDetails")}</span>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </TableCell>
                          <TableCell>{typedItem.ip}</TableCell>
                          <TableCell>
                            {typedItem.refDomains.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {typedItem.backLinks.toLocaleString()}
                          </TableCell>
                          <TableCell>{typedItem.trustFlow}</TableCell>
                          <TableCell>{typedItem.citationFlow}</TableCell>
                          <TableCell>{typedItem.percentage}%</TableCell>
                          <TableCell>
                            {typedItem.theme && typedItem.themeValue ? (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge
                                      style={{
                                        backgroundColor:
                                          TTF_COLOR_DATA[
                                            typedItem.theme.split(
                                              "/",
                                            )[0] as keyof typeof TTF_COLOR_DATA
                                          ],
                                      }}
                                    >
                                      {typedItem.themeValue} {typedItem.theme}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <span>
                                      {typedItem.themeValue} {typedItem.theme}
                                    </span>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : sameIpData && sameIpData.data.length === 0 ? (
              <Alert>
                <AlertDescription>{t("errors.noDomains")}</AlertDescription>
              </Alert>
            ) : sameIpData && filteredData.length === 0 ? (
              <Alert>
                <AlertDescription>
                  {t("errors.noFilteredResults")}
                </AlertDescription>
              </Alert>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
