import { useQuery } from "@tanstack/react-query";
import { AxiosInstance } from "@/lib/axios-instance";
import { RankingData } from "@/types/campaigns";

export const useGetSiteRankings = (
  campaignId: string,
  dateFrom?: string,
  dateTo?: string,
) => {
  return useQuery<RankingData[]>({
    queryKey: ["site-rankings", campaignId, dateFrom, dateTo],
    queryFn: async () => {
      if (!dateFrom || !dateTo) return [];
      const params = new URLSearchParams();
      params.set("dateFrom", dateFrom);
      params.set("dateTo", dateTo);
      const res = await AxiosInstance.get(
        `/api/campaigns/${campaignId}/rankings?${params}`,
      );
      return res.data;
    },
    enabled: !!dateFrom && !!dateTo,
  });
};

export const useGetAllCampaignsRankings = (
  dateFrom?: string,
  dateTo?: string,
) => {
  return useQuery<RankingData[]>({
    queryKey: ["all-campaigns-rankings", dateFrom, dateTo],
    queryFn: async () => {
      if (!dateFrom || !dateTo) return [];

      try {
        const params = new URLSearchParams();
        params.set("dateFrom", dateFrom);
        params.set("dateTo", dateTo);
        const res = await AxiosInstance.get(
          `/api/campaigns/rankings?${params}`,
        );
        return res.data || [];
      } catch (error) {
        console.warn("Failed to fetch all campaigns rankings:", error);
        return [];
      }
    },
    enabled: !!dateFrom && !!dateTo,
  });
};
