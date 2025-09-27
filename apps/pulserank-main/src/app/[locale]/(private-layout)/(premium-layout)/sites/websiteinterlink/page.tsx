"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { filterValidUrls, type ValidationResult } from "@/lib/utils/url-utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGetWebsiteInterlink } from "@/hooks/features/backlinks/use-backlink";
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
import { WebsiteInterlinkDetailModal } from "@/components/features/backlinks/modal/website-interlink-detail-modal";
import { Favicon } from "@/components/ui/favicon";
import { LayoutGrid } from "lucide-react";
import { WebsiteInterlinkDetail } from "@/types/backlinks";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTableSort } from "@/hooks/use-table-sort";

export default function WebsiteInterlinkPage() {
  const t = useTranslations("websiteInterlink");
  const [urls, setUrls] = useState("");
  const [datasource, setDatasource] = useState("fresh");
  const [options, setOptions] = useState("dont-include-closet-ips");
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
  const [domains, setDomains] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);
  const [selectedDetails, setSelectedDetails] = useState<
    WebsiteInterlinkDetail[]
  >([]);
  const maxSites = 10;

  const {
    data: interlinkData,
    isLoading: fetchingInterlinkData,
    error,
  } = useGetWebsiteInterlink(domains, datasource);

  // Add sorting functionality
  const { sortedData, sortConfig, handleSort } = useTableSort(
    (interlinkData || []) as unknown as Record<string, unknown>[]
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
    const result = filterValidUrls(urls, maxSites, validationTranslations);
    setValidationResult(result);

    if (result.isValid) {
      // Extract domains from URLs and set them for the query
      const extractedDomains = result.validUrls.map((url) => {
        // Remove protocol and path, keep only domain
        return url.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
      });
      setDomains(extractedDomains);
    }
  };

  const handleReset = () => {
    setUrls("");
    setDatasource("fresh");
    setOptions("dont-include-closet-ips");
    setValidationResult(null);
    setDomains([]);
    setIsModalOpen(false);
    setSelectedUrl(null);
  };

  const handleLinksFromOtherClick = (
    url: string,
    details: WebsiteInterlinkDetail[]
  ) => {
    setSelectedUrl(url);
    setSelectedDetails(details);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedUrl(null);
    setSelectedDetails([]);
  };

  return (
    <div className="container pt-4 space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4 mx-auto">
        <div className="flex gap-4">
          <Label className="pt-2.5 w-20 text-right">{t("form.urls")}</Label>
          <Textarea
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            placeholder={t("form.placeholder")}
            className="min-h-[120px]"
          />
        </div>

        <div className="flex gap-4">
          <Label className="pt-2.5 w-20 text-right">
            {t("form.datasource")}
          </Label>
          <Select value={datasource} onValueChange={setDatasource}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a datasource" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fresh">{t("form.fresh")}</SelectItem>
              <SelectItem value="historic">{t("form.historic")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-4">
          <Label className="pt-2.5 w-20 text-right">{t("form.options")}</Label>
          <Select value={options} onValueChange={setOptions}>
            <SelectTrigger>
              <SelectValue placeholder="Choose options" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dont-include-closet-ips">
                {t("form.dontIncludeClosetIps")}
              </SelectItem>
              <SelectItem value="include-closet-ips">
                {t("form.includeClosetIps")}
              </SelectItem>
              <SelectItem value="check-only-first-website">
                {t("form.checkOnlyFirstWebsite")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {validationResult && !validationResult.isValid && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {validationResult.errors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={handleReset}>
            {t("form.reset")}
          </Button>
          <Button
            type="submit"
            className="gap-2"
            disabled={fetchingInterlinkData}
          >
            {fetchingInterlinkData ? "Analyzing..." : t("form.submit")}
          </Button>
        </div>
      </form>

      {domains.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("table.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            {fetchingInterlinkData ? (
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
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-4 w-[50px]" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  {t("table.errorLoading")}
                </AlertDescription>
              </Alert>
            ) : interlinkData && interlinkData.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <SortableTableHead
                      sortKey="URL"
                      currentSortKey={sortConfig?.key || null}
                      currentDirection={sortConfig?.direction || null}
                      onSort={handleSort}
                    >
                      {t("table.columns.url")}
                    </SortableTableHead>
                    <SortableTableHead
                      sortKey="LinksFromOther"
                      currentSortKey={sortConfig?.key || null}
                      currentDirection={sortConfig?.direction || null}
                      onSort={handleSort}
                    >
                      {t("table.columns.linksFromOther")}
                    </SortableTableHead>
                    <SortableTableHead
                      sortKey="IP"
                      currentSortKey={sortConfig?.key || null}
                      currentDirection={sortConfig?.direction || null}
                      onSort={handleSort}
                    >
                      {t("table.columns.ip")}
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
                      item as unknown as (typeof interlinkData)[0];
                    return (
                      <TableRow key={index}>
                        <TableCell className="font-medium flex gap-2">
                          <div className="flex items-center gap-2">
                            <Favicon url={typedItem.URL} size={16} />
                            {typedItem.URL}
                          </div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="p-2"
                                  size="sm"
                                  onClick={() =>
                                    window.open(
                                      `/sites/${encodeURIComponent(typedItem.URL)}/view`,
                                      "_blank"
                                    )
                                  }
                                >
                                  <LayoutGrid className="w-4 h-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <span>View site details</span>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="link"
                            className="p-0"
                            onClick={() =>
                              handleLinksFromOtherClick(
                                typedItem.URL,
                                typedItem.details
                              )
                            }
                          >
                            {typedItem.LinksFromOther}
                          </Button>
                        </TableCell>
                        <TableCell>{typedItem.IP}</TableCell>
                        <TableCell>
                          {typedItem.RefDomains.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {typedItem.BackLinks.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {typedItem.RefIPs.toLocaleString()}
                        </TableCell>
                        <TableCell>{typedItem.TF}</TableCell>
                        <TableCell>{typedItem.CF}</TableCell>
                        <TableCell>
                          {typedItem.TF > 0 && typedItem.CF > 0
                            ? Math.round((typedItem.TF / typedItem.CF) * 100)
                            : 0}
                          %
                        </TableCell>
                        <TableCell>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge
                                  style={{
                                    backgroundColor:
                                      TTF_COLOR_DATA[
                                        typedItem.Theme[0].split(
                                          "/"
                                        )[0] as keyof typeof TTF_COLOR_DATA
                                      ],
                                  }}
                                >
                                  {typedItem.Theme[1]} {typedItem.Theme[0]}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <span>Topical Trust Flow</span>
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
                {t("table.noData")}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <WebsiteInterlinkDetailModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        url={selectedUrl}
        interlinkDetails={selectedDetails}
        isLoading={false}
        error={null}
      />
    </div>
  );
}
