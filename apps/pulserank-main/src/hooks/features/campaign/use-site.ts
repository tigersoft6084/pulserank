import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosInstance } from "@/lib/axios-instance";
import { CreateSiteRequest } from "@/types/campaigns";

export const useCreateSites = (campaignId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sitesData: CreateSiteRequest) => {
      if (!sitesData) throw new Error("Sites cannot be empty");
      const { data } = await AxiosInstance.post(
        `/api/campaigns/${campaignId}/sites`,
        {
          ...sitesData,
        }
      );
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["campaign", campaignId] });
      return data;
    },
  });
};

export const useDeleteSite = (campaignId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (siteId: string) => {
      const { data } = await AxiosInstance.delete(
        `/api/campaigns/${campaignId}/sites/${siteId}`
      );
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["campaign", campaignId] });
      return data;
    },
  });
};
