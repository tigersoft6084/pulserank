import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SERPResult } from "@/types/serp";
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Plus,
  Minus,
} from "lucide-react";
import { useTranslations } from "next-intl";

interface CompareViewProps {
  daysDifference: number;
  currentResults?: SERPResult[];
  historicalResults?: SERPResult[];
  differences: Record<string, number>;
  selectedUrl?: string;
  onUrlSelect?: (url: string) => void;
}

export function CompareView({
  daysDifference,
  currentResults,
  historicalResults,
  differences,
  selectedUrl,
  onUrlSelect,
}: CompareViewProps) {
  const t = useTranslations("serpMachine.compareView");

  // Create maps for quick lookup
  const currentMap = new Map(
    currentResults?.map((result) => [result.url, result]) || [],
  );
  const historicalMap = new Map(
    historicalResults?.map((result) => [result.url, result]) || [],
  );

  // Get all unique URLs
  const allUrls = new Set([
    ...(currentResults?.map((r) => r.url) || []),
    ...(historicalResults?.map((r) => r.url) || []),
  ]);

  // Calculate statistics
  const stats = {
    improved: 0,
    declined: 0,
    unchanged: 0,
    new: 0,
    dropped: 0,
  };

  allUrls.forEach((url) => {
    const diff = differences[url];
    const existsInCurrent = currentMap.has(url);
    const existsInHistorical = historicalMap.has(url);

    if (diff !== undefined) {
      if (diff > 0) stats.improved++;
      else if (diff < 0) stats.declined++;
      else stats.unchanged++;
    } else if (existsInCurrent && !existsInHistorical) {
      stats.new++;
    } else if (!existsInCurrent && existsInHistorical) {
      stats.dropped++;
    }
  });

  // Get detailed information for selected URL
  const getDetailedInfo = () => {
    if (!selectedUrl) return null;

    const currentResult = currentMap.get(selectedUrl);
    const historicalResult = historicalMap.get(selectedUrl);
    const diff = differences[selectedUrl];

    if (diff !== undefined && currentResult && historicalResult) {
      // URL exists in both tables
      return {
        type: "changed" as const,
        domain: currentResult.domain,
        url: selectedUrl,
        fromRank: historicalResult.rank,
        toRank: currentResult.rank,
        diff,
        icon:
          diff > 0 ? (
            <TrendingUp className="w-4 h-4 text-green-600" />
          ) : diff < 0 ? (
            <TrendingDown className="w-4 h-4 text-red-600" />
          ) : (
            <Minus className="w-4 h-4 text-gray-600" />
          ),
        badgeText: diff > 0 ? `+${diff}` : diff,
        badgeColor:
          diff > 0
            ? "text-green-600"
            : diff < 0
              ? "text-red-600"
              : "text-gray-600",
      };
    } else if (currentResult && !historicalResult) {
      // New URL
      return {
        type: "new" as const,
        domain: currentResult.domain,
        url: selectedUrl,
        fromRank: "100+",
        toRank: currentResult.rank,
        diff: null,
        icon: <Plus className="w-4 h-4 text-green-600" />,
        badgeText: "in",
        badgeColor: "text-green-600",
      };
    } else if (!currentResult && historicalResult) {
      // Dropped URL
      return {
        type: "dropped" as const,
        domain: historicalResult.domain,
        url: selectedUrl,
        fromRank: historicalResult.rank,
        toRank: "100+",
        diff: null,
        icon: <TrendingDown className="w-4 h-4 text-red-600" />,
        badgeText: "out",
        badgeColor: "text-red-600",
      };
    }

    return null;
  };

  const detailedInfo = getDetailedInfo();

  return (
    <div className="sticky top-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span>{t("title", { days: daysDifference })}</span>
            <Badge variant="outline" className="text-xs">
              {t("totalUrls", { count: allUrls.size })}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Statistics Summary */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="text-center p-2 bg-green-50 rounded">
              <div className="text-green-600 font-bold">{stats.improved}</div>
              <div className="text-xs text-green-600">
                {t("statistics.improved")}
              </div>
            </div>
            <div className="text-center p-2 bg-red-50 rounded">
              <div className="text-red-600 font-bold">{stats.declined}</div>
              <div className="text-xs text-red-600">
                {t("statistics.declined")}
              </div>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded">
              <div className="text-blue-600 font-bold">{stats.new}</div>
              <div className="text-xs text-blue-600">{t("statistics.new")}</div>
            </div>
            <div className="text-center p-2 bg-orange-50 rounded">
              <div className="text-orange-600 font-bold">{stats.dropped}</div>
              <div className="text-xs text-orange-600">
                {t("statistics.dropped")}
              </div>
            </div>
          </div>

          {/* Detailed Change View */}
          {detailedInfo ? (
            <div className="space-y-3 mb-4">
              <div className="text-sm font-medium text-muted-foreground">
                {t("detailedChanges")}
              </div>

              <div className="p-2 border rounded-lg bg-gray-50">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {detailedInfo.icon}
                    <span className="font-medium truncate">
                      {detailedInfo.domain}
                    </span>
                  </div>

                  <div className="text-xs text-muted-foreground truncate">
                    {detailedInfo.url}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-muted-foreground">{t("rank")}</span>
                      <span className="ml-1 font-medium">
                        {detailedInfo.fromRank}{" "}
                        <ArrowRight className="inline w-3 h-3" />{" "}
                        {detailedInfo.toRank}
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={detailedInfo.badgeColor}
                    >
                      {detailedInfo.badgeText}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground mb-4 p-2 bg-gray-50 rounded">
              {t("hoverInstruction")}
            </div>
          )}

          {/* Quick Summary of Top Changes */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">
              {t("topChanges")}
            </div>
            {Object.entries(differences)
              .sort(([, a], [, b]) => Math.abs(b) - Math.abs(a))
              .slice(0, 3)
              .map(([url, diff]) => {
                const currentResult = currentMap.get(url);
                const historicalResult = historicalMap.get(url);

                if (!currentResult || !historicalResult) return null;

                return (
                  <div
                    key={url}
                    className={`flex items-center justify-between p-2 border rounded text-xs cursor-pointer transition-colors ${
                      selectedUrl === url
                        ? "bg-blue-50 border-blue-200"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => onUrlSelect?.(url)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {currentResult.domain}
                      </div>
                      <div className="text-muted-foreground truncate">
                        {url}
                      </div>
                    </div>
                    <div className="text-right ml-2">
                      <div
                        className={`font-bold ${diff > 0 ? "text-green-600" : diff < 0 ? "text-red-600" : "text-gray-600"}`}
                      >
                        {diff > 0 ? `+${diff}` : diff}
                      </div>
                      <div className="text-muted-foreground">
                        {historicalResult.rank}{" "}
                        <ArrowRight className="inline w-3 h-3" />{" "}
                        {currentResult.rank}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
