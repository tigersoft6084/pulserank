import { useQuery } from "@tanstack/react-query";
import { AxiosInstance } from "@/lib/axios-instance";

export interface WebsiteProfilerParams {
  urls: string[];
  category?: string;
  datasource?: string;
  view: "compact" | "detailed" | "competition" | "crawl";
}

export interface CompactViewItem {
  URL: string;
  RefDomains: number;
  BackLinks: number;
  RefIPs: number;
  RefSubnets: number;
  TrustFlow: number;
  CitationFlow: number;
  TopicalTrustFlow_Topic_0: string;
  TopicalTrustFlow_Value_0: number;
}

export interface DetailedViewItem {
  URL: string;
  metrics: {
    theme: string;
    topicalTrustFlowValue: number;
    cf: number;
    tf: number;
    refDomains: number;
    refIPs: number;
    refSubnets: number;
    backlinks: number;
  };
  keywords: Array<{
    keyword: string;
    traffic: number;
    position: number;
  }>;
  anchors: Array<{
    anchor: string;
    count: number;
    percentage: number;
  }>;
  topBacklinks: Array<{
    domain: string;
    ttf: number;
    theme: string;
  }>;
  error?: string;
}

export interface CompetitionViewItem {
  URL: string;
  urlMetrics: {
    trustFlow: number;
    citationFlow: number;
    topicalTrustFlowTopic: string;
    topicalTrustFlowValue: number;
    refDomains: number;
  };
  domainMetrics: {
    trustFlow: number;
    citationFlow: number;
    topicalTrustFlowTopic: string;
    topicalTrustFlowValue: number;
    refDomains: number;
  };
  semrushMetrics: {
    keywords: number;
    traffic: number;
  };
  error?: string;
}

export interface CrawlViewItem {
  URL: string;
  status: string;
  lastCrawlResult: string;
  lastCrawlDate: string;
  lastSeen: string;
  error?: string;
}

export interface WebsiteProfilerResponse {
  data:
    | CompactViewItem[]
    | DetailedViewItem[]
    | CompetitionViewItem[]
    | CrawlViewItem[];
  view: string;
}

export const useWebsiteProfiler = (params: WebsiteProfilerParams) => {
  return useQuery<WebsiteProfilerResponse>({
    queryKey: ["website-profiler", params],
    queryFn: async () => {
      if (!params.urls || params.urls.length === 0) {
        throw new Error("URLs are required");
      }

      if (params.urls.length > 100) {
        throw new Error("Maximum 100 URLs allowed");
      }

      const { data } = await AxiosInstance.post(
        "/api/seo/sites/websiteprofiler",
        {
          urls: params.urls,
          category: params.category || "auto",
          datasource: params.datasource || "fresh",
          view: params.view,
        }
      );
      return data;
    },
    enabled: params.urls.length > 0 && params.urls.length <= 100,
  });
};
