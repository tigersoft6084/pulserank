import { useQuery } from "@tanstack/react-query";
import { AxiosInstance } from "@/lib/axios-instance";
import { OnsiteData } from "@/types/sites";
import { useLanguageStore } from "@/store/language-store";

export const useGetDomainOnsite = (domain: string) => {
  const { currentBase } = useLanguageStore();

  return useQuery<OnsiteData>({
    queryKey: ["domain-onsite", domain, currentBase],
    queryFn: async () => {
      if (!domain) {
        throw new Error("Domain is required");
      }

      const { data } = await AxiosInstance.get(
        `/api/seo/sites/${domain}/onsite?base=${currentBase}`,
      );
      return data;
    },
    enabled: !!domain,
  });
};
