import { useQuery } from "@tanstack/react-query";
import { AxiosInstance } from "@/lib/axios-instance";
import { DomainCompetitorsData } from "@/types/api/semrush";

export interface DomainCompetitorsResponse {
  data: DomainCompetitorsData[];
  totalCount: number;
}

export const useDomainCompetitors = (domain: string, limit: number = 5) => {
  return useQuery<DomainCompetitorsResponse>({
    queryKey: ["domain-competitors", domain, limit],
    queryFn: async () => {
      const { data } = await AxiosInstance.get(
        `/api/seo/sites/${domain}/competitors?limit=${limit}`
      );
      return data;
    },
    enabled: !!domain,
  });
};
