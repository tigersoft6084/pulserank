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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";

interface GoogleTrendsData {
  keywords: string[];
  location_code: number;
  language_code: string;
  items: Array<{
    data: Array<{
      date_from: string;
      date_to: string;
      timestamp: number;
      missing_data: boolean;
      values: number[];
    }>;
  }>;
}

interface GoogleTrendsChartProps {
  data: GoogleTrendsData | null;
  isLoading: boolean;
  error: Error | null;
  keyword: string;
}

export function GoogleTrendsChart({
  data,
  isLoading,
  error,
  keyword,
}: GoogleTrendsChartProps) {
  const t = useTranslations("googleTrends");

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            {t("error")}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.items || data.items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            {t("noData", { keyword })}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Process the data for the chart
  const chartData =
    data.items[0]?.data
      ?.filter((item) => !item.missing_data)
      ?.map((item) => ({
        date: new Date(item.date_from),
        value: item.values[0] || 0,
        dateLabel: format(new Date(item.date_from), "MMM d, yyyy"),
      }))
      ?.sort((a, b) => a.date.getTime() - b.date.getTime()) || [];

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            {t("noTrendData", { keyword })}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="dateLabel"
                tick={{ fontSize: 12, fill: "#666" }}
                interval="preserveStartEnd"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return format(date, "MMM d, yyyy");
                }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 12, fill: "#666" }}
                tickFormatter={(value) => value.toString()}
                label={{
                  value: t("chart.searchInterest"),
                  angle: -90,
                  position: "insideLeft",
                  fontSize: 14,
                  fill: "#666",
                }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  padding: "8px",
                }}
                labelFormatter={(value) => {
                  const date = new Date(value);
                  return format(date, "MMM d, yyyy");
                }}
                formatter={(value: number) => [
                  value.toString(),
                  t("chart.searchInterest"),
                ]}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#4285f4"
                strokeWidth={2}
                dot={{ fill: "#4285f4", strokeWidth: 1, r: 3 }}
                activeDot={{ r: 5, stroke: "#4285f4", strokeWidth: 2 }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
