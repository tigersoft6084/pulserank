import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DomainOnsitePanel } from "../panels/onsite-data/onsite-data-panel";
import { useTranslations } from "next-intl";
import { OnsiteData } from "@/types/sites";
import { Skeleton } from "@/components/ui/skeleton";

export function OnsiteDataCard({
  onsiteData,
  isLoading,
  error,
}: {
  onsiteData?: OnsiteData;
  isLoading: boolean;
  error: unknown;
}) {
  const t = useTranslations("identityCard");

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("cards.onsiteData")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Title Section */}
            <div className="flex gap-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-48" />
            </div>

            {/* Four Column Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Title Changes Column */}
              <div className="space-y-3 border border-gray-200 rounded-md p-3">
                <Skeleton className="h-4 w-24" />
                <div className="space-y-3.5 p-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Meta Description Changes Column */}
              <div className="space-y-3 border border-gray-200 rounded-md p-3">
                <Skeleton className="h-4 w-32" />
                <div className="space-y-3.5 p-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  ))}
                </div>
              </div>

              {/* H1 Changes Column */}
              <div className="space-y-3 border border-gray-200 rounded-md p-3">
                <Skeleton className="h-4 w-20" />
                <div className="space-y-3.5 p-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex justify-between items-center">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Technologies Used Column */}
              <div className="space-y-3 border border-gray-200 rounded-md p-3">
                <Skeleton className="h-4 w-28" />
                <div className="space-y-3.5 p-2">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-8" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-6" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-6 w-16" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("cards.onsiteData")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            {t("onsiteError")}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!onsiteData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("cards.onsiteData")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            {t("onsiteNoData")}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("cards.onsiteData")}</CardTitle>
      </CardHeader>
      <CardContent>
        <DomainOnsitePanel onsiteData={onsiteData} />
      </CardContent>
    </Card>
  );
}
