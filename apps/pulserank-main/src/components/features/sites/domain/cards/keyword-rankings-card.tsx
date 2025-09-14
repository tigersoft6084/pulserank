import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DomainKeywordRankingsPanel } from "../panels/keyword-rankings/keyword-rankings-panel";
import { DomainSEObserverKeywordsPanel } from "../panels/keyword-rankings/seobserver-keywords-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";
import { Skeleton } from "@/components/ui/skeleton";
import { DomainKeywordsResponse } from "@/hooks/features/sites/use-domain-keywords";
import { UrlKeywordsResponse } from "@/hooks/features/urls/use-url-keywords";

interface KeywordRankingsCardProps {
  domain: string;
  semrushKeywordsData?: DomainKeywordsResponse;
  seobserverKeywordsData?: UrlKeywordsResponse;
  semrushKeywordsLoading: boolean;
  seobserverKeywordsLoading: boolean;
  isUnlocked: boolean;
}

export function KeywordRankingsCard({
  domain,
  semrushKeywordsData,
  seobserverKeywordsData,
  semrushKeywordsLoading,
  seobserverKeywordsLoading,
  isUnlocked,
}: KeywordRankingsCardProps) {
  const t = useTranslations("identityCard");

  const isLoading = semrushKeywordsLoading || seobserverKeywordsLoading;

  if (isLoading) {
    return (
      <Card className="lg:w-1/2 w-full">
        <CardHeader>
          <CardTitle>{t("cards.keywordRankings")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Tabs */}
            <div className="grid w-full grid-cols-2 gap-2 p-1 bg-muted rounded-lg">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>

            {/* Tab Content */}
            <div className="space-y-4">
              {/* Header with stats */}
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-8 w-24" />
              </div>

              {/* Keywords list */}
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex space-x-4 items-center">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[50px]" />
                    <Skeleton className="h-4 w-[80px]" />
                    <Skeleton className="h-4 w-[80px]" />
                    <Skeleton className="h-4 w-[80px]" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="lg:w-1/2 w-full">
      <CardHeader>
        <CardTitle>{t("cards.keywordRankings")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="semrush" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="seobserver">
              {t("tabs.seobserverKeywords")}
            </TabsTrigger>
            <TabsTrigger value="semrush">
              {t("tabs.semrushKeywords")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="seobserver" className="mt-4">
            <DomainSEObserverKeywordsPanel
              domain={domain}
              data={seobserverKeywordsData}
              isLoading={seobserverKeywordsLoading}
              isUnlocked={isUnlocked}
            />
          </TabsContent>
          <TabsContent value="semrush" className="mt-4">
            <DomainKeywordRankingsPanel
              domain={domain}
              data={semrushKeywordsData}
              isLoading={semrushKeywordsLoading}
              isUnlocked={isUnlocked}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
