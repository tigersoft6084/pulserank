import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DomainTopPagesDetailPanel } from "../panels/top-pages/top-pages-detail-panel";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { DomainTopPagesResponse } from "@/hooks/features/sites/use-domain-top-pages";

interface TopPagesCardProps {
  domain: string;
  topPagesData?: DomainTopPagesResponse;
  topPagesLoading: boolean;
  isUnlocked: boolean;
}

export function TopPagesCard({
  domain,
  topPagesData,
  topPagesLoading,
  isUnlocked,
}: TopPagesCardProps) {
  const t = useTranslations("identityCard");

  if (topPagesLoading) {
    return (
      <Card className="lg:w-1/2 w-full">
        <CardHeader>
          <CardTitle>{t("cards.topPages")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Header with stats */}
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-8 w-[120px]" />
            </div>

            {/* Top pages table */}
            <div className="space-y-2">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="flex space-x-4 items-center">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[60px]" />
                  <Skeleton className="h-4 w-[80px]" />
                  <Skeleton className="h-4 w-[60px]" />
                  <Skeleton className="h-4 w-[100px]" />
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
        <CardTitle>{t("cards.topPages")}</CardTitle>
      </CardHeader>
      <CardContent>
        <DomainTopPagesDetailPanel
          domain={domain}
          topPagesData={topPagesData}
          topPagesLoading={topPagesLoading}
          isUnlocked={isUnlocked}
        />
      </CardContent>
    </Card>
  );
}
