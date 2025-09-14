import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosInstance } from "@/lib/axios-instance";
import { CreateKeywordRequest } from "@/types/campaigns";

export const useCreateKeywords = (campaignId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (keywordsData: CreateKeywordRequest) => {
      if (!keywordsData) throw new Error("Keywords cannot be empty");
      const { data } = await AxiosInstance.post(
        `/api/campaigns/${campaignId}/keywords`,
        {
          ...keywordsData,
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

export const useDeleteKeyword = (campaignId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (keywordId: string) => {
      const { data } = await AxiosInstance.delete(
        `/api/campaigns/${campaignId}/keywords/${keywordId}`
      );
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["campaign", campaignId] });
      return data;
    },
  });
};
