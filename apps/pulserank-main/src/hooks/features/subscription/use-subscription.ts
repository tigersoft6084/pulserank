import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosInstance } from "@/lib/axios-instance";

export const useSubscriptions = () => {
  return useQuery({
    queryKey: ["current-subscription"],
    queryFn: async () => {
      const { data } = await AxiosInstance.get(
        "/api/paypal/current-subscription",
      );
      return data.userOrder;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useUpdateSubscription = (
  planId: string,
  paypalSubscriptionId: string,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await AxiosInstance.patch(
        "/api/paypal/update-subscription",
        { planId, paypalSubscriptionId },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-subscription"] });
    },
  });
};

export const useUpdatePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (planId: string) => {
      const { data } = await AxiosInstance.put(
        "/api/paypal/update-subscription",
        {
          planId,
        },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-subscription"] });
    },
  });
};

export const useCancelSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reason: string) => {
      const { data } = await AxiosInstance.put(
        "/api/paypal/cancel-subscription",
        {
          reason,
        },
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["current-subscription"] });
    },
  });
};
