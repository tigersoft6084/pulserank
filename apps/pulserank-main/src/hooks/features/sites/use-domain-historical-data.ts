import { useQuery } from "@tanstack/react-query";
import { AxiosInstance } from "@/lib/axios-instance";

// API response data structure from the historical endpoint
interface HistoricalMetricsAPIResponse {
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

// Detailed historical metrics data structure for the table component
export interface HistoricalMetricsData {
  date: string;
  item: string;
  resultCode: string;
  status: string;
  indexedURLs: number;
  trustFlow: number;
  citationFlow: number;
  tfcfRatio: string;
  refDomains: number;
  refIPs: number;
  refSubNets: number;
  title: string;
  redirectTo: string;
  topicalTrustFlow: Array<{
    topic: string;
    value: number;
    percent: string;
  }>;
}

export const useGetDomainHistoricalData = (
  domain: string,
  limit: number = 30,
) => {
  return useQuery<HistoricalMetricsData[]>({
    queryKey: ["domain-historical-data", domain, limit],
    queryFn: async () => {
      if (!domain) {
        throw new Error("Domain is required");
      }

      const { data } = await AxiosInstance.get(
        `/api/seo/sites/${domain}/historical?limit=${limit}`,
      );

      // Transform the data to match the expected table format
      return data.data.map((item: HistoricalMetricsAPIResponse) => ({
        date: new Date(item.fetchedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "2-digit",
        }),
        item: item.domain,
        resultCode: "OK",
        status: "Found",
        indexedURLs: item.extBacklinks,
        trustFlow: item.trustFlow,
        citationFlow: item.citationFlow,
        tfcfRatio:
          item.citationFlow > 0
            ? `${Math.round((item.trustFlow / item.citationFlow) * 100)}%`
            : "0%",
        refDomains: item.refDomains,
        refIPs: 0, // Not available in DomainIndexInfo
        refSubNets: 0, // Not available in DomainIndexInfo
        title: item.domain,
        redirectTo: `https://${item.domain}`,
        topicalTrustFlow: [
          {
            topic: item.topicalTrustFlowTopic0 || "Computers/Internet",
            value: item.topicalTrustFlowValue0 || 0,
            percent: "100%",
          },
        ],
      }));
    },
    enabled: !!domain,
    staleTime: 1000 * 60 * 15, // 15 minutes - since this is real data
  });
};
