import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosInstance } from "@/lib/axios-instance";
import { Campaign, CampaignDetail } from "@/types/campaigns";

export const useGetCampaign = (campaignId: string) => {
  return useQuery<CampaignDetail>({
    queryKey: ["campaign", campaignId],
    queryFn: async () => {
      const { data } = await AxiosInstance.get(`/api/campaigns/${campaignId}`);
      return data;
    },
  });
};

export const useGetCampaigns = (search?: string) => {
  return useQuery<Campaign[]>({
    queryKey: ["campaigns", search || ""],
    queryFn: async () => {
      const { data } = await AxiosInstance.get("/api/campaigns", {
        params: {
          ...(search && { search }),
        },
      });
      return data.campaigns;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name }: { name: string }) => {
      if (!name) throw new Error("Name cannot be empty");
      const { data } = await AxiosInstance.post("/api/campaigns", {
        name,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
};

export const useEditCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      campaignId,
      name,
    }: {
      campaignId: string;
      name: string;
    }) => {
      if (!name) throw new Error("Name cannot be empty");
      const { data } = await AxiosInstance.put(`/api/campaigns/${campaignId}`, {
        name,
      });
      return data;
    },
    onSuccess: (_, variable) => {
      queryClient.setQueryData<Campaign[]>(["campaigns"], (prev) => {
        return prev?.map((campaign) => {
          if (campaign.id === variable.campaignId) {
            return {
              ...campaign,
              name: variable.name,
            };
          }
          return campaign;
        });
      });
    },
  });
};

export const useDeleteCampaign = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      const { data } = await AxiosInstance.delete(
        `/api/campaigns/${campaignId}`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
};
