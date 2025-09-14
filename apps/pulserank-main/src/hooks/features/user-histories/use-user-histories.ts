import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosInstance } from "@/lib/axios-instance";
import { UserHistory, CreateUserHistoryRequest } from "@/types/user-histories";

export const useGetUserHistories = () => {
  return useQuery<UserHistory[]>({
    queryKey: ["user-histories"],
    queryFn: async () => {
      const { data } = await AxiosInstance.get("/api/user-histories");
      return data.userHistories;
    },
  });
};

export const useCreateUserHistory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateUserHistoryRequest) => {
      const { data } = await AxiosInstance.post("/api/user-histories", request);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-histories"] });
    },
  });
};

export const useDeleteUserHistory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await AxiosInstance.delete(`/api/user-histories/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-histories"] });
    },
  });
};

export const usePinUserHistory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, pinned }: { id: string; pinned: boolean }) => {
      const { data } = await AxiosInstance.patch(`/api/user-histories/${id}`, {
        pinned,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-histories"] });
    },
  });
};

// Helper function to create user history entries
export const createUserHistoryEntry = async (
  description: string,
  item: string,
  cost: number = 0,
) => {
  const { data } = await AxiosInstance.post("/api/user-histories", {
    description,
    item,
    cost,
  });
  return data;
};
