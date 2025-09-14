import { useQuery } from "@tanstack/react-query";
import { AxiosInstance } from "@/lib/axios-instance";
import { DomainInfo } from "@/types/sites";

export const useGetDomainInfo = (domain: string) => {
  return useQuery<DomainInfo>({
    queryKey: ["domain-info", domain],
    queryFn: async () => {
      if (!domain) {
        throw new Error("Domain is required");
      }

      const { data } = await AxiosInstance.get(`/api/seo/sites/${domain}/info`);
      return data;
    },
    enabled: !!domain,
  });
};
