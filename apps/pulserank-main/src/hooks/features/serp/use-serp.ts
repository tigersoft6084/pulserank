import { useQuery } from "@tanstack/react-query";
import { AxiosInstance } from "@/lib/axios-instance";
import { KeywordMetrics, SERPResult } from "@/types/serp";
import { useLanguageStore } from "@/store/language-store";

export const useGetSERPResults = (keyword: string, date?: string) => {
  const { currentBase } = useLanguageStore();
  return useQuery<SERPResult[]>({
    queryKey: ["serp-results", keyword, currentBase, date],
    queryFn: async () => {
      const { data } = await AxiosInstance.post("/api/seo/serp/results", {
        keyword,
        base: currentBase,
        ...(date && { date }),
      });
      return data;
    },
    enabled: !!keyword, // Only run query when keyword is provided
  });
};

export const useGetKeywordMetrics = (keyword: string) => {
  const { currentBase } = useLanguageStore();
  return useQuery<KeywordMetrics>({
    queryKey: ["keyword-metrics", keyword, currentBase],
    queryFn: async () => {
      const { data } = await AxiosInstance.post("/api/seo/keywords/metrics", {
        keyword,
        base: currentBase,
      });
      return data;
    },
    enabled: !!keyword, // Only run query when keyword is provided
  });
};
