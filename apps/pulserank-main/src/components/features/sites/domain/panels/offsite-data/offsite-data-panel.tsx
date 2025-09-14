import { TTF_COLOR_DATA } from "@/lib/config";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OffsiteData } from "@/types/sites";
import { useTranslations } from "next-intl";

export function DomainOffsiteDataPanel({
  offsiteData,
}: {
  offsiteData: OffsiteData;
}) {
  const t = useTranslations("identityCard.offsiteDataPanel");
  console.log(offsiteData);

  // Use default values when data is missing
  const trustFlow = offsiteData.trustFlow || 0;
  const citationFlow = offsiteData.citationFlow || 0;
  const topicalTrustFlowDetails = offsiteData.topicalTrustFlowDetails || [];

  return (
    <div className="w-full lg:w-1/3 border border-gray-200 rounded-md p-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <div className="flex items-center gap-2">
                <Label>{t("trustFlow")}</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[480px] space-y-2">
                      <p>{t("tooltips.trustFlow")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </TableHead>
            <TableHead>
              <div className="flex items-center gap-2">
                <Label>{t("citationFlow")}</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[480px] space-y-2">
                      <p>{t("tooltips.citationFlow")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>
              <Badge
                className="text-6xl font-bold p-3"
                style={{
                  backgroundColor:
                    topicalTrustFlowDetails.length > 0
                      ? TTF_COLOR_DATA[
                          topicalTrustFlowDetails[0].topic.split(
                            "/",
                          )[0] as keyof typeof TTF_COLOR_DATA
                        ]
                      : TTF_COLOR_DATA["Society"],
                }}
              >
                {trustFlow}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="text-6xl font-bold">{citationFlow}</div>
              <div className="flex items-center gap-1 text-muted-foreground m-1">
                <div className="text-sm">
                  {citationFlow > 0
                    ? Math.round((trustFlow / citationFlow) * 100)
                    : 0}
                  %
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 cursor-help text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[480px] space-y-2">
                      <p>{t("tooltips.citationFlow")}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
      <div className="mt-4">
        <div className="w-full flex items-center">
          <div className="flex items-start gap-2 w-1/2">
            <Label className="text-muted-foreground">
              {t("topicalTrustFlow")}
            </Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="w-4 h-4 cursor-help text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-[480px] space-y-2">
                  <p>{t("tooltips.topicalTrustFlow")}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="w-1/2 flex flex-wrap gap-2">
            {topicalTrustFlowDetails.length > 0 ? (
              topicalTrustFlowDetails[0].topic
                .split("/")
                .map((topic: string, index: number) => (
                  <div key={index}>
                    <Badge
                      style={{
                        backgroundColor:
                          TTF_COLOR_DATA[
                            topicalTrustFlowDetails[0].topic.split(
                              "/",
                            )[0] as keyof typeof TTF_COLOR_DATA
                          ],
                      }}
                    >
                      {topic}
                    </Badge>
                  </div>
                ))
            ) : (
              <div className="text-muted-foreground text-sm">No data</div>
            )}
          </div>
        </div>
        <div className="w-full h-2 flex rounded-full overflow-hidden mt-2">
          {topicalTrustFlowDetails.length > 0 ? (
            topicalTrustFlowDetails.map(
              (
                detail: {
                  topic: string;
                  percentage: number;
                  trustFlow: number;
                  normalizedPercentage: number;
                },
                index: number,
              ) => (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        style={{
                          width: `${detail.normalizedPercentage}%`,
                          backgroundColor:
                            TTF_COLOR_DATA[
                              detail.topic.split(
                                "/",
                              )[0] as keyof typeof TTF_COLOR_DATA
                            ],
                        }}
                        className="h-full"
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <div className="flex flex-col">
                        <span>{detail.topic}</span>
                        <span className="font-bold">
                          {detail.trustFlow} TF (
                          {detail.normalizedPercentage.toFixed(1)}%)
                        </span>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ),
            )
          ) : (
            <div className="w-full h-full bg-gray-200 rounded-full" />
          )}
        </div>
      </div>
    </div>
  );
}
