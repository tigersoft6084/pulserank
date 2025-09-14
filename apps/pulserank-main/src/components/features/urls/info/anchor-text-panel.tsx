import { Label } from "@/components/ui/label";
import {
  Tooltip as TooltipUI,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AnchorTextData } from "@/types/urls";
import { Info } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { useTranslations } from "next-intl";

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
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180);
  const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180);

  return percent > 0.05 ? (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      className="text-[10px] font-medium"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  ) : null;
};

export function AnchorTextPanel({
  anchorTextData,
}: {
  anchorTextData: AnchorTextData;
}) {
  const t = useTranslations("identityCard.anchorTextPanel");

  // Transform anchor text data for chart with colors
  const chartColors = [
    "#4169E1",
    "#8A2BE2",
    "#FF1493",
    "#FF69B4",
    "#FF4500",
    "#DAA520",
    "#32CD32",
    "#20B2AA",
    "#9370DB",
    "#FF6347",
    "#808080",
  ];

  const fullAnchorTextData = [
    ...anchorTextData.anchors,
    {
      AnchorText: "Other",
      RefDomains:
        anchorTextData.TotalRefDomains -
        anchorTextData.anchors.reduce((acc, item) => acc + item.RefDomains, 0),
      TotalLinks: 0,
      NoFollowLinks: 0,
    },
  ];

  const chartData =
    fullAnchorTextData.map((item, index) => ({
      name: item.AnchorText || "[Empty Anchor]",
      value: item.RefDomains,
      fill: chartColors[index % chartColors.length],
    })) || [];

  return (
    <div className="w-full lg:w-1/3 space-y-2.5 border border-gray-200 rounded-md p-3">
      <div className="flex items-start gap-2">
        <Label className="text-muted-foreground">{t("title")}</Label>
        <TooltipProvider>
          <TooltipUI>
            <TooltipTrigger asChild>
              <Info className="w-4 h-4 cursor-help text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-[480px] space-y-2">
              <p>{t("tooltip")}</p>
            </TooltipContent>
          </TooltipUI>
        </TooltipProvider>
      </div>
      {chartData.length > 0 ? (
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="40%"
                cy="55%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
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
                formatter={(value: number) => [
                  `${value} ${t("chart.refDomains")}`,
                  t("chart.refDomainsLabel"),
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
                width={130}
                verticalAlign="top"
                iconSize={8}
                iconType="square"
                wrapperStyle={{
                  fontSize: "12px",
                }}
                formatter={(value) => (
                  <TooltipProvider>
                    <TooltipUI>
                      <TooltipTrigger className="max-w-[100px] truncate">
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
      ) : (
        <div className="bg-gray-50 rounded-sm p-4 text-center text-sm text-gray-500">
          {t("noData")}
        </div>
      )}
    </div>
  );
}
