import { useQuery } from "@tanstack/react-query";
import { CompetitionViewItem } from "@/hooks/features/sites/use-website-profiler";

export interface CompetitionParams {
  keyword: string;
  base: string;
}

export interface CompetitionResponse {
  data: CompetitionViewItem[];
}

export function useCompetition(
  params: {
    keyword: string;
    base: string;
  } | null
) {
  return useQuery({
    queryKey: ["competition", params],
    queryFn: async () => {
      if (!params) throw new Error("No parameters provided");

      const response = await fetch("/api/seo/positions/competition", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch competition data");
      }

      return response.json();
    },
    enabled: !!params,
  });
}

export function useGoogleTrends(
  params: {
    keyword: string;
    base: string;
  } | null
) {
  return useQuery({
    queryKey: ["googleTrends", params],
    queryFn: async () => {
      if (!params) throw new Error("No parameters provided");

      const response = await fetch("/api/seo/positions/google-trends", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch Google Trends data");
      }

      return response.json();
    },
    enabled: !!params,
  });
}
