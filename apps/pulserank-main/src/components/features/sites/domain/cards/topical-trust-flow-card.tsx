import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DomainTopicalTrustFlowPanel } from "../panels/topical-trust-flow/topical-trust-flow-panel";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { TopicalTrustFlowResponse } from "@/hooks/features/sites/use-domain-topical-trust-flow";

interface TopicalTrustFlowCardProps {
  topicalTrustFlowData?: TopicalTrustFlowResponse;
  topicalTrustFlowLoading: boolean;
}

export function TopicalTrustFlowCard({
  topicalTrustFlowData,
  topicalTrustFlowLoading,
}: TopicalTrustFlowCardProps) {
  const t = useTranslations("identityCard");

  if (topicalTrustFlowLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t("cards.topicalTrustFlow")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Chart area */}
            <div className="h-[300px] border border-gray-200 rounded-md p-3">
              <div className="space-y-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-[250px] w-full" />
              </div>
            </div>

            {/* Legend/Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-12" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t("cards.topicalTrustFlow")}</CardTitle>
      </CardHeader>
      <CardContent>
        <DomainTopicalTrustFlowPanel
          data={topicalTrustFlowData}
          isLoading={topicalTrustFlowLoading}
        />
      </CardContent>
    </Card>
  );
}
