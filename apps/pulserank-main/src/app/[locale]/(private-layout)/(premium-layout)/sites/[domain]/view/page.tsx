"use client";

import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useGetDomainInfo } from "@/hooks/features/sites/use-domain-info";
import { useGetDomainOnsite } from "@/hooks/features/sites/use-domain-onsite";
import { useGetDomainHistoricalMetrics } from "@/hooks/features/sites/use-domain-historical-metrics";
import { useGetDomainHistoricalData } from "@/hooks/features/sites/use-domain-historical-data";
import { useDomainKeywords } from "@/hooks/features/sites/use-domain-keywords";
import { useUrlKeywords } from "@/hooks/features/urls/use-url-keywords";
import { useGetDomainAnchors } from "@/hooks/features/sites/use-sites";
import { useDomainCompetitors } from "@/hooks/features/sites/use-domain-competitors";
import { useDomainTopBacklinks } from "@/hooks/features/sites/use-domain-top-backlinks";
import { useDomainTopPages } from "@/hooks/features/sites/use-domain-top-pages";
import { useGetDomainTopicalTrustFlow } from "@/hooks/features/sites/use-domain-topical-trust-flow";
import { useGetDomainTraffic } from "@/hooks/features/sites/use-domain-traffic";
import { useEffect } from "react";
import { useCreateUserHistory } from "@/hooks/features/user-histories/use-user-histories";
import {
  OffsiteDataCard,
  OnsiteDataCard,
  HistoricalMetricsCard,
  KeywordRankingsCard,
  AnchorsDetailCard,
  TopPagesCard,
  TopBacklinksCard,
  CompetitorsCard,
  TopicalTrustFlowCard,
} from "@/components/features/sites/domain/cards";
import { useCheckDomainUnlockStatus } from "@/hooks/features/user/use-unlocked-domains";

export default function DomainViewPage() {
  const { domain } = useParams();
  const domainString = Array.isArray(domain) ? domain[0] : domain || "";
  const t = useTranslations("identityCard");
  const { mutate: createHistory } = useCreateUserHistory();
  const { data: isDomainUnlocked } = useCheckDomainUnlockStatus(domainString);
  // Centralized data fetching - all queries run here

  const {
    data: domainInfo,
    isLoading: domainInfoLoading,
    error,
  } = useGetDomainInfo(domainString);
  const {
    data: onsiteData,
    isLoading: onsiteLoading,
    error: onsiteError,
  } = useGetDomainOnsite(domainString);

  // Historical data
  const { data: historicalMetricsData, isLoading: historicalMetricsLoading } =
    useGetDomainHistoricalMetrics(domainString, 30);
  const { data: historicalData, isLoading: historicalDataLoading } =
    useGetDomainHistoricalData(domainString, 30);

  // Keywords data
  const { data: semrushKeywordsData, isLoading: semrushKeywordsLoading } =
    useDomainKeywords(domainString, 1, 10);
  const { data: seobserverKeywordsData, isLoading: seobserverKeywordsLoading } =
    useUrlKeywords(domainString, 0, 10);

  // Other domain data
  const { data: anchorsData, isLoading: anchorsLoading } =
    useGetDomainAnchors(domainString);
  const { data: competitorsData, isLoading: competitorsLoading } =
    useDomainCompetitors(domainString, 5);
  const { data: topBacklinksData, isLoading: topBacklinksLoading } =
    useDomainTopBacklinks(domainString, 0, 10);
  const { data: topPagesData, isLoading: topPagesLoading } = useDomainTopPages(
    domainString,
    0,
    10,
  );
  const { data: topicalTrustFlowData, isLoading: topicalTrustFlowLoading } =
    useGetDomainTopicalTrustFlow(domainString);
  const { data: trafficData, isLoading: trafficLoading } =
    useGetDomainTraffic(domainString);

  // Create user history when domain info is loaded
  useEffect(() => {
    if (domainString && domainInfo && !domainInfoLoading) {
      createHistory({
        description: "Viewed identity card",
        item: domainString,
        cost: 0,
      });
    }
  }, [domainString, domainInfo, domainInfoLoading, createHistory]);

  if (!domainString) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t("noDomain")}
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertDescription className="text-red-800">
          {t("error")}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <OffsiteDataCard
        domainInfo={domainInfo}
        domainString={domainString}
        historicalMetricsData={historicalMetricsData}
        trafficData={trafficData}
        historicalMetricsLoading={historicalMetricsLoading}
        trafficLoading={trafficLoading}
        domainInfoLoading={domainInfoLoading}
      />
      <OnsiteDataCard
        onsiteData={onsiteData}
        isLoading={onsiteLoading}
        error={onsiteError}
      />
      <HistoricalMetricsCard
        historicalMetricsData={historicalMetricsData}
        historicalData={historicalData}
        historicalMetricsLoading={historicalMetricsLoading}
        historicalDataLoading={historicalDataLoading}
      />

      <div className="flex gap-3">
        <KeywordRankingsCard
          domain={domainString}
          semrushKeywordsData={semrushKeywordsData}
          seobserverKeywordsData={seobserverKeywordsData}
          semrushKeywordsLoading={semrushKeywordsLoading}
          seobserverKeywordsLoading={seobserverKeywordsLoading}
          isUnlocked={isDomainUnlocked}
        />
        <AnchorsDetailCard
          domain={domainString}
          anchorsData={anchorsData}
          anchorsLoading={anchorsLoading}
          isUnlocked={isDomainUnlocked}
        />
      </div>

      <div className="flex gap-3">
        <TopPagesCard
          domain={domainString}
          topPagesData={topPagesData}
          topPagesLoading={topPagesLoading}
          isUnlocked={isDomainUnlocked}
        />
        <TopBacklinksCard
          domain={domainString}
          topBacklinksData={topBacklinksData}
          topBacklinksLoading={topBacklinksLoading}
          isUnlocked={isDomainUnlocked}
        />
      </div>

      <CompetitorsCard
        competitorsData={competitorsData}
        competitorsLoading={competitorsLoading}
      />
      <TopicalTrustFlowCard
        topicalTrustFlowData={topicalTrustFlowData}
        topicalTrustFlowLoading={topicalTrustFlowLoading}
      />
    </div>
  );
}
