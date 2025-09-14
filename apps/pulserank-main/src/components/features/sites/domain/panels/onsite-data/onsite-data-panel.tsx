import { Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OnsiteData } from "@/types/sites";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";

interface DomainOnsitePanelProps {
  onsiteData: OnsiteData;
}

export function DomainOnsitePanel({ onsiteData }: DomainOnsitePanelProps) {
  const t = useTranslations("identityCard.onsitePanel");

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(0) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(0) + "K";
    }
    return num.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Title Section */}
      <div className="flex gap-2">
        <Label className="text-lg font-bold text-muted-foreground">
          {t("title")}
        </Label>
        <Label className="text-lg font-medium text-foreground">
          {onsiteData.title}
        </Label>
      </div>

      {/* Four Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Title Changes Column */}
        <div className="space-y-3 border border-gray-200 rounded-md p-3">
          <Label className="text-sm font-semibold text-muted-foreground">
            {t("titleChanges")}
          </Label>

          <div className="space-y-3.5 p-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">{t("metrics.archivesAmount")}</span>
              <span className="text-sm font-medium">1</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm">
                {t("metrics.numberOfTitleChanges")}
              </span>
              <span className="text-sm font-medium">0</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm">{t("metrics.firstTitleDate")}</span>
              <span className="text-sm font-medium">
                {t("metrics.noDataAvailable")}
              </span>
            </div>
          </div>

          <Button variant="outline" className="w-full">
            <Network className="h-4 w-4" />
            {t("actions.goToOnsiteChanges")}
          </Button>
        </div>

        {/* Indexed Pages Column */}
        <div className="space-y-3 border border-gray-200 rounded-md p-3">
          <Label className="text-sm font-semibold text-muted-foreground">
            {t("indexedPages")}
          </Label>

          <div className="space-y-3.5 p-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  {t("metrics.googleGlobalIndex")}
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 cursor-help text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[480px] space-y-2">
                      <p>{t("tooltips.googleGlobalIndex")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className="text-sm font-medium">
                {formatNumber(onsiteData.googleGlobalIndex)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  {t("metrics.majesticIndexedPages")}
                </span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 cursor-help text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[480px] space-y-2">
                      <p>{t("tooltips.majesticIndexedPages")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className="text-sm font-medium">
                {formatNumber(onsiteData.majesticIndexedPages)}
              </span>
            </div>
          </div>
        </div>

        {/* Traffic Column */}
        <div className="space-y-3 border border-gray-200 rounded-md p-3">
          <Label className="text-sm font-semibold text-muted-foreground">
            {t("traffic")}
          </Label>

          <div className="space-y-3.5 p-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm">{t("metrics.alexaRank")}</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 cursor-help text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[480px] space-y-2">
                      <p>{t("tooltips.alexaRank")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <span className="text-sm font-medium">
                {onsiteData.alexaRank > 0
                  ? onsiteData.alexaRank.toLocaleString()
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Technologies Used Column */}
        <div className="space-y-3 border border-gray-200 rounded-md p-3">
          <Label className="text-sm font-semibold text-muted-foreground">
            {t("technologiesUsed")}
          </Label>

          <div className="space-y-3.5 p-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">{t("cms")}</span>
              <span className="text-sm font-medium">
                {onsiteData.cms.length > 0 ? onsiteData.cms[0] : "Not Found"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm">{t("ip")}</span>
              <span className="text-sm font-medium">
                {onsiteData.ipAddress !== "N/A" ? onsiteData.ipAddress : "N/A"}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm">{t("actions.whois")}</span>
              <Button
                variant="link"
                asChild
                className="h-auto p-0 text-blue-600 hover:text-blue-800"
              >
                <a
                  href={onsiteData.whoisLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("actions.whois")}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
