import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  Legend,
} from "recharts";
import { TTF_COLOR_DATA } from "@/lib/config";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";
import { ChartHistoricalMetricsData } from "@/hooks/features/sites/use-domain-historical-metrics";

interface DomainHistoricalMetricsPanelProps {
  data?: ChartHistoricalMetricsData[];
  isLoading: boolean;
}

export function DomainHistoricalMetricsPanel({
  data: chartData,
  isLoading,
}: DomainHistoricalMetricsPanelProps) {
  const t = useTranslations("identityCard.historicalMetricsPanel");

  // Get all unique ttfTopics
  const allTopics = [...new Set(chartData?.map((item) => item.ttfTopic) || [])];

  // Find the topic with the maximum ttfScore
  const maxTtfScore = Math.max(
    ...(chartData?.map((item) => item.ttfScore) || [0]),
  );
  const maxTtfTopic =
    chartData?.find((item) => item.ttfScore === maxTtfScore)?.ttfTopic ||
    "computers";
  const maxTtfColor =
    TTF_COLOR_DATA[maxTtfTopic as keyof typeof TTF_COLOR_DATA] || "#FF3333";

  // Process data to create stacked bar data for all topics
  const processedData =
    chartData?.map((item) => {
      const processedItem: Record<string, string | number> = { ...item };
      allTopics.forEach((topic) => {
        // For bars, use a fixed height (100) when the topic matches, 0 otherwise
        // This creates background bars that don't interfere with the line data
        processedItem[topic] = item.ttfTopic === topic ? item.ttfScore : 0;
      });
      return processedItem;
    }) || [];

  // Calculate the maximum refDomains value to determine appropriate scaling
  const maxRefDomains =
    processedData.length > 0
      ? Math.max(...processedData.map((item) => Number(item.refDomains) || 0))
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

  const refDomainsFormatter = createFormatter(maxRefDomains);

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
      <Label className="text-sm text-muted-foreground">{t("title")}</Label>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 12 }}
              domain={[0, 200]}
              label={{
                value: t("chart.trustFlow"),
                angle: -90,
                position: "insideLeft",
                fontSize: 14,
                fill: maxTtfColor,
                fontFamily:
                  "ui-sans-serif, -apple-system, system-ui, Segoe UI, Helvetica, Apple Color Emoji, Arial, sans-serif, Segoe UI Emoji, Segoe UI Symbol",
              }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12 }}
              tickFormatter={refDomainsFormatter}
              label={{
                value: t("chart.refDomains"),
                angle: 90,
                position: "insideRight",
                fontSize: 14,
                fill: "#000000",
                fontFamily:
                  "ui-sans-serif, -apple-system, system-ui, Segoe UI, Helvetica, Apple Color Emoji, Arial, sans-serif, Segoe UI Emoji, Segoe UI Symbol",
              }}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                name === "refDomains"
                  ? refDomainsFormatter(value)
                  : value.toLocaleString(),
                name === "ttfScore"
                  ? t("chart.trustFlow")
                  : name === "refDomains"
                    ? t("chart.refDomains")
                    : allTopics.includes(name)
                      ? name.charAt(0).toUpperCase() + name.slice(1)
                      : name,
              ]}
            />
            {/* Stacked bars for all topical categories - render first so they appear behind */}
            {allTopics.map((topic, index) => (
              <Bar
                key={topic}
                yAxisId="left"
                dataKey={topic}
                stackId="a"
                fill={
                  TTF_COLOR_DATA[topic as keyof typeof TTF_COLOR_DATA] ||
                  `hsl(${index * 60}, 70%, 50%)`
                }
                name={topic}
              />
            ))}
            {/* Line for TrustFlow - render after bars so it appears on top */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="ttfScore"
              stroke={maxTtfColor}
              strokeWidth={2}
              dot={{ fill: maxTtfColor, strokeWidth: 1, r: 3 }}
              name={t("chart.trustFlow")}
            />
            {/* Line for RefDomains - render after bars so it appears on top */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="refDomains"
              stroke="#000000"
              strokeWidth={2}
              dot={{ fill: "#000000", strokeWidth: 1, r: 3 }}
              name={t("chart.refDomains")}
            />
            <Legend />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
