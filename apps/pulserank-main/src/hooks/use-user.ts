import { AxiosInstance } from "@/lib/axios-instance";
import { User } from "@/types/client";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useUserSearch = (query: string) => {
  return useQuery<User[]>({
    queryKey: ["searchUsers", query],
    queryFn: async () => {
      const { data } = await AxiosInstance.get("/api/user", {
        params: { search: query },
      });
      return data;
    },
    refetchInterval: 5000,
  });
};

export const useDeleteUser = () => {
  return useMutation({
    mutationFn: async () => {
      const { data } = await AxiosInstance.delete("/api/user");
      return data;
    },
  });
};
