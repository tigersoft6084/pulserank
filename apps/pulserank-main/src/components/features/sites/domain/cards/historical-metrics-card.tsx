import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DomainHistoricalMetricsPanel } from "../panels/historical-metrics/historical-metrics-panel";
import { DomainHistoricalTable } from "../panels/historical-metrics/historical-table";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { HistoricalMetricsData as HistoricalMetricsDataFromData } from "@/hooks/features/sites/use-domain-historical-data";
import { ChartHistoricalMetricsData } from "@/hooks/features/sites/use-domain-historical-metrics";

interface HistoricalMetricsCardProps {
  historicalMetricsData?: ChartHistoricalMetricsData[];
  historicalData?: HistoricalMetricsDataFromData[];
  historicalMetricsLoading: boolean;
  historicalDataLoading: boolean;
}

export function HistoricalMetricsCard({
  historicalMetricsData,
  historicalData,
  historicalMetricsLoading,
  historicalDataLoading,
}: HistoricalMetricsCardProps) {
  const t = useTranslations("identityCard");

  const isLoading = historicalMetricsLoading || historicalDataLoading;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("cards.historicalMetrics")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {/* Chart Panel */}
            <div className="lg:w-3/5 w-full h-[360px] border border-gray-200 rounded-md p-3">
              <div className="space-y-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-[300px] w-full" />
              </div>
            </div>

            {/* Table Panel */}
            <div className="lg:w-2/5 w-full h-[360px] border border-gray-200 rounded-md p-3">
              <div className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <div className="space-y-2">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("cards.historicalMetrics")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3">
          <div className="lg:w-3/5 w-full h-[360px]">
            <DomainHistoricalMetricsPanel
              data={historicalMetricsData}
              isLoading={historicalMetricsLoading}
            />
          </div>
          <div className="lg:w-2/5 w-full h-[360px]">
            <DomainHistoricalTable
              data={historicalData}
              isLoading={historicalDataLoading}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
