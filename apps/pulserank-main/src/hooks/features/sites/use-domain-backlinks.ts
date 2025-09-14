import { useQuery } from "@tanstack/react-query";
import { AxiosInstance } from "@/lib/axios-instance";

export interface DomainBacklink {
  url: string;
  cms: string;
  anchor: string;
  Flags: {
    doFollow: boolean;
    redirect: boolean;
    frame: boolean;
    noFollow: boolean;
    images: boolean;
    deleted: boolean;
    altText: boolean;
    mention: boolean;
  };
  targetUrl: string;
  ip: string;
  tf: number;
  cf: number;
  percentage: number;
  foundDate: string;
  seen: string;
  backlinkLeft?: number;
  lastCrawl: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface DomainBacklinksResponse {
  data: DomainBacklink[];
  pagination: PaginationInfo;
}

export const useGetDomainBacklinks = (
  domain: string,
  type: "new" | "lost" = "new",
  page: number = 1,
  limit: number = 50,
  flagFilters: number[] = [],
) => {
  return useQuery<DomainBacklinksResponse>({
    queryKey: ["domain-backlinks", domain, type, page, limit, flagFilters],
    queryFn: async () => {
      const { data } = await AxiosInstance.post(
        `/api/seo/sites/${domain}/backlinks`,
        {
          type,
          page,
          limit,
          flagFilters,
        },
      );
      return data;
    },
    enabled: !!domain,
  });
};
