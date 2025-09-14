import { useQuery } from "@tanstack/react-query";
import { AxiosInstance } from "@/lib/axios-instance";
import { useLanguageStore } from "@/store/language-store";

export interface DomainTopPage {
  URL: string;
  TrustFlow: number;
  CitationFlow: number;
  RefDomains: number;
  RefIPs: number;
  TopicalTrustFlow_Topic_0: string;
  Keywords: number;
  LastCrawlResult: string;
  LastCrawlDate: string;
}

export interface DomainTopPagesResponse {
  data: DomainTopPage[];
  totalCount: number;
}

export const useDomainTopPages = (
  domain: string,
  from: number = 0,
  count: number = 100,
) => {
  const { currentBase } = useLanguageStore();

  return useQuery<DomainTopPagesResponse>({
    queryKey: ["domain-top-pages", domain, from, count, currentBase],
    queryFn: async () => {
      const { data } = await AxiosInstance.get(
        `/api/seo/sites/${domain}/top_pages?from=${from}&count=${count}&base=${currentBase}`,
      );
      return data;
    },
    enabled: !!domain,
  });
};
