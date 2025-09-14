import { useQuery } from "@tanstack/react-query";
import { AxiosInstance } from "@/lib/axios-instance";

export interface UrlKeyword {
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
}

export interface UrlKeywordsResponse {
  data: UrlKeyword[];
  totalCount: number;
}

export const useUrlKeywords = (
  url: string,
  from: number = 0,
  count: number = 100
) => {
  return useQuery<UrlKeywordsResponse>({
    queryKey: ["url-keywords", url, from, count],
    queryFn: async () => {
      const { data } = await AxiosInstance.get(
        `/api/seo/urls/keywords?url=${encodeURIComponent(url)}&from=${from}&count=${count}`
      );
      return data;
    },
    enabled: !!url,
  });
};
