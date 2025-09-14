import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface AdminAccount {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

interface UpdateAccountData {
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

// Fetch admin account data
const fetchAdminAccount = async (): Promise<AdminAccount> => {
  const response = await fetch("/api/admin/account");
  if (!response.ok) {
    throw new Error("Failed to fetch admin account");
  }
  return response.json();
};

// Update admin account
const updateAdminAccount = async (
  data: UpdateAccountData
): Promise<{ message: string; admin: AdminAccount }> => {
  const response = await fetch("/api/admin/account", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update admin account");
  }

  return response.json();
};

export const useAdminAccount = () => {
  return useQuery({
    queryKey: ["admin-account"],
    queryFn: fetchAdminAccount,
  });
};

export const useUpdateAdminAccount = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateAdminAccount,
    onSuccess: () => {
      // Invalidate and refetch admin account data
      queryClient.invalidateQueries({ queryKey: ["admin-account"] });
    },
  });
};
