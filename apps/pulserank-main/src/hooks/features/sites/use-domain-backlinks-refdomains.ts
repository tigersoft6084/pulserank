import { useQuery } from "@tanstack/react-query";
import { AxiosInstance } from "@/lib/axios-instance";
import { BacklinkFlags } from "@/types/backlinks";

export interface DomainBacklinkRefDomain {
  URL: string;
  Anchor: string;
  Flags: BacklinkFlags;
  TF: number;
  CF: number;
  LastSeen: string;
  Theme: [string, number];
}

export interface DomainBacklinksRefDomainsResponse {
  data: DomainBacklinkRefDomain[];
}

export const useGetDomainBacklinksRefDomains = (
  domain: string,
  refDomain: string,
  count: number = 10,
) => {
  return useQuery<DomainBacklinksRefDomainsResponse>({
    queryKey: ["domain-backlinks-refdomains", domain, refDomain, count],
    queryFn: async () => {
      const { data } = await AxiosInstance.post(
        `/api/seo/sites/${domain}/backlinks/refdomains`,
        {
          refDomain,
          count,
        },
      );
      return data;
    },
    enabled: !!domain && !!refDomain,
  });
};
