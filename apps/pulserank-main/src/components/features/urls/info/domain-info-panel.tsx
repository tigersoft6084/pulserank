import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { DomainInfo } from "@/types/urls";
import { useTranslations } from "next-intl";

export function DomainInfoPanel({ domainInfo }: { domainInfo: DomainInfo }) {
  const t = useTranslations("identityCard.infoPanel");

  return (
    <div className="w-full lg:w-1/3 space-y-3.5 border border-gray-200 rounded-md p-3">
      <div className="flex items-center">
        <div className="flex items-center gap-2 w-1/2">
          <Label className="text-muted-foreground">
            {t("referringDomains")}
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 cursor-help text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[480px] space-y-2">
                <p>{t("tooltips.referringDomains")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="text-sm w-1/2">
          {domainInfo.referringDomains.toLocaleString()}
        </div>
      </div>
      <div className="flex items-center">
        <div className="flex items-center gap-2 w-1/2">
          <Label className="text-muted-foreground">{t("referringPages")}</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 cursor-help text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[480px] space-y-2">
                <p>{t("tooltips.referringPages")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="text-sm w-1/2">
          {domainInfo.referringPages.toLocaleString()}
        </div>
      </div>
      <div className="flex items-center">
        <div className="flex items-center gap-2 w-1/2">
          <Label className="text-muted-foreground">{t("ipSubnets")}</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 cursor-help text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[480px] space-y-2">
                <p>{t("tooltips.ipSubnets")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="text-sm w-1/2">{domainInfo.ipSubnets}</div>
      </div>
      <div className="flex items-center">
        <div className="flex items-center gap-2 w-1/2">
          <Label className="text-muted-foreground">{t("eduGovLinks")}</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-4 h-4 cursor-help text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-[480px] space-y-2">
                <p>{t("tooltips.eduGovLinks")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="text-sm w-1/2">
          {domainInfo.eduDomains} | {domainInfo.govDomains}
        </div>
      </div>
      <div className="flex items-center">
        <div className="flex items-center gap-2 w-1/2">
          <Label className="text-muted-foreground">{t("crawlStatus")}</Label>
        </div>
        <div className="text-sm w-1/2">{domainInfo.crawlStatus}</div>
      </div>
      <div className="flex items-center">
        <div className="flex items-center gap-2 w-1/2">
          <Label className="text-muted-foreground">
            {t("lastCrawlResult")}
          </Label>
        </div>
        <div className="text-sm w-1/2">{domainInfo.lastCrawlResult}</div>
      </div>
      <div className="flex items-center">
        <div className="flex items-center gap-2 w-1/2">
          <Label className="text-muted-foreground">{t("lastCrawlDate")}</Label>
        </div>
        <div className="text-sm w-1/2">{domainInfo.lastCrawlDate}</div>
      </div>
    </div>
  );
}
