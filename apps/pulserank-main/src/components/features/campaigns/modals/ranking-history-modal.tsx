import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChartLine } from "lucide-react";
import { RankingData } from "@/types/campaigns";
import {
  getCountryNameForBase,
  baseToCountryCode,
} from "@/lib/utils/flag-utils";
import { flagMap } from "@/lib/utils/flag-static-map";
import { useTranslations } from "next-intl";

interface RankingHistoryModalProps {
  ranking: RankingData;
  site: string;
}

export function RankingHistoryModal({
  ranking,
  site,
}: RankingHistoryModalProps) {
  const t = useTranslations("campaigns.modals.rankingHistory");

  // Transform rankings data for the chart
  const chartData = ranking.rankings
    .filter((r) => r.rank !== null) // Only show days with rankings
    .map((r) => ({
      date: r.date,
      rank: r.rank,
      url: r.url,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Invert the Y-axis so that lower ranks (better positions) appear higher on the chart
  const invertedData = chartData.map((item) => ({
    ...item,
    invertedRank: item.rank ? 100 - item.rank : null, // Invert the rank for better visualization
  }));

  const countryName = getCountryNameForBase(ranking.base);
  const countryCode = baseToCountryCode[ranking.base];
  const Flag = countryCode ? flagMap[countryCode] : null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-6 h-6 p-0.5">
          <ChartLine />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {t("title", { keyword: ranking.keyword, site })}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">
                {t("columns.country")}
              </div>
              <div className="flex items-center gap-2">
                {Flag ? (
                  <Flag title={countryCode} className="w-6 h-4" />
                ) : (
                  <span className="w-6 h-4 bg-gray-200 rounded" />
                )}
                <span className="font-medium">{countryName}</span>
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">
                {t("columns.searchVolume")}
              </div>
              <div className="font-medium">
                {ranking.search_volume.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">{t("columns.cpc")}</div>
              <div className="font-medium">${ranking.cpc}</div>
            </div>
            <div>
              <div className="text-muted-foreground">
                {t("columns.competition")}
              </div>
              <div className="font-medium">{ranking.competition}</div>
            </div>
          </div>

          {chartData.length > 0 ? (
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={invertedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => format(new Date(date), "MMM d")}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tickFormatter={(value) => (100 - value).toString()} // Show actual rank values
                    label={{
                      value: t("chart.rank"),
                      angle: -90,
                      position: "insideLeft",
                    }}
                  />
                  <Tooltip
                    labelFormatter={(date) =>
                      format(new Date(date), "MMM d, yyyy")
                    }
                    formatter={(value) => [
                      typeof value === "number"
                        ? (100 - value).toString()
                        : "No data",
                      t("chart.rank"),
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="invertedRank"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={{ fill: "#8884d8", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                    connectNulls={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[400px] flex items-center justify-center text-muted-foreground">
              {t("chart.noData")}
            </div>
          )}

          {chartData.length > 0 && (
            <div className="text-sm text-muted-foreground">
              <div className="font-medium mb-2">{t("summary.title")}</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="text-muted-foreground">
                    {t("summary.bestRank")}
                  </span>{" "}
                  <span className="font-medium">
                    {Math.min(...chartData.map((d) => d.rank!))}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {t("summary.worstRank")}
                  </span>{" "}
                  <span className="font-medium">
                    {Math.max(...chartData.map((d) => d.rank!))}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {t("summary.averageRank")}
                  </span>{" "}
                  <span className="font-medium">
                    {Math.round(
                      chartData.reduce((sum, d) => sum + d.rank!, 0) /
                        chartData.length,
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    {t("summary.dataPoints")}
                  </span>{" "}
                  <span className="font-medium">{chartData.length}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
