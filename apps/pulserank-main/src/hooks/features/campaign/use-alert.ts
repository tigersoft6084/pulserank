import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosInstance } from "@/lib/axios-instance";
import { CreateAlertRequest } from "@/types/campaigns";

export const useCreateAlert = (campaignId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertData: CreateAlertRequest) => {
      if (!alertData.email) throw new Error("Email cannot be empty");
      const { data: responseData } = await AxiosInstance.post(
        `/api/campaigns/${campaignId}/alerts`,
        {
          email: alertData.email,
          frequency: alertData.frequency,
        }
      );
      return responseData;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["campaign", campaignId] });
      return data;
    },
  });
};

export const useDeleteAlert = (campaignId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertId: string) => {
      const { data } = await AxiosInstance.delete(
        `/api/campaigns/${campaignId}/alerts`,
        {
          data: {
            alertId: alertId,
          },
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
