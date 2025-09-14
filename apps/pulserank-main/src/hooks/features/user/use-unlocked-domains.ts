import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosInstance } from "@/lib/axios-instance";
import { AxiosError } from "axios";

export const useCheckDomainUnlockStatus = (domain: string) => {
  return useQuery({
    queryKey: ["domain-unlock-status", domain],
    queryFn: async () => {
      const { data } = await AxiosInstance.get(
        `/api/user/unlock-domain?domain=${encodeURIComponent(domain)}`,
      );
      return data?.isUnlocked || false;
    },
    enabled: !!domain,
  });
};

export const useUnlockDomain = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (domain: string) => {
      const { data } = await AxiosInstance.post("/api/user/unlock-domain", {
        domain,
      });
      return data;
    },
    onSuccess: (data, domain) => {
      // Invalidate and refetch the unlock status for this domain
      queryClient.invalidateQueries({
        queryKey: ["domain-unlock-status", domain],
      });

      // Also invalidate any other queries that might depend on unlocked domains
      queryClient.invalidateQueries({
        queryKey: ["user"],
      });
    },
    onError: (error: AxiosError) => {
      console.log("error", error);
    },
  });
};
