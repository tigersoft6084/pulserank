"use client";

import { useTranslations } from "next-intl";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useGetTopBacklinks } from "@/hooks/features/urls/use-url";
import { useViewUrlStore } from "@/store/view-url-store";
import { UrlInput } from "@/components/features/urls/url-input";
import { useTableSort } from "@/hooks/use-table-sort";

import { TTF_COLOR_DATA } from "@/lib/config";
import { FlagIcons } from "@/components/features/backlinks/flag-icons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Favicon } from "@/components/ui/favicon";
import { useFlagFilter } from "@/hooks/features/sites/use-flag-filter";
import { FilterableTableHeader } from "@/components/features/sites/domain/backlinks/filterable-table-header";
import { BacklinkFlags } from "@/types/backlinks";

export default function BacklinksPage() {
  const {
    url,
    submittedUrl,
    setUrl,
    setSubmittedUrl,
    maxUrlsPerDomain,
    setMaxUrlsPerDomain,
  } = useViewUrlStore();
  const t = useTranslations("urlBacklinks");

  // Use the flag filtering hook
  const { flagFilters, handleFlagClick, resetFlagFilters, filterByFlags } =
    useFlagFilter();

  const {
    data: topBacklinksData,
    isLoading,
    error,
  } = useGetTopBacklinks(submittedUrl, maxUrlsPerDomain);

  // Add sorting functionality
  const { sortedData, sortConfig, handleSort } = useTableSort(
    (topBacklinksData?.data || []) as unknown as Record<string, unknown>[],
  );

  // Apply flag filtering to the sorted data
  const filteredData = filterByFlags(
    sortedData as {
      Flags: BacklinkFlags;
    }[],
  );

  const handleSubmit = (submittedUrl: string) => {
    setSubmittedUrl(submittedUrl);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <UrlInput
        url={url}
        onUrlChange={setUrl}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        submitButtonText={t("input.submitButton")}
        placeholder={t("input.placeholder")}
      />

      <div className="flex items-center gap-4 pl-2">
        <Label htmlFor="maxUrlsPerDomain">{t("controls.maxUrlsLabel")}</Label>
        <Select value={maxUrlsPerDomain} onValueChange={setMaxUrlsPerDomain}>
          <SelectTrigger className="flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">{t("controls.options.1")}</SelectItem>
            <SelectItem value="3">{t("controls.options.3")}</SelectItem>
            <SelectItem value="10">{t("controls.options.10")}</SelectItem>
            <SelectItem value="all">{t("controls.options.all")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!submittedUrl ? (
        <div className="text-center py-8 text-muted-foreground">
          {t("input.enterUrlMessage")}
        </div>
      ) : isLoading ? (
        <div className="text-center py-8 text-muted-foreground">
          {t("loading")}
        </div>
      ) : error ? (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            {t("error")}
          </AlertDescription>
        </Alert>
      ) : topBacklinksData?.data && topBacklinksData.data.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <SortableTableHead
                  sortKey="SourceURL"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("table.sourceUrl")}
                </SortableTableHead>
                <SortableTableHead
                  sortKey="AnchorText"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("table.anchor")}
                </SortableTableHead>
                <FilterableTableHeader
                  title={t("table.type")}
                  activeFilter={flagFilters.size > 0 ? "active" : null}
                  onResetFilter={resetFlagFilters}
                  filterType="flag"
                  flagFilters={flagFilters}
                />
                <SortableTableHead
                  sortKey="SourceTrustFlow"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                  className="text-right"
                >
                  {t("table.tf")}
                </SortableTableHead>
                <SortableTableHead
                  sortKey="SourceCitationFlow"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                  className="text-right"
                >
                  {t("table.cf")}
                </SortableTableHead>
                <TableHead>{t("table.theme")}</TableHead>
                <SortableTableHead
                  sortKey="LastSeenDate"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("table.lastSeenDate")}
                </SortableTableHead>
                <SortableTableHead
                  sortKey="FirstIndexedDate"
                  currentSortKey={sortConfig?.key || null}
                  currentDirection={sortConfig?.direction || null}
                  onSort={handleSort}
                >
                  {t("table.discoveredDate")}
                </SortableTableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((backlink, index) => {
                const typedBacklink = backlink as unknown as {
                  SourceURL: string;
                  AnchorText: string;
                  Flags: BacklinkFlags;
                  SourceTrustFlow: number;
                  SourceCitationFlow: number;
                  SourceTopicalTrustFlow_Topic_0: string;
                  SourceTopicalTrustFlow_Value_0: number;
                  LastSeenDate: string;
                  FirstIndexedDate: string;
                };
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
                      {typedBacklink.AnchorText || t("emptyAnchorText")}
                    </TableCell>
                    <TableCell>
                      <FlagIcons
                        Flags={typedBacklink.Flags}
                        onFlagClick={handleFlagClick}
                        activeFilters={flagFilters}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      {typedBacklink.SourceTrustFlow}
                    </TableCell>
                    <TableCell className="text-right">
                      {typedBacklink.SourceCitationFlow}
                    </TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
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
                              {typedBacklink.SourceTopicalTrustFlow_Value_0}{" "}
                              {typedBacklink.SourceTopicalTrustFlow_Topic_0}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent>
                            <span>
                              {typedBacklink.SourceTopicalTrustFlow_Value_0}{" "}
                              {typedBacklink.SourceTopicalTrustFlow_Topic_0}
                            </span>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      {formatDate(typedBacklink.LastSeenDate)}
                    </TableCell>
                    <TableCell>
                      {formatDate(typedBacklink.FirstIndexedDate)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          {t("noData", { url: submittedUrl })}
        </div>
      )}
    </div>
  );
}
