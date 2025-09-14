import { useQuery } from "@tanstack/react-query";
import { ReferringDomain } from "@/types/urls";

export const useGetURLInfo = (url: string) => {
  return useQuery({
    queryKey: ["url-info", url],
    queryFn: async () => {
      if (!url) return null;

      const response = await fetch("/api/seo/urls/info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch URL info");
      }

      return response.json();
    },
    enabled: !!url,
  });
};

export const useGetReferringDomains = (
  url: string,
  filters: Array<{ field: string; operator: string; value: string }> = [],
  from: number = 0,
  count: number = 100
) => {
  return useQuery<{ data: ReferringDomain[]; totalCount: number } | null>({
    queryKey: ["referring-domains", url, filters, from, count],
    queryFn: async () => {
      if (!url) return null;

      const response = await fetch("/api/seo/urls/referring-domains", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, filters, from, count }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch referring domains");
      }

      return response.json();
    },
    enabled: !!url,
  });
};

export const useGetAnchors = (url: string) => {
  return useQuery({
    queryKey: ["anchors", url],
    queryFn: async () => {
      if (!url) return null;

      const response = await fetch("/api/seo/urls/anchors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch anchors");
      }

      return response.json();
    },
    enabled: !!url,
  });
};

export const useGetBacklinks = (
  url: string,
  maxUrlsPerDomain: string = "all"
) => {
  return useQuery({
    queryKey: ["backlinks", url, maxUrlsPerDomain],
    queryFn: async () => {
      if (!url) return null;

      const response = await fetch("/api/seo/urls/backlinks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, maxUrlsPerDomain }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch backlinks");
      }

      return response.json();
    },
    enabled: !!url,
  });
};

export const useGetTopBacklinks = (
  url: string,
  maxUrlsPerDomain: string = "all"
) => {
  return useQuery({
    queryKey: ["top-backlinks", url, maxUrlsPerDomain],
    queryFn: async () => {
      if (!url) return null;

      const response = await fetch("/api/seo/urls/backlinks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, maxUrlsPerDomain }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch top backlinks");
      }

      return response.json();
    },
    enabled: !!url,
  });
};
