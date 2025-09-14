import { AxiosInstance } from "@/lib/axios-instance";
import { useQuery } from "@tanstack/react-query";
import {
  BacklinkInCommon,
  BacklinkInCommonDetail,
  TopBacklink,
  LatestBacklink,
  WebsiteInterlink,
  SameIPCheckerResponse,
} from "@/types/backlinks";

export const useGetBacklinksInCommon = (items: string[]) => {
  const sortedItems = [...items];

  return useQuery<BacklinkInCommon[]>({
    queryKey: ["backlinks-in-common", sortedItems],
    queryFn: async () => {
      const { data } = await AxiosInstance.post(
        "/api/seo/sites/backlinksincommon",
        {
          items: sortedItems,
        },
      );
      return data;
    },
    enabled: items.length > 0, // Only run query when items are provided
  });
};

export const useGetBacklinksInCommonDetail = (
  item: string | null,
  refdomain: string | null,
  count: number = 10,
) => {
  return useQuery<BacklinkInCommonDetail[]>({
    queryKey: ["backlinks-detail", item, refdomain, count],
    queryFn: async () => {
      const { data } = await AxiosInstance.post(
        "/api/seo/sites/backlinksincommon/detail",
        {
          count,
          item,
          refdomain,
        },
      );
      return data.data;
    },
    enabled: !!item && !!refdomain, // Only run query when both item and refdomain are provided
  });
};

export const useGetTopBacklinks = (items: string[]) => {
  const sortedItems = [...items];

  return useQuery<TopBacklink[]>({
    queryKey: ["top-backlinks", sortedItems],
    queryFn: async () => {
      const { data } = await AxiosInstance.post(
        "/api/seo/sites/listtopbacklinks",
        {
          items: sortedItems,
        },
      );
      return data.data;
    },
    enabled: items.length > 0, // Only run query when items are provided
  });
};

export const useGetLatestBacklinks = (urls: string[]) => {
  return useQuery<LatestBacklink[]>({
    queryKey: ["latest-backlinks", urls],
    queryFn: async () => {
      const { data } = await AxiosInstance.post(
        "/api/seo/serp/latest-backlinks",
        {
          urls,
        },
      );
      return data;
    },
    enabled: urls.length > 0, // Only run query when URLs are provided
  });
};

export const useGetWebsiteInterlink = (
  domains: string[],
  datasource: string = "fresh",
) => {
  const sortedDomains = [...domains].sort();

  return useQuery<WebsiteInterlink[]>({
    queryKey: ["website-interlink", sortedDomains, datasource],
    queryFn: async () => {
      const { data } = await AxiosInstance.post(
        "/api/seo/sites/websiteinterlink",
        {
          domains: sortedDomains,
          datasource,
        },
      );
      return data;
    },
    enabled: domains.length > 0, // Only run query when domains are provided
  });
};

export const useGetSameIPChecker = (
  domain: string | null,
  dataSource: string = "fresh",
) => {
  return useQuery<SameIPCheckerResponse>({
    queryKey: ["same-ip-checker", domain, dataSource],
    queryFn: async () => {
      const { data } = await AxiosInstance.post(
        "/api/seo/sites/sameipchecker",
        {
          domain,
          dataSource,
        },
      );
      return data;
    },
    enabled: !!domain, // Only run query when domain is provided
  });
};
