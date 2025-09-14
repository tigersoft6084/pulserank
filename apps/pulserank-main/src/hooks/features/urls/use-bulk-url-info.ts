import { useQuery } from "@tanstack/react-query";
import { AxiosInstance } from "@/lib/axios-instance";
import { IndexItemInfo } from "@/types/api/majestic";

export const useBulkUrlInfo = (urls: string[]) => {
  return useQuery<IndexItemInfo[]>({
    queryKey: ["bulk-url-info", urls],
    queryFn: async () => {
      if (!urls || urls.length === 0) {
        return [];
      }

      const { data } = await AxiosInstance.post("/api/seo/urls/bulk-info", {
        urls,
      });
      return data.data;
    },
    enabled: urls.length > 0,
  });
};
