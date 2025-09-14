import { useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Loader2 } from "lucide-react";
import { AxiosInstance } from "@/lib/axios-instance";

interface BacklinkData {
  history: {
    date: string;
    totalBacklinks: number;
    uniqueDomains: number;
  }[];
  newLost: {
    new: {
      url: string;
      domain: string;
      date: string;
      trustFlow: number;
    }[];
    lost: {
      url: string;
      domain: string;
      date: string;
      trustFlow: number;
    }[];
  };
  trustMetrics: {
    trustFlow: number;
    citationFlow: number;
    trustRatio: number;
  };
  topicalTrustFlow: {
    category: string;
    trustFlow: number;
  }[];
}

export function BacklinksTimeline() {
  const t = useTranslations("backlinksTimeline");

  const [url, setUrl] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  );
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

  const { data, isLoading, error } = useQuery<BacklinkData>({
    queryKey: ["backlinks", url, startDate, endDate],
    queryFn: async () => {
      if (!url || !startDate || !endDate) return null;
      const response = await AxiosInstance.get(
        `/api/backlinks?url=${encodeURIComponent(url)}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
      );
      return response.data;
    },
    enabled: !!url && !!startDate && !!endDate,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          placeholder={t("form.urlPlaceholder")}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1"
        />
        <div className="flex gap-4">
          <Calendar
            mode="single"
            selected={startDate}
            onSelect={setStartDate}
            className="rounded-md border"
          />
          <Calendar
            mode="single"
            selected={endDate}
            onSelect={setEndDate}
            className="rounded-md border"
          />
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      )}

      {error && <div className="text-red-500">{t("errors.loading")}</div>}

      {data && (
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">{t("tabs.overview")}</TabsTrigger>
            <TabsTrigger value="new-lost">{t("tabs.newLost")}</TabsTrigger>
            <TabsTrigger value="trust-flow">{t("tabs.trustFlow")}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {t("overview.title")}
              </h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.history}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => format(new Date(date), "MMM d")}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(date) =>
                        format(new Date(date), "MMM d, yyyy")
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="totalBacklinks"
                      stroke="#8884d8"
                      name={t("overview.chart.totalBacklinks")}
                    />
                    <Line
                      type="monotone"
                      dataKey="uniqueDomains"
                      stroke="#82ca9d"
                      name={t("overview.chart.uniqueDomains")}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="new-lost">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {t("newLost.newBacklinks")}
                </h3>
                <div className="space-y-4">
                  {data.newLost.new.map((backlink) => (
                    <div key={backlink.url} className="border-b pb-2">
                      <div className="font-medium">{backlink.domain}</div>
                      <div className="text-sm text-gray-500">
                        {backlink.url}
                      </div>
                      <div className="text-sm">
                        {t("newLost.trustFlow")}: {backlink.trustFlow}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {t("newLost.lostBacklinks")}
                </h3>
                <div className="space-y-4">
                  {data.newLost.lost.map((backlink) => (
                    <div key={backlink.url} className="border-b pb-2">
                      <div className="font-medium">{backlink.domain}</div>
                      <div className="text-sm text-gray-500">
                        {backlink.url}
                      </div>
                      <div className="text-sm">
                        {t("newLost.trustFlow")}: {backlink.trustFlow}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="trust-flow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {t("trustFlow.trustMetrics")}
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-500">
                      {t("trustFlow.trustFlow")}
                    </div>
                    <div className="text-2xl font-bold">
                      {data.trustMetrics.trustFlow}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">
                      {t("trustFlow.citationFlow")}
                    </div>
                    <div className="text-2xl font-bold">
                      {data.trustMetrics.citationFlow}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">
                      {t("trustFlow.trustRatio")}
                    </div>
                    <div className="text-2xl font-bold">
                      {data.trustMetrics.trustRatio.toFixed(2)}
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {t("trustFlow.topicalTrustFlow")}
                </h3>
                <div className="space-y-4">
                  {data.topicalTrustFlow.map((topic) => (
                    <div key={topic.category} className="border-b pb-2">
                      <div className="font-medium">{topic.category}</div>
                      <div className="text-sm">
                        {t("trustFlow.trustFlow")}: {topic.trustFlow}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
