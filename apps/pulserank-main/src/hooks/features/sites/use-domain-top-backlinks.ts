import { useQuery } from "@tanstack/react-query";
import { AxiosInstance } from "@/lib/axios-instance";
import { useLanguageStore } from "@/store/language-store";
import { DomainTopBacklink } from "@/types/backlinks";

export interface DomainTopBacklinksResponse {
  data: DomainTopBacklink[];
  totalCount: number;
}

export const useDomainTopBacklinks = (
  domain: string,
  from: number,
  count: number, // Fetch all data upfront (max 1000)
) => {
  const { currentBase } = useLanguageStore();

  return useQuery<DomainTopBacklinksResponse>({
    queryKey: ["domain-top-backlinks", domain, currentBase, from, count], // Remove pagination from cache key
    queryFn: async () => {
      const { data } = await AxiosInstance.get(
        `/api/seo/sites/${domain}/top?from=${from}&count=${count}&base=${currentBase}`,
      );
      return data;
    },
    enabled: !!domain,
  });
};
