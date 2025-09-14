import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DomainOffsiteDataPanel } from "../panels/offsite-data/offsite-data-panel";
import { DomainInfoPanel } from "../panels/offsite-data/info-panel";
import { DomainAnchorTextPanel } from "../panels/offsite-data/anchor-text-panel";
import { DomainTrafficPanel } from "../panels/offsite-data/traffic-panel";
import { DomainHistoricalMetricsPanel } from "../panels/historical-metrics/historical-metrics-panel";
import { useTranslations } from "next-intl";
import { DomainInfo } from "@/types/sites";
import { DomainOverviewData } from "@/types/api/semrush";
import { Skeleton } from "@/components/ui/skeleton";
import { ChartHistoricalMetricsData } from "@/hooks/features/sites/use-domain-historical-metrics";

export function OffsiteDataCard({
  domainInfo,
  domainString,
  historicalMetricsData,
  trafficData,
  historicalMetricsLoading,
  trafficLoading,
  domainInfoLoading,
}: {
  domainInfo?: DomainInfo;
  domainString: string;
  historicalMetricsData?: ChartHistoricalMetricsData[];
  trafficData?: DomainOverviewData[];
  historicalMetricsLoading: boolean;
  trafficLoading: boolean;
  domainInfoLoading: boolean;
}) {
  const t = useTranslations("identityCard");

  if (domainInfoLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("cards.offsiteData")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex lg:flex-row flex-col gap-4">
            {/* Offsite Data Panel - Trust Flow & Citation Flow table */}
            <div className="lg:w-1/3 w-full border border-gray-200 rounded-md p-3">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-4 rounded" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4 rounded" />
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-8" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Info Panel - Referring domains, backlinks, etc. */}
            <div className="lg:w-1/3 w-full border border-gray-200 rounded-md p-3">
              <div className="space-y-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-4 rounded" />
                    </div>
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </div>

            {/* Anchor Text Panel - Pie chart */}
            <div className="lg:w-1/3 w-full border border-gray-200 rounded-md p-3">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-4 rounded" />
                </div>
                <div className="flex items-center justify-center h-[180px]">
                  <Skeleton className="h-32 w-32 rounded-full" />
                </div>
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Skeleton className="h-3 w-3 rounded" />
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-3 w-8" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex lg:flex-row flex-col gap-4">
            {/* Historical Metrics Chart */}
            <div className="lg:w-1/2 w-full h-[260px] border border-gray-200 rounded-md p-3">
              <div className="space-y-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-[200px] w-full" />
              </div>
            </div>

            {/* Traffic Chart */}
            <div className="lg:w-1/2 w-full h-[260px] border border-gray-200 rounded-md p-3">
              <div className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-[200px] w-full" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!domainInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("cards.offsiteData")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            {t("noData", { domain: domainString })}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("cards.offsiteData")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex lg:flex-row flex-col gap-4">
          <DomainOffsiteDataPanel offsiteData={domainInfo.offsiteData} />
          <DomainInfoPanel domainInfo={domainInfo.domainInfo} />
          <DomainAnchorTextPanel anchorTextData={domainInfo.anchorTextData} />
        </div>
        <div className="flex lg:flex-row flex-col gap-4">
          <div className="lg:w-1/2 w-full h-[260px]">
            <DomainHistoricalMetricsPanel
              data={historicalMetricsData}
              isLoading={historicalMetricsLoading}
            />
          </div>
          <div className="lg:w-1/2 w-full h-[260px]">
            <DomainTrafficPanel
              domain={domainString}
              data={trafficData}
              isLoading={trafficLoading}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
