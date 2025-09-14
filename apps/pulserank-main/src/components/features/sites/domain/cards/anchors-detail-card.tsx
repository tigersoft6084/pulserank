import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DomainAnchorsDetailPanel } from "../panels/anchors-detail/anchors-detail-panel";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { AnchorTextItem } from "@/types/api/majestic";

interface AnchorsDetailCardProps {
  domain: string;
  anchorsData?: {
    data: AnchorTextItem[];
    totalBacklinks: number;
    totalRefDomains: number;
  } | null;
  anchorsLoading: boolean;
  isUnlocked: boolean;
}

export function AnchorsDetailCard({
  domain,
  anchorsData,
  anchorsLoading,
  isUnlocked,
}: AnchorsDetailCardProps) {
  const t = useTranslations("identityCard");

  if (anchorsLoading) {
    return (
      <Card className="lg:w-1/2 w-full">
        <CardHeader>
          <CardTitle>{t("cards.anchorsDetail")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Header with stats */}
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-8 w-[120px]" />
            </div>

            {/* Anchors table */}
            <div className="space-y-2">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="flex space-x-4 items-center">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[80px]" />
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
        <CardTitle>{t("cards.anchorsDetail")}</CardTitle>
      </CardHeader>
      <CardContent>
        <DomainAnchorsDetailPanel
          domain={domain}
          anchorsData={anchorsData}
          anchorsLoading={anchorsLoading}
          isUnlocked={isUnlocked}
        />
      </CardContent>
    </Card>
  );
}
