import { useQuery } from "@tanstack/react-query";
import { AxiosInstance } from "@/lib/axios-instance";
import { DomainOrganicSearchData } from "@/types/api/semrush";

export interface DomainKeywordsResponse {
  data: DomainOrganicSearchData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasMore: boolean;
  };
}

export const useDomainKeywords = (
  domain: string,
  page: number = 1,
  limit: number = 50,
  search: string = "",
  database: string = "us"
) => {
  return useQuery<DomainKeywordsResponse>({
    queryKey: ["domain-keywords", domain, page, limit, search, database],
    queryFn: async () => {
      if (!domain) {
        throw new Error("Domain is required");
      }

      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        database,
      });

      const { data } = await AxiosInstance.get(
        `/api/seo/sites/${domain}/keywords?${searchParams.toString()}`
      );
      return data;
    },
    enabled: !!domain,
  });
};
