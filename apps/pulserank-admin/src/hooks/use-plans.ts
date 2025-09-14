import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
  active: boolean;
  constraints: Record<string, unknown>;
  currency: string;
  paypalPlanId: string;
  createdAt: string;
  subscribers: number;
  revenue: number;
  status: string;
}

export interface CreatePlanData {
  name: string;
  price: number;
  interval: string;
  constraints?: Record<string, unknown>;
  currency?: string;
  paypalPlanId: string;
  isPriceCurrencyUpdate?: boolean;
  oldPlanId?: string;
}

export interface UpdatePlanData {
  name?: string;
  price?: number;
  interval?: string;
  constraints?: Record<string, unknown>;
  currency?: string;
  paypalPlanId?: string;
  active?: boolean;
}

// Fetch all plans
export const usePlans = () => {
  return useQuery<Plan[]>({
    queryKey: ["plans"],
    queryFn: async () => {
      const response = await fetch("/api/plans");
      if (!response.ok) {
        throw new Error("Failed to fetch plans");
      }
      return response.json();
    },
  });
};

// Fetch single plan
// export const usePlan = (id: string) => {
//   return useQuery<Plan>({
//     queryKey: ["plans", id],
//     queryFn: async () => {
//       const response = await fetch(`/api/plans/${id}`);
//       if (!response.ok) {
//         throw new Error("Failed to fetch plan");
//       }
//       return response.json();
//     },
//     enabled: !!id,
//   });
// };

// Create plan
export const useCreatePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePlanData) => {
      const response = await fetch("/api/plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create plan");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
  });
};

// Update plan
export const useUpdatePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePlanData }) => {
      const response = await fetch(`/api/plans/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update plan");
      }

      return response.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
      queryClient.invalidateQueries({ queryKey: ["plans", id] });
    },
  });
};

// Delete plan
export const useDeletePlan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/plans/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete plan");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
  });
};
