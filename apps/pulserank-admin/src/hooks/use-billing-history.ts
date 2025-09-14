import { useQuery } from "@tanstack/react-query";

export interface BillingHistoryItem {
  id: string;
  transactionId: string;
  eventType: string;
  amount: number | null;
  currency: string | null;
  createdAt: string;
  paidAt: string | null;
  customer: string;
  customerEmail: string;
  plan: string;
  subscriptionId: string;
  data: unknown;
}

export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface BillingHistoryResponse {
  data: BillingHistoryItem[];
  pagination: PaginationInfo;
}

const fetchBillingHistory = async (
  page?: number,
  pageSize?: number,
  eventType?: string,
): Promise<BillingHistoryResponse> => {
  const params = new URLSearchParams();
  if (page) params.append("page", page.toString());
  if (pageSize) params.append("pageSize", pageSize.toString());
  if (eventType) params.append("eventType", eventType);

  const response = await fetch(`/api/billing-history?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch billing history");
  }
  return response.json();
};

export const useBillingHistory = (
  page: number = 1,
  pageSize: number = 10,
  eventType?: string,
) => {
  return useQuery({
    queryKey: ["billing-history", page, pageSize, eventType],
    queryFn: () => fetchBillingHistory(page, pageSize, eventType),
  });
};
