import { useQuery } from "@tanstack/react-query";
import { AxiosInstance } from "@/lib/axios-instance";
import { DomainOverviewData } from "@/types/api/semrush";

export const useGetDomainTraffic = (domain: string) => {
  return useQuery<DomainOverviewData[]>({
    queryKey: ["domain-traffic", domain],
    queryFn: async () => {
      if (!domain) {
        throw new Error("Domain is required");
      }

      const { data } = await AxiosInstance.get(
        `/api/seo/sites/${domain}/traffic`,
      );
      return data;
    },
    enabled: !!domain,
  });
};
