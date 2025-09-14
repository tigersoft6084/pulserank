import { useQuery } from "@tanstack/react-query";
import { AxiosInstance } from "@/lib/axios-instance";

export interface NicheFinderFilters {
  field: string;
  operator: string;
  value: string;
}

export interface NicheFinderParams {
  page?: number;
  limit?: number;
  search?: string;
  filters?: NicheFinderFilters[];
  base?: string;
}

export interface NicheFinderKeyword {
  id: string;
  keyword: string;
  search_volume: number;
  cpc: number;
  competition: number;
  interest: number;
  base: string;
  createdAt: string;
  updatedAt: string;
}

export interface NicheFinderResponse {
  data: NicheFinderKeyword[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const useNicheFinder = (params: NicheFinderParams) => {
  const {
    page = 1,
    limit = 50,
    search = "",
    filters = [],
    base = "com_en",
  } = params;

  return useQuery({
    queryKey: ["niche-finder", page, limit, search, filters, base],
    queryFn: async (): Promise<NicheFinderResponse> => {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        search,
        filters: JSON.stringify(filters),
        base,
      });

      const { data } = await AxiosInstance.get(
        `/api/seo/keywords/nichefinder?${searchParams.toString()}`
      );
      return data;
    },
    enabled: true, // Always enabled since we want to show data on page load
  });
};
