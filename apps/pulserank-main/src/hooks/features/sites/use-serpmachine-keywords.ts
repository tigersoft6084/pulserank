import { useQuery } from "@tanstack/react-query";
import { AxiosInstance } from "@/lib/axios-instance";

export interface SerpMachineKeyword {
  id: string;
  keyword: string;
  base: string;
  position: number | null;
  positionDate: Date | null;
  traffic: number;
  searchVolume: number;
  cpc: number;
  competition: number;
  interest: number;
  properties: string[];
  rankingUrl: string | null;
}

export interface SerpMachineKeywordsResponse {
  data: SerpMachineKeyword[];
  totalCount: number;
}

export const useSerpMachineKeywords = (
  domain: string,
  from: number = 0,
  count: number = 100
) => {
  return useQuery<SerpMachineKeywordsResponse>({
    queryKey: ["serpmachine-keywords", domain, from, count],
    queryFn: async () => {
      if (!domain) {
        throw new Error("Domain is required");
      }

      // For SERPmachine keywords, we'll use the domain as the URL parameter
      // This will fetch all keywords that rank for any URL on this domain
      const { data } = await AxiosInstance.get(
        `/api/seo/urls/keywords?url=${encodeURIComponent(domain)}&from=${from}&count=${count}`
      );
      return data;
    },
    enabled: !!domain,
  });
};
