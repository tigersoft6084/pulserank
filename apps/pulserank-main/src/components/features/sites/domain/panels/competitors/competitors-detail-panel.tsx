"use client";

import { useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableCell,
  SortableTableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Favicon } from "@/components/ui/favicon";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { LayoutGrid } from "lucide-react";
import { DomainCompetitorsResponse } from "@/hooks/features/sites/use-domain-competitors";
import { useTableSort } from "@/hooks/use-table-sort";

interface DomainCompetitorsDetailPanelProps {
  competitorsData?: DomainCompetitorsResponse;
  competitorsLoading: boolean;
}

export function DomainCompetitorsDetailPanel({
  competitorsData,
  competitorsLoading,
}: DomainCompetitorsDetailPanelProps) {
  const t = useTranslations("identityCard.competitorsPanel");

  // Add sorting functionality
  const { sortedData, sortConfig, handleSort } = useTableSort(
    competitorsData?.data as unknown as Record<string, unknown>[],
  );

  if (competitorsLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t("loading")}
      </div>
    );
  }

  if (!competitorsData?.data || competitorsData.data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t("noData")}
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <SortableTableHead
            sortKey="domain"
            currentSortKey={sortConfig?.key || null}
            currentDirection={sortConfig?.direction || null}
            onSort={handleSort}
            className="w-[40%]"
          >
            {t("columns.domain")}
          </SortableTableHead>
          <SortableTableHead
            sortKey="commonKeywords"
            currentSortKey={sortConfig?.key || null}
            currentDirection={sortConfig?.direction || null}
            onSort={handleSort}
          >
            {t("columns.commonKeywords")}
          </SortableTableHead>
          <SortableTableHead
            sortKey="totalKeywords"
            currentSortKey={sortConfig?.key || null}
            currentDirection={sortConfig?.direction || null}
            onSort={handleSort}
          >
            {t("columns.totalKeywords")}
          </SortableTableHead>
          <SortableTableHead
            sortKey="traffic"
            currentSortKey={sortConfig?.key || null}
            currentDirection={sortConfig?.direction || null}
            onSort={handleSort}
          >
            {t("columns.traffic")}
          </SortableTableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedData.map((competitor, index) => {
          const typedCompetitor =
            competitor as unknown as (typeof competitorsData.data)[0];
          return (
            <TableRow
              key={index}
              className={index % 2 === 0 ? "bg-muted/5" : ""}
            >
              <TableCell className="truncate max-w-[200px]">
                <div className="flex items-center gap-2">
                  <Favicon
                    url={`https://${typedCompetitor.domain}`}
                    size={16}
                  />
                  <a
                    href={`https://${typedCompetitor.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline text-sm truncate"
                  >
                    {typedCompetitor.domain}
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
                              `/sites/${encodeURIComponent(typedCompetitor.domain)}/view`,
                              "_blank",
                            )
                          }
                        >
                          <LayoutGrid className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <span>{t("viewSiteDetails")}</span>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableCell>
              <TableCell>{typedCompetitor.commonKeywords}</TableCell>
              <TableCell>{typedCompetitor.totalKeywords}</TableCell>
              <TableCell>{typedCompetitor.traffic}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
