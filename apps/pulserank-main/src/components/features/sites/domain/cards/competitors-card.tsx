import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DomainCompetitorsDetailPanel } from "../panels/competitors/competitors-detail-panel";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { DomainCompetitorsResponse } from "@/hooks/features/sites/use-domain-competitors";

interface CompetitorsCardProps {
  competitorsData?: DomainCompetitorsResponse;
  competitorsLoading: boolean;
}

export function CompetitorsCard({
  competitorsData,
  competitorsLoading,
}: CompetitorsCardProps) {
  const t = useTranslations("identityCard");

  if (competitorsLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t("cards.competitors")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex space-x-4 items-center">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-4 w-[80px]" />
                <Skeleton className="h-4 w-[80px]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t("cards.competitors")}</CardTitle>
      </CardHeader>
      <CardContent>
        <DomainCompetitorsDetailPanel
          competitorsData={competitorsData}
          competitorsLoading={competitorsLoading}
        />
      </CardContent>
    </Card>
  );
}
