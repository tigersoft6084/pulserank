import { useQuery } from "@tanstack/react-query";
import { AxiosInstance } from "@/lib/axios-instance";

export interface HistoricalMetricsData {
  id: string;
  domain: string;
  extBacklinks: number;
  refDomains: number;
  alexaRank: string;
  ip: string;
  subnet: string;
  trustFlow: number;
  citationFlow: number;
  percentage: number;
  topicalTrustFlowTopic0: string;
  topicalTrustFlowValue0: number;
  fetchedAt: string;
  createdAt: string;
  updatedAt: string;
}

// Interface expected by the chart components
export interface ChartHistoricalMetricsData {
  date: string;
  ttfTopic: string;
  ttfScore: number;
  refDomains: number;
}

export const useGetDomainHistoricalMetrics = (
  domain: string,
  limit: number = 30,
) => {
  return useQuery<ChartHistoricalMetricsData[]>({
    queryKey: ["domain-historical-metrics", domain, limit],
    queryFn: async () => {
      if (!domain) {
        throw new Error("Domain is required");
      }

      const { data } = await AxiosInstance.get(
        `/api/seo/sites/${domain}/historical?limit=${limit}`,
      );

      // Transform the data to match the expected chart format
      return data.data.map((item: HistoricalMetricsData) => ({
        date: new Date(item.fetchedAt).toLocaleDateString("en-US", {
          month: "short",
          year: "2-digit",
        }),
        ttfTopic: item.topicalTrustFlowTopic0 || "computers",
        ttfScore: item.trustFlow,
        refDomains: item.refDomains,
      }));
    },
    enabled: !!domain,
    staleTime: 1000 * 60 * 15, // 15 minutes - since this is real data
  });
};
