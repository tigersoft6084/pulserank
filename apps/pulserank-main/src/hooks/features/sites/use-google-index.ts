import { useQuery } from "@tanstack/react-query";
import { AxiosInstance } from "@/lib/axios-instance";

export interface GoogleIndexInfo {
  googleIndexed: boolean;
  lastIndexationCheck: string;
  indexedURL: string | null;
}

export const useGoogleIndex = (url: string, base: string = "com_en") => {
  return useQuery<GoogleIndexInfo>({
    queryKey: ["google-index", url, base],
    queryFn: async () => {
      if (!url) {
        throw new Error("URL is required");
      }

      const { data } = await AxiosInstance.post("/api/seo/sites/google-index", {
        url,
        base,
      });

      return data;
    },
    enabled: !!url,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours - since this data doesn't change frequently
    retry: 2,
  });
};
