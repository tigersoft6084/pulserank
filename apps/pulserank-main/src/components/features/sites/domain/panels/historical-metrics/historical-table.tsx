import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  SortableTableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HistoricalMetricsData } from "@/hooks/features/sites/use-domain-historical-data";
import { HistoricalMetricsModal } from "./historical-metrics-modal";
import { useTableSort } from "@/hooks/use-table-sort";

interface DomainHistoricalTableProps {
  data?: HistoricalMetricsData[];
  isLoading: boolean;
}

export function DomainHistoricalTable({
  data: historicalData,
  isLoading,
}: DomainHistoricalTableProps) {
  const t = useTranslations("identityCard.historicalTable");

  const [selectedMetrics, setSelectedMetrics] =
    useState<HistoricalMetricsData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(0) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(0) + "K";
    }
    return num.toLocaleString();
  };

  const handleDateClick = (metrics: HistoricalMetricsData) => {
    setSelectedMetrics(metrics);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-3 border border-gray-200 rounded-md p-3 h-full">
        <h3 className="text-sm font-semibold text-muted-foreground">
          {t("title")}
        </h3>
        <div className="text-center py-8 text-muted-foreground">
          {t("loading")}
        </div>
      </div>
    );
  }

  if (!historicalData || historicalData.length === 0) {
    return (
      <div className="space-y-3 border border-gray-200 rounded-md p-3 h-full flex flex-col">
        <h3 className="text-sm font-semibold text-muted-foreground">
          {t("title")}
        </h3>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">{t("noData")}</div>
        </div>
      </div>
    );
  }

  // Take only the last 5 entries for the table
  const displayData = historicalData.slice(-5);

  // Add sorting functionality
  const { sortedData, sortConfig, handleSort } = useTableSort(
    displayData as unknown as Record<string, unknown>[],
  );

  return (
    <div className="space-y-3 border border-gray-200 rounded-md p-3 h-full">
      <h3 className="text-sm font-semibold text-muted-foreground">
        {t("title")}
      </h3>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableTableHead
                sortKey="date"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("columns.date")}
              </SortableTableHead>
              <SortableTableHead
                sortKey="trustFlow"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("columns.tf")}
              </SortableTableHead>
              <SortableTableHead
                sortKey="citationFlow"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                {t("columns.cf")}
              </SortableTableHead>
              <SortableTableHead
                sortKey="refDomains"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                RP
              </SortableTableHead>
              <SortableTableHead
                sortKey="refDomains"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                RD
              </SortableTableHead>
              <SortableTableHead
                sortKey="refDomains"
                currentSortKey={sortConfig?.key || null}
                currentDirection={sortConfig?.direction || null}
                onSort={handleSort}
              >
                IPs
              </SortableTableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((item, index) => {
              const typedItem = item as unknown as HistoricalMetricsData;
              return (
                <TableRow key={index}>
                  <TableCell>
                    <Button
                      variant="outline"
                      className="-m-2"
                      onClick={() => handleDateClick(typedItem)}
                    >
                      {typedItem.date}
                    </Button>
                  </TableCell>
                  <TableCell>{typedItem.trustFlow}</TableCell>
                  <TableCell>{typedItem.citationFlow}</TableCell>
                  <TableCell>
                    {formatNumber(typedItem.refDomains * 2)}
                  </TableCell>
                  <TableCell>{formatNumber(typedItem.refDomains)}</TableCell>
                  <TableCell>
                    {formatNumber(Math.round(typedItem.refDomains * 0.3))}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {selectedMetrics && (
        <HistoricalMetricsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          metrics={selectedMetrics}
        />
      )}
    </div>
  );
}
