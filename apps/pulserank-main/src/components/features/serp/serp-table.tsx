import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Favicon } from "@/components/ui/favicon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, LayoutGrid, CaseUpper, Link } from "lucide-react";
import { SERPResult } from "@/types/serp";
import { useRouter } from "next/navigation";
import { extractRootDomain } from "@/lib/utils/url-utils";
import { useTranslations } from "next-intl";

interface SERPTableProps {
  title: string;
  results?: SERPResult[];
  isLoading: boolean;
  differences?: Record<string, number>;
  emptyMessage?: string;
  isLeftTable?: boolean; // To determine if this is the left table for "in"/"out" logic
  otherResults?: SERPResult[]; // Results from the other table for comparison
  onRowHover?: (url: string, result: SERPResult) => void; // Callback for hover events
}

export function SERPTable({
  title,
  results,
  isLoading,
  differences = {},
  emptyMessage,
  isLeftTable = false,
  otherResults = [],
  onRowHover,
}: SERPTableProps) {
  const t = useTranslations("serpMachine.serpTable");
  const router = useRouter();

  // Use provided emptyMessage or default translation
  const displayEmptyMessage = emptyMessage || t("noData");

  // Handler functions for action buttons
  const handleViewSite = (url: string) => {
    const rootDomain = extractRootDomain(url);
    if (rootDomain) {
      router.push(`/sites/${encodeURIComponent(rootDomain)}/view`);
    } else {
      console.error("Could not extract root domain from URL:", url);
    }
  };

  const handleGoogleSearch = (url: string) => {
    const searchUrl = `https://www.google.com/search?q=site:${encodeURIComponent(url)}`;
    window.open(searchUrl, "_blank");
  };

  const handleUrlKeywords = (url: string) => {
    router.push(`/urls/keywords?url=${encodeURIComponent(url)}`);
  };

  const handleUrlBacklinks = (url: string) => {
    router.push(`/urls/backlinks?url=${encodeURIComponent(url)}`);
  };
  // Handle missing data gracefully
  if (!results || results.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            {displayEmptyMessage}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Create a map of URLs from the other table for comparison
  const otherUrlsMap = new Map(
    otherResults.map((result) => [result.url, result.rank]),
  );

  // Determine the status for each result
  const getStatusInfo = (result: SERPResult) => {
    const diff = differences[result.url];
    const existsInOther = otherUrlsMap.has(result.url);

    if (diff !== undefined) {
      // URL exists in both tables
      const diffText = diff > 0 ? `+${diff}` : diff === 0 ? "=" : `${diff}`;
      const diffColor =
        diff > 0
          ? "text-green-600"
          : diff === 0
            ? "text-gray-600"
            : "text-red-600";
      return { text: diffText, color: diffColor, type: "diff" as const };
    } else if (!existsInOther) {
      // URL only exists in this table
      if (isLeftTable) {
        return { text: "out", color: "text-red-600", type: "out" as const };
      } else {
        return { text: "in", color: "text-green-600", type: "in" as const };
      }
    }

    return { text: "-", color: "text-gray-400", type: "none" as const };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex space-x-4">
                <Skeleton className="h-4 w-[60px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("columns.rank")}</TableHead>
                <TableHead>{t("columns.url")}</TableHead>
                <TableHead>{t("columns.actions")}</TableHead>
                <TableHead>{t("columns.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result) => {
                const statusInfo = getStatusInfo(result);

                return (
                  <TableRow
                    key={result.rank}
                    className="cursor-pointer hover:bg-gray-50 transition-colors"
                    onMouseEnter={() => onRowHover?.(result.url, result)}
                  >
                    <TableCell className="font-medium">{result.rank}</TableCell>
                    <TableCell className="truncate max-w-[200px]">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-2">
                              <Favicon url={result.url} size={16} />
                              <a
                                href={result.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline truncate"
                              >
                                {result.url}
                              </a>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <span>{result.url}</span>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => handleViewSite(result.url)}
                              >
                                <LayoutGrid className="w-3 h-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t("tooltips.viewSiteDetails")}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => handleGoogleSearch(result.url)}
                              >
                                <ExternalLink className="w-3 h-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t("tooltips.googleSearch")}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => handleUrlKeywords(result.url)}
                              >
                                <CaseUpper className="w-3 h-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t("tooltips.viewUrlKeywords")}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => handleUrlBacklinks(result.url)}
                              >
                                <Link className="w-3 h-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t("tooltips.viewUrlBacklinks")}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusInfo.color}>
                        {statusInfo.text}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
