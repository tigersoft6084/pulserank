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
import { OffsiteData } from "@/types/urls";
import { useTranslations } from "next-intl";

export function OffsiteDataPanel({
  offsiteData,
}: {
  offsiteData: OffsiteData;
}) {
  const t = useTranslations("identityCard.offsiteDataPanel");

  if (!offsiteData.trustFlow && !offsiteData.citationFlow) return null;

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
                    TTF_COLOR_DATA[
                      offsiteData.topicalTrustFlowDetails[0].topic.split(
                        "/",
                      )[0] as keyof typeof TTF_COLOR_DATA
                    ],
                }}
              >
                {offsiteData.trustFlow}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="text-6xl font-bold">
                {offsiteData.citationFlow}
              </div>
              <div className="flex items-center gap-1 text-muted-foreground m-1">
                <div className="text-sm">
                  {Math.round(
                    (offsiteData.trustFlow / offsiteData.citationFlow) * 100,
                  )}
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
            {offsiteData.topicalTrustFlowDetails[0].topic
              .split("/")
              .map((topic: string, index: number) => (
                <div key={index}>
                  <Badge
                    style={{
                      backgroundColor:
                        TTF_COLOR_DATA[
                          offsiteData.topicalTrustFlowDetails[0].topic.split(
                            "/",
                          )[0] as keyof typeof TTF_COLOR_DATA
                        ],
                    }}
                  >
                    {topic}
                  </Badge>
                </div>
              ))}
          </div>
        </div>
        <div className="w-full h-2 flex rounded-full overflow-hidden mt-2">
          {offsiteData.topicalTrustFlowDetails.map(
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
                        {detail.percentage.toFixed(1)}%
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Trust Flow: {detail.trustFlow}
                      </span>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ),
          )}
        </div>
      </div>
    </div>
  );
}
