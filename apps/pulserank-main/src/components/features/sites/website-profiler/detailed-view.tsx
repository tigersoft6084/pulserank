import { useTranslations } from "next-intl";
import { LayoutGrid } from "lucide-react";
import { useViewUrlStore } from "@/store/view-url-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Favicon } from "@/components/ui/favicon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { DetailedViewItem } from "@/hooks/features/sites/use-website-profiler";
import { TTF_COLOR_DATA } from "@/lib/config";

interface WebsiteProfilerDetailedViewProps {
  data: DetailedViewItem[];
  submittedItems: Array<{
    original: string;
    type: "url" | "site" | "domain";
  }>;
}

export function WebsiteProfilerDetailedView({
  data,
  submittedItems,
}: WebsiteProfilerDetailedViewProps) {
  const t = useTranslations("websiteProfiler");
  const { setUrl, setSubmittedUrl } = useViewUrlStore();

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {t("table.noData")}
      </div>
    );
  }

  // Create data with original URLs for proper sorting
  const dataWithOriginalUrls = data.map((item, index) => ({
    ...item,
    originalURL: submittedItems[index]?.original || item.URL,
    submittedItem: submittedItems[index],
  }));

  return (
    <div className="space-y-6">
      {dataWithOriginalUrls.map((item, index) => (
        <Card key={index}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Favicon url={item.URL} size={20} />
              <a
                href={`https://${item.URL}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                {item.originalURL}
              </a>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="p-2"
                      size="sm"
                      onClick={() => {
                        const submittedItem = item.submittedItem;
                        if (!submittedItem) return;

                        if (submittedItem.type === "url") {
                          // If it's a URL, go to URL info page
                          setUrl(submittedItem.original);
                          setSubmittedUrl(submittedItem.original);
                          window.open(`/urls/info`, "_blank");
                        } else {
                          // If it's a site or domain, go to site view page
                          window.open(
                            `/sites/${encodeURIComponent(item.URL)}/view`,
                            "_blank",
                          );
                        }
                      }}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <span>{t("detailedView.tooltips.viewSiteDetails")}</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {item.error ? (
              <div className="text-red-600">{item.error}</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Metrics Column */}
                <div className="space-y-4 border rounded-md p-4">
                  <h3 className="font-semibold">
                    {t("detailedView.sections.metrics")}
                  </h3>
                  <div className="space-y-3.5">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        {t("detailedView.metrics.theme")}
                      </span>
                      {item.metrics.theme !== "N/A" ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                style={{
                                  backgroundColor:
                                    TTF_COLOR_DATA[
                                      item.metrics.theme.split(
                                        "/",
                                      )[0] as keyof typeof TTF_COLOR_DATA
                                    ],
                                }}
                              >
                                {item.metrics.topicalTrustFlowValue}{" "}
                                {item.metrics.theme}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <span>
                                {item.metrics.topicalTrustFlowValue}{" "}
                                {item.metrics.theme}
                              </span>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        "-"
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        {t("detailedView.metrics.tfCf")}
                      </span>
                      <span className="text-sm">
                        {item.metrics.tf} / {item.metrics.cf} (
                        {item.metrics.tf > 0 && item.metrics.cf > 0
                          ? Math.round(
                              (item.metrics.tf / item.metrics.cf) * 100,
                            )
                          : 0}
                        %)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        {t("detailedView.metrics.refDomains")}
                      </span>
                      <span className="text-sm">
                        {item.metrics.refDomains.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        {t("detailedView.metrics.refIPs")}
                      </span>
                      <span className="text-sm">
                        {item.metrics.refIPs.toLocaleString()} (
                        {item.metrics.refSubnets.toLocaleString()})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        {t("detailedView.metrics.backlinks")}
                      </span>
                      <span className="text-sm">
                        {item.metrics.backlinks.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Keywords Column */}
                <div className="space-y-4 border rounded-md p-4">
                  <h3 className="font-semibold">
                    {t("detailedView.sections.keywords")}
                  </h3>
                  <div className="space-y-3.5">
                    {item.keywords.length > 0 ? (
                      item.keywords.map((keyword, kwIndex) => (
                        <div key={kwIndex} className="text-sm">
                          {keyword.keyword}
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        {t("detailedView.noData.keywords")}
                      </div>
                    )}
                  </div>
                </div>

                {/* Anchors Column */}
                <div className="space-y-4 border rounded-md p-4">
                  <h3 className="font-semibold">
                    {t("detailedView.sections.anchors")}
                  </h3>
                  <div className="space-y-3.5">
                    {item.anchors.length > 0 ? (
                      item.anchors.map((anchor, anchorIndex) => (
                        <div key={anchorIndex} className="text-sm">
                          <div className="flex justify-between gap-4">
                            <span className="truncate">{anchor.anchor}</span>
                            <span className="text-muted-foreground">
                              {anchor.percentage}%
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        {t("detailedView.noData.anchors")}
                      </div>
                    )}
                  </div>
                </div>

                {/* Top Backlinks Column */}
                <div className="space-y-4 border rounded-md p-4">
                  <h3 className="font-semibold">
                    {t("detailedView.sections.topBacklinks")}
                  </h3>
                  <div className="space-y-2">
                    {item.topBacklinks.length > 0 ? (
                      item.topBacklinks.map((backlink, blIndex) => (
                        <div
                          key={blIndex}
                          className="flex justify-between text-sm"
                        >
                          <div className="flex items-center gap-2">
                            <Favicon url={backlink.domain} size={16} />
                            <span className="truncate max-w-[120px]">
                              {backlink.domain}
                            </span>
                          </div>
                          {backlink.theme !== "N/A" ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge
                                    className="mt-1"
                                    style={{
                                      backgroundColor:
                                        TTF_COLOR_DATA[
                                          backlink.theme.split(
                                            "/",
                                          )[0] as keyof typeof TTF_COLOR_DATA
                                        ],
                                    }}
                                  >
                                    {backlink.ttf}
                                  </Badge>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <span>
                                    {backlink.ttf} {backlink.theme}
                                  </span>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <Badge variant="secondary">{backlink.ttf}</Badge>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-muted-foreground">
                        {t("detailedView.noData.backlinks")}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
