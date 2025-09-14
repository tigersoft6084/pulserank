import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

import { HistoricalMetricsData } from "@/hooks/features/sites/use-domain-historical-data";

interface HistoricalMetricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  metrics: HistoricalMetricsData;
}

export function HistoricalMetricsModal({
  isOpen,
  onClose,
  metrics,
}: HistoricalMetricsModalProps) {
  const t = useTranslations("identityCard.historicalTable.detailedView");

  const formatNumber = (num: number): string => {
    return num.toLocaleString();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("title", { date: metrics.date })}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* General Information */}
          <div className="space-y-3 border border-gray-200 rounded-md p-3">
            <h3 className="text-sm font-semibold text-muted-foreground">
              {t("sections.generalInformation")}
            </h3>
            <div className="space-y-3.5 p-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">{t("fields.item")}</span>
                <span className="text-sm font-medium">{metrics.item}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">{t("fields.resultCode")}</span>
                <span className="text-sm font-medium">
                  {metrics.resultCode}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">{t("fields.status")}</span>
                <span className="text-sm font-medium">{metrics.status}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">{t("fields.date")}</span>
                <span className="text-sm font-medium">{metrics.date}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">{t("fields.indexedURLs")}</span>
                <span className="text-sm font-medium">
                  {formatNumber(metrics.indexedURLs)}
                </span>
              </div>
            </div>
          </div>

          {/* Flow Metrics */}
          <div className="space-y-3 border border-gray-200 rounded-md p-3">
            <h3 className="text-sm font-semibold text-muted-foreground">
              {t("sections.flowMetrics")}
            </h3>
            <div className="space-y-3.5 p-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">{t("fields.trustFlow")}</span>
                <Badge variant="destructive" className="text-white">
                  {metrics.trustFlow}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">{t("fields.citationFlow")}</span>
                <span className="text-sm font-medium">
                  {metrics.citationFlow}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">{t("fields.tfcfRatio")}</span>
                <span className="text-sm font-medium">{metrics.tfcfRatio}</span>
              </div>
            </div>
          </div>

          {/* Reference Metrics */}
          <div className="space-y-3 border border-gray-200 rounded-md p-3">
            <h3 className="text-sm font-semibold text-muted-foreground">
              {t("sections.referenceMetrics")}
            </h3>
            <div className="space-y-3.5 p-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">{t("fields.refDomains")}</span>
                <span className="text-sm font-medium">
                  {formatNumber(metrics.refDomains)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">{t("fields.refIPs")}</span>
                <span className="text-sm font-medium">
                  {formatNumber(metrics.refIPs)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">{t("fields.refSubNets")}</span>
                <span className="text-sm font-medium">
                  {formatNumber(metrics.refSubNets)}
                </span>
              </div>
            </div>
          </div>

          {/* Domain Details */}
          <div className="space-y-3 border border-gray-200 rounded-md p-3">
            <h3 className="text-sm font-semibold text-muted-foreground">
              {t("sections.domainDetails")}
            </h3>
            <div className="space-y-3.5 p-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">{t("fields.title")}</span>
                <span className="text-sm font-medium">{metrics.title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">{t("fields.redirectTo")}</span>
                <span className="text-sm font-medium">
                  {metrics.redirectTo}
                </span>
              </div>
            </div>
          </div>

          {/* Topical TrustFlow */}
          <div className="space-y-3 border border-gray-200 rounded-md p-3">
            <h3 className="text-sm font-semibold text-muted-foreground">
              {t("sections.topicalTrustFlow")}
            </h3>
            <div className="space-y-3.5 p-2">
              {metrics.topicalTrustFlow.map((item, index) => (
                <div key={index} className="space-y-3.5">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">
                      {t("topicalTrustFlow.topic", { index })}
                    </span>
                    <span className="text-sm font-medium">{item.topic}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">
                      {t("topicalTrustFlow.value", { index })}
                    </span>
                    <span className="text-sm font-medium">{item.value}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">
                      {t("topicalTrustFlow.percent", { index })}
                    </span>
                    <span className="text-sm font-medium">{item.percent}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
