import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DomainTopBacklinksDetailPanel } from "../panels/top-backlinks/top-backlinks-detail-panel";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { DomainTopBacklinksResponse } from "@/hooks/features/sites/use-domain-top-backlinks";

interface TopBacklinksCardProps {
  domain: string;
  topBacklinksData?: DomainTopBacklinksResponse;
  topBacklinksLoading: boolean;
  isUnlocked: boolean;
}

export function TopBacklinksCard({
  domain,
  topBacklinksData,
  topBacklinksLoading,
  isUnlocked,
}: TopBacklinksCardProps) {
  const t = useTranslations("identityCard");

  if (topBacklinksLoading) {
    return (
      <Card className="lg:w-1/2 w-full">
        <CardHeader>
          <CardTitle>{t("cards.topBacklinks")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Header with stats */}
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-8 w-[120px]" />
            </div>

            {/* Top backlinks table */}
            <div className="space-y-2">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex space-x-4 items-center">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[60px]" />
                  <Skeleton className="h-4 w-[80px]" />
                  <Skeleton className="h-4 w-[60px]" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:w-1/2 w-full">
      <CardHeader>
        <CardTitle>{t("cards.topBacklinks")}</CardTitle>
      </CardHeader>
      <CardContent>
        <DomainTopBacklinksDetailPanel
          domain={domain}
          topBacklinksData={topBacklinksData}
          topBacklinksLoading={topBacklinksLoading}
          isUnlocked={isUnlocked}
        />
      </CardContent>
    </Card>
  );
}
