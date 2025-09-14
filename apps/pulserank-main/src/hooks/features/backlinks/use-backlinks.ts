import { useQuery } from "@tanstack/react-query";
import { AxiosInstance } from "@/lib/axios-instance";
import { BacklinkFlags } from "@/types/backlinks";

export interface Backlink {
  url: string;
  cms: string;
  anchor: string;
  Flags: BacklinkFlags;
  targetUrl: string;
  ip: string;
  tf: number;
  cf: number;
  percentage: number;
  foundDate: string;
  seen: string;
  lastCrawl: string;
  domain: string;
  historyDate: Date;
  type: "new" | "lost";
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface BacklinksResponse {
  data: Backlink[];
  pagination: PaginationInfo;
}

export const useGetBacklinks = (
  page: number = 1,
  limit: number = 50,
  flagFilters: number[] = [],
) => {
  return useQuery<BacklinksResponse>({
    queryKey: ["backlinks", page, limit, flagFilters],
    queryFn: async () => {
      const { data } = await AxiosInstance.post(`/api/backlinks`, {
        page,
        limit,
        flagFilters,
      });
      return data;
    },
  });
};
