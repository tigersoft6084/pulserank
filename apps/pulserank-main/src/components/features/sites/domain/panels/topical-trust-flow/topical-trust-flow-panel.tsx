import {
  Tooltip as TooltipUI,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslations } from "next-intl";
import { TTF_COLOR_DATA } from "@/lib/config";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { TopicalTrustFlowResponse } from "@/hooks/features/sites/use-domain-topical-trust-flow";

interface CustomizedLabelProps {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
}

const renderCustomizedLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
}: CustomizedLabelProps) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize="12"
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

interface DomainTopicalTrustFlowPanelProps {
  data?: TopicalTrustFlowResponse;
  isLoading: boolean;
}

export function DomainTopicalTrustFlowPanel({
  data: topicalTrustFlowData,
  isLoading,
}: DomainTopicalTrustFlowPanelProps) {
  const t = useTranslations("identityCard.topicalTrustFlowPanel");

  if (isLoading) {
    return (
      <div className="h-[200px] flex items-center justify-center">
        <div className="text-muted-foreground">{t("loading")}</div>
      </div>
    );
  }

  if (!topicalTrustFlowData?.data || topicalTrustFlowData.data.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center">
        <div className="text-muted-foreground">{t("noData")}</div>
      </div>
    );
  }

  // Create chart data with all categories
  const chartData = topicalTrustFlowData.data.map((item) => {
    const mainCategory = item.topic.split("/")[0];
    const color =
      TTF_COLOR_DATA[mainCategory as keyof typeof TTF_COLOR_DATA] || "#808080";

    return {
      name: item.topic,
      value: item.normalizedPercentage,
      trustFlow: item.trustFlow,
      originalPercentage: item.percentage,
      fill: color,
      mainCategory,
    };
  });

  return (
    <div className="h-[360px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="40%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
            startAngle={90}
            endAngle={-270}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [
              `${value.toFixed(1)}%`,
              name,
            ]}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #ccc",
              borderRadius: "4px",
              padding: "4px",
            }}
          />
          <Legend
            layout="vertical"
            align="right"
            width={300}
            verticalAlign="middle"
            iconSize={8}
            iconType="square"
            wrapperStyle={{
              fontSize: "12px",
              maxHeight: "300px",
              overflowY: "auto",
              overflowX: "hidden",
            }}
            formatter={(value) => (
              <TooltipProvider>
                <TooltipUI>
                  <TooltipTrigger className="max-w-[240px] truncate">
                    {value}
                  </TooltipTrigger>
                  <TooltipContent>{value}</TooltipContent>
                </TooltipUI>
              </TooltipProvider>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
