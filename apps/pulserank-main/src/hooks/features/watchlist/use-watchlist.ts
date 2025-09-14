import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosInstance } from "@/lib/axios-instance";

export interface TrackingSite {
  id: string;
  url: string;
  type: "domain" | "subdomain" | "page";
  email_alert: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WatchlistResponse {
  trackingSites: TrackingSite[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface AddToWatchlistRequest {
  url: string;
  type?: "domain" | "subdomain" | "page";
  emailAlert?: boolean;
}

export const useGetWatchlist = (
  page = 1,
  limit = 50,
  search = "",
  type = "",
) => {
  return useQuery({
    queryKey: ["watchlist", page, limit, search, type],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(type && { type }),
      });
      const { data } = await AxiosInstance.get(`/api/watchlist?${params}`);
      return data as WatchlistResponse;
    },
  });
};

export const useAddToWatchlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: AddToWatchlistRequest) => {
      const { data } = await AxiosInstance.post("/api/watchlist", request);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });
};

export const useCheckWatchlistStatus = (url: string) => {
  return useQuery({
    queryKey: ["watchlist", "check", url],
    queryFn: async () => {
      const { data } = await AxiosInstance.get(
        `/api/watchlist?search=${encodeURIComponent(url)}`,
      );
      const watchlistData = data as WatchlistResponse;
      return watchlistData.trackingSites.some((site) => site.url === url);
    },
    enabled: !!url,
  });
};

export const useUpdateEmailAlert = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      trackingSiteId,
      emailAlert,
    }: {
      trackingSiteId: string;
      emailAlert: boolean;
    }) => {
      const { data } = await AxiosInstance.put(
        `/api/watchlist/${trackingSiteId}`,
        {
          emailAlert,
        },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });
};

export const useDeleteTrackingSite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (trackingSiteId: string) => {
      const { data } = await AxiosInstance.delete(
        `/api/watchlist/${trackingSiteId}`,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });
};

export const useBulkDeleteTrackingSites = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (trackingSiteIds: string[]) => {
      const { data } = await AxiosInstance.post("/api/watchlist/bulk-delete", {
        trackingSiteIds,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["watchlist"] });
    },
  });
};
