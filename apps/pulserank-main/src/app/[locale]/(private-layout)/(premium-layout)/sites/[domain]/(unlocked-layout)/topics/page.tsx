"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableCell,
  SortableTableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TTF_COLOR_DATA } from "@/lib/config";
import { useTopics } from "@/hooks/features/sites/use-topics";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTableSort } from "@/hooks/use-table-sort";

export default function DomainTopicsPage() {
  const t = useTranslations("domainTopics");
  const params = useParams();
  const domain = params.domain as string;

  const { data: topicsResponse, isLoading, error } = useTopics(domain);

  const topicsData = topicsResponse?.data || [];

  // Group topics by category (first part before "/")
  const groupedTopics = topicsData.reduce(
    (acc, topic) => {
      const category = topic.Topic.split("/")[0];
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(topic);
      return acc;
    },
    {} as Record<string, typeof topicsData>,
  );

  // Calculate total referring domains for each category and sort categories by total
  const categoryTotals = Object.entries(groupedTopics)
    .map(([category, topics]) => ({
      category,
      totalRefDomains: topics.reduce((sum, topic) => sum + topic.RefDomains, 0),
      topics: topics.sort((a, b) => b.RefDomains - a.RefDomains), // Sort topics within category by RefDomains
    }))
    .sort((a, b) => b.totalRefDomains - a.totalRefDomains); // Sort categories by total RefDomains

  // Add sorting functionality
  const { sortedData, sortConfig, handleSort } = useTableSort(
    categoryTotals as unknown as Record<string, unknown>[],
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <SortableTableHead
                sortKey="category"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
                className="w-2/3"
              >
                {t("table.topic")}
              </SortableTableHead>
              <SortableTableHead
                sortKey="totalRefDomains"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
                className="text-right w-1/3"
              >
                {t("table.referringDomains")}
              </SortableTableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, categoryIndex) => (
              <React.Fragment key={`category-skeleton-${categoryIndex}`}>
                {/* Group header row skeleton */}
                <TableRow className="bg-muted/50">
                  <TableCell className="font-semibold">
                    <Skeleton className="h-6 w-[120px] rounded-full" />
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    <Skeleton className="h-4 w-[60px] ml-auto" />
                  </TableCell>
                </TableRow>
                {/* Topic rows skeleton */}
                {Array.from({ length: 3 }).map((_, topicIndex) => (
                  <TableRow key={`skeleton-${categoryIndex}-${topicIndex}`}>
                    <TableCell className="pl-8">
                      <Skeleton className="h-6 w-[140px] rounded-full" />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      <Skeleton className="h-4 w-[50px] ml-auto" />
                    </TableCell>
                  </TableRow>
                ))}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {t("error", { message: error.message })}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {topicsData.length > 0 ? (
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <SortableTableHead
                sortKey="category"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
                className="w-2/3"
              >
                {t("table.topic")}
              </SortableTableHead>
              <SortableTableHead
                sortKey="totalRefDomains"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
                className="text-right w-1/3"
              >
                {t("table.referringDomains")}
              </SortableTableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map(({ category, totalRefDomains, topics }) => {
              const typedCategory = category as unknown as string;
              const typedTotalRefDomains = totalRefDomains as unknown as number;
              const typedTopics = topics as unknown as typeof topicsData;

              return (
                <React.Fragment key={`category-${typedCategory}`}>
                  {/* Group header row */}
                  <TableRow
                    key={`header-${typedCategory}`}
                    className="bg-muted/50"
                  >
                    <TableCell className="font-semibold">
                      <Badge
                        style={{
                          backgroundColor:
                            TTF_COLOR_DATA[
                              typedCategory as keyof typeof TTF_COLOR_DATA
                            ],
                        }}
                      >
                        {typedCategory}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {typedTotalRefDomains.toLocaleString()}
                    </TableCell>
                  </TableRow>
                  {/* Topic rows */}
                  {typedTopics.map((topic, index) => (
                    <TableRow key={`${typedCategory}-${index}`}>
                      <TableCell className="pl-8">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                style={{
                                  backgroundColor:
                                    TTF_COLOR_DATA[
                                      topic.Topic.split(
                                        "/",
                                      )[0] as keyof typeof TTF_COLOR_DATA
                                    ],
                                }}
                                className="cursor-help"
                              >
                                {topic.Topic}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <span>
                                {topic.Topic} - {topic.RefDomains} referring
                                domains
                              </span>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {topic.RefDomains.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          {t("noData", { domain })}
        </div>
      )}
    </div>
  );
}
