import { useQuery } from "@tanstack/react-query";

export interface UserOrder {
  id: string;
  customer: string;
  customerEmail: string;
  plan: string;
  planId: string;
  amount: number;
  currency: string;
  interval: string;
  status: string;
  createdAt: string;
  currentPeriodEnd: string | null;
  paypalSubscriptionId: string;
  tierName: string | null;
}

export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface UserOrdersResponse {
  data: UserOrder[];
  pagination: PaginationInfo;
}

const fetchUserOrders = async (
  page?: number,
  pageSize?: number,
  status?: string,
): Promise<UserOrdersResponse> => {
  const params = new URLSearchParams();
  if (page) params.append("page", page.toString());
  if (pageSize) params.append("pageSize", pageSize.toString());
  if (status) params.append("status", status);

  const response = await fetch(`/api/user-orders?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch user orders");
  }
  return response.json();
};

export const useUserOrders = (
  page: number = 1,
  pageSize: number = 10,
  status?: string,
) => {
  return useQuery({
    queryKey: ["user-orders", page, pageSize, status],
    queryFn: () => fetchUserOrders(page, pageSize, status),
  });
};
