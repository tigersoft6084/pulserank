import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";
import { DomainOverviewData } from "@/types/api/semrush";

interface DomainTrafficPanelProps {
  domain: string;
  data?: DomainOverviewData[];
  isLoading: boolean;
}

export function DomainTrafficPanel({
  domain,
  data: trafficData,
  isLoading,
}: DomainTrafficPanelProps) {
  const t = useTranslations("identityCard.trafficPanel");

  // Process data to format dates and ensure both metrics are available
  const processedData =
    trafficData?.map((item) => ({
      ...item,
      date: new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      }),
      // Ensure both metrics are numbers
      organicTraffic: Number(item.organicTraffic) || 0,
      organicKeywords: Number(item.organicKeywords) || 0,
    })) || [];

  // Calculate the maximum values to determine appropriate scaling
  const maxTraffic =
    processedData.length > 0
      ? Math.max(...processedData.map((item) => item.organicTraffic))
      : 0;
  const maxKeywords =
    processedData.length > 0
      ? Math.max(...processedData.map((item) => item.organicKeywords))
      : 0;

  // Dynamic formatter function based on data range
  const createFormatter = (maxValue: number) => {
    if (maxValue >= 1000000000) {
      // Billions
      return (value: number) => `${(value / 1000000000).toFixed(1)}B`;
    } else if (maxValue >= 1000000) {
      // Millions
      return (value: number) => `${(value / 1000000).toFixed(1)}M`;
    } else if (maxValue >= 1000) {
      // Thousands
      return (value: number) => `${(value / 1000).toFixed(1)}K`;
    } else {
      // Raw numbers for small values
      return (value: number) => value.toFixed(0);
    }
  };

  const trafficFormatter = createFormatter(maxTraffic);
  const keywordsFormatter = createFormatter(maxKeywords);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center border border-gray-200 rounded-md p-3">
        <div className="text-muted-foreground">{t("loading")}</div>
      </div>
    );
  }

  if (!processedData || processedData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center border border-gray-200 rounded-md p-3">
        <div className="text-muted-foreground">{t("noData")}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 border border-gray-200 rounded-md p-3 h-full">
      <Label className="text-sm text-muted-foreground">
        {t("title", { domain })}
      </Label>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 12 }}
              tickFormatter={trafficFormatter}
              label={{
                value: t("chart.traffic"),
                angle: -90,
                position: "insideLeft",
                fontSize: 14,
                fill: "#8884d8",
                fontFamily:
                  "ui-sans-serif, -apple-system, system-ui, Segoe UI, Helvetica, Apple Color Emoji, Arial, sans-serif, Segoe UI Emoji, Segoe UI Symbol",
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12 }}
              tickFormatter={keywordsFormatter}
              label={{
                value: t("chart.keywords"),
                angle: 90,
                position: "insideRight",
                fontSize: 14,
                fill: "#82ca9d",
                fontFamily:
                  "ui-sans-serif, -apple-system, system-ui, Segoe UI, Helvetica, Apple Color Emoji, Arial, sans-serif, Segoe UI Emoji, Segoe UI Symbol",
              }}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                value.toLocaleString(),
                name === "organicTraffic"
                  ? t("chart.traffic")
                  : t("chart.keywords"),
              ]}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="organicTraffic"
              stroke="#8884d8"
              strokeWidth={2}
              dot={{ fill: "#8884d8", strokeWidth: 1, r: 3 }}
              name={t("chart.traffic")}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="organicKeywords"
              stroke="#82ca9d"
              strokeWidth={2}
              dot={{ fill: "#82ca9d", strokeWidth: 1, r: 3 }}
              name={t("chart.keywords")}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
