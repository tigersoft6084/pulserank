import { useQuery } from "@tanstack/react-query";
import { AxiosInstance } from "@/lib/axios-instance";

export interface TopicalTrustFlowData {
  topic: string;
  percentage: number;
  trustFlow: number;
  normalizedPercentage: number;
}

export interface TopicalTrustFlowResponse {
  data: TopicalTrustFlowData[];
  totalPercentage: number;
}

export const useGetDomainTopicalTrustFlow = (domain: string) => {
  return useQuery<TopicalTrustFlowResponse>({
    queryKey: ["domain-topical-trust-flow", domain],
    queryFn: async () => {
      if (!domain) {
        throw new Error("Domain is required");
      }

      const { data } = await AxiosInstance.get(
        `/api/seo/sites/${domain}/topical-trust-flow`
      );
      return data;
    },
    enabled: !!domain,
  });
};
