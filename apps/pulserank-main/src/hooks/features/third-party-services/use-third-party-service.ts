import { useQuery } from "@tanstack/react-query";
import { AxiosInstance } from "@/lib/axios-instance";
import {
  ThirdPartyService,
  ThirdPartyServiceResponse,
} from "@/types/third-party-service";

export const useIntercomService = () => {
  return useQuery<ThirdPartyService>({
    queryKey: ["intercom"],
    queryFn: async () => {
      const { data } = await AxiosInstance.get<ThirdPartyServiceResponse>(
        `/api/third-party-services`,
      );
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Specific hook for Intercom service
