import { useQuery } from "@tanstack/react-query";
import { AxiosInstance } from "@/lib/axios-instance";
import { useLanguageStore } from "@/store/language-store";

interface AvailableDatesResponse {
  availableDates: string[];
}

export const useGetAvailableDates = (keyword: string) => {
  const { currentBase } = useLanguageStore();
  return useQuery<AvailableDatesResponse>({
    queryKey: ["available-dates", keyword, currentBase],
    queryFn: async () => {
      const response = await AxiosInstance.post(
        "/api/seo/serp/available-dates",
        {
          keyword,
          base: currentBase,
        },
      );
      return response.data;
    },
    enabled: !!keyword && !!currentBase,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};
