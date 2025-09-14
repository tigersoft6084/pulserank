import { useQuery } from "@tanstack/react-query";
import { AxiosInstance } from "@/lib/axios-instance";

export interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
  planId: string;
  active: boolean;
  constraints: {
    keywords: number;
    tracking: number;
    backlinks: number;
  };
  createdAt: string;
  features: string[];
}
export const usePlans = () => {
  return useQuery<Plan[]>({
    queryKey: ["plans"],
    queryFn: async () => {
      const { data } = await AxiosInstance.get("/api/plans");
      //append features to data based on constraints for all plans
      data.forEach((plan: Plan) => {
        let features: string[] = [
          "Rankings of several million keywords+ archives",
        ];
        // add features based on constraints
        features = features.concat(
          Object.keys(plan.constraints).map((key) =>
            key === "keywords"
              ? `${plan.constraints[key as keyof typeof plan.constraints] || 150} personal keywords`
              : key === "unlockedDomains"
                ? `Detail of backlinks of ${plan.constraints[key as keyof typeof plan.constraints] || 100} sites`
                : key === "trackingSites"
                  ? `monitoring of ${plan.constraints[key as keyof typeof plan.constraints] || 20} sites`
                  : "",
          ),
        );
        plan.features = features;
      });
      return data;
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};
