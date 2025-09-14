import { useQuery } from "@tanstack/react-query";
import { AxiosInstance } from "@/lib/axios-instance";
import { TopicItem } from "@/types/api/majestic";

export interface TopicsResponse {
  data: TopicItem[];
}

export const useTopics = (url: string) => {
  return useQuery<TopicsResponse>({
    queryKey: ["topics", url],
    queryFn: async () => {
      if (!url) {
        throw new Error("URL is required");
      }

      const { data } = await AxiosInstance.post("/api/seo/sites/topics", {
        url,
      });
      return data;
    },
    enabled: !!url,
  });
};
