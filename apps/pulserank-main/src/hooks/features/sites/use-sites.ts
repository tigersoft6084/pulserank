import { useQuery } from "@tanstack/react-query";
import { AxiosInstance } from "@/lib/axios-instance";
import { SiteCompareResponse, DomainExtractorResponse } from "@/types/sites";
import { AnchorTextItem } from "@/types/api/majestic";
import { ReferringDomain } from "@/types/urls";

export const useCompareSites = (urls: string[]) => {
  return useQuery<SiteCompareResponse>({
    queryKey: ["sites-compare", urls],
    queryFn: async () => {
      if (!urls || urls.length === 0) {
        throw new Error("URLs are required");
      }

      if (urls.length > 10) {
        throw new Error("Maximum 10 sites allowed");
      }

      const { data } = await AxiosInstance.post("/api/seo/sites/compare", {
        urls,
      });
      return data;
    },
    enabled: urls.length > 0 && urls.length <= 10,
  });
};

interface DomainExtractorParams {
  keywords: string[];
  position: string;
  rankRange: string;
  base: string;
  filters?: Array<{ field: string; operator: string; value: string }>;
}

export const useDomainExtractor = (params: DomainExtractorParams) => {
  return useQuery<DomainExtractorResponse>({
    queryKey: ["domain-extractor", params],
    queryFn: async () => {
      if (!params.keywords || params.keywords.length === 0) {
        throw new Error("Keywords are required");
      }

      if (params.keywords.length > 100) {
        throw new Error("Maximum 100 keywords allowed");
      }

      const { data } = await AxiosInstance.post(
        "/api/seo/domainextractor",
        params,
      );
      return data;
    },
    enabled: params.keywords.length > 0 && params.keywords.length <= 100,
  });
};

export const useGetDomainAnchors = (domain: string) => {
  return useQuery<{
    data: AnchorTextItem[];
    totalBacklinks: number;
    totalRefDomains: number;
  } | null>({
    queryKey: ["domain-anchors", domain],
    queryFn: async () => {
      if (!domain) return null;

      const response = await fetch("/api/seo/sites/anchors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: domain }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch domain anchors");
      }

      return response.json();
    },
    enabled: !!domain,
  });
};

export const useGetDomainReferringDomains = (
  domain: string,
  filters: Array<{ field: string; operator: string; value: string }> = [],
  from: number = 0,
  count: number = 100,
) => {
  return useQuery<{ data: ReferringDomain[]; totalCount: number } | null>({
    queryKey: ["domain-referring-domains", domain, filters, from, count],
    queryFn: async () => {
      if (!domain) return null;

      const response = await fetch("/api/seo/sites/refdomains", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ domain, filters, from, count }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch domain referring domains");
      }

      return response.json();
    },
    enabled: !!domain,
  });
};
