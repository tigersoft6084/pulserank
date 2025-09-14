import { useQuery } from "@tanstack/react-query";
import { AxiosInstance } from "@/lib/axios-instance";
import { SubdomainOrganicData } from "@/types/api/semrush";

export interface SubdomainOrganicResponse {
  data: SubdomainOrganicData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasMore: boolean;
  };
}

export const useSubdomainOrganic = (
  domain: string,
  page: number = 1,
  limit: number = 50,
  database: string = "us",
) => {
  return useQuery<SubdomainOrganicResponse>({
    queryKey: ["subdomain-organic", domain, page, limit, database],
    queryFn: async () => {
      if (!domain) {
        throw new Error("Domain is required");
      }

      const { data } = await AxiosInstance.get(
        `/api/seo/sites/${domain}/subdomain-organic?page=${page}&limit=${limit}&database=${database}`,
      );
      return data;
    },
    enabled: !!domain,
  });
};
