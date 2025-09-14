import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, BarChart3, Eye, Plus } from "lucide-react";
import { flagMap } from "@/lib/utils/flag-static-map";
import { baseToCountryCode } from "@/lib/utils/flag-utils";
import { useTranslations } from "next-intl";
import { useLanguageStore } from "@/store/language-store";

interface KeywordMetrics {
  searchVolume: number;
  cpc: number;
  competition: number;
  interest: number;
}

interface KeywordSummaryProps {
  keyword: string;
  metrics?: KeywordMetrics;
  isLoading: boolean;
  onSeeSERP: () => void;
  onSeeBacklinksTimeline: () => void;
  onSeeCompetition: () => void;
  onAddToCampaign: () => void;
}

export function KeywordSummary({
  keyword,
  metrics,
  isLoading,
  onSeeSERP,
  onSeeBacklinksTimeline,
  onSeeCompetition,
  onAddToCampaign,
}: KeywordSummaryProps) {
  const t = useTranslations("serpMachine.keywordSummary");
  const { currentBase } = useLanguageStore();
  // Get flag component for the selected base
  const countryCode = baseToCountryCode[currentBase] || "US";
  const Flag = flagMap[countryCode];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          {t("title", { keyword })}
          {Flag && <Flag title={countryCode} className="w-6 h-4" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-8 w-20 mx-auto mb-2" />
                <Skeleton className="h-4 w-16 mx-auto" />
              </div>
            ))}
          </div>
        ) : metrics ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {metrics.searchVolume.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">
                {t("metrics.searchVolume")}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                ${metrics.cpc}
              </div>
              <div className="text-sm text-muted-foreground">
                {t("metrics.cpc")}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {metrics.competition}
              </div>
              <div className="text-sm text-muted-foreground">
                {t("metrics.competition")}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {metrics.interest}
              </div>
              <div className="text-sm text-muted-foreground">
                {t("metrics.interest")}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground mb-6">
            {t("noMetrics")}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button onClick={onSeeSERP} variant="outline" size="sm">
            <Search className="w-4 h-4 mr-2" />
            {t("actions.seeSerp")}
          </Button>
          <Button onClick={onSeeBacklinksTimeline} variant="outline" size="sm">
            <BarChart3 className="w-4 h-4 mr-2" />
            {t("actions.seeBacklinksTimeline")}
          </Button>
          <Button onClick={onSeeCompetition} variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            {t("actions.seeCompetition")}
          </Button>
          <Button onClick={onAddToCampaign} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            {t("actions.addToCampaign")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
