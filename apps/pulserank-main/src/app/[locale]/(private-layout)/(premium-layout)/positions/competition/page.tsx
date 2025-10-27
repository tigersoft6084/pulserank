"use client";

import { useState, useCallback } from "react";
import {
  useCompetition,
  useGoogleTrends,
} from "@/hooks/features/positions/use-competition";
import { WebsiteProfilerCompetitionView } from "@/components/features/sites/website-profiler/competition-view";
import { CompetitionViewItem } from "@/hooks/features/sites/use-website-profiler";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { flagMap } from "@/lib/utils/flag-static-map";
import { baseToCountryCode } from "@/lib/utils/flag-utils";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CalendarDays, Link, Search, SendToBack } from "lucide-react";
import { GoogleTrendsChart } from "@/components/features/positions/google-trends-chart";
import { useTranslations } from "next-intl";

export default function PositionsCompetitionPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations("positionsCompetition");
  const keywordFromUrl = searchParams.get("keyword") || "";

  // State
  const [keyword, setKeyword] = useState(keywordFromUrl);
  const [searchEngine, setSearchEngine] = useState("google.com");
  const [submittedKeyword, setSubmittedKeyword] = useState(keywordFromUrl);
  const [commonBacklinksType, setCommonBacklinksType] = useState("URLs");
  const [topBacklinksType, setTopBacklinksType] = useState("URLs");

  // Map search engine to base code
  const searchEngineToBase: Record<string, string> = {
    "google.com": "com_en",
    "google.fr": "fr_fr",
    "google.co.uk": "co_uk_fr",
  };

  // Get flag for current search engine
  const currentBase = searchEngineToBase[searchEngine] || "com_en";
  const countryCode = baseToCountryCode[currentBase] || "US";
  const Flag = flagMap[countryCode];

  // Get flag components for each option
  const USFlag = flagMap[baseToCountryCode["com_en"]];
  const FRFlag = flagMap[baseToCountryCode["fr_fr"]];
  const GBFlag = flagMap[baseToCountryCode["co_uk_fr"]];

  // Query parameters - only when submitted
  const queryParams = submittedKeyword.trim()
    ? {
        keyword: submittedKeyword.trim(),
        base: currentBase,
      }
    : null;

  // Data fetching
  const {
    data: competitionData,
    isLoading: isPending,
    error,
  } = useCompetition(queryParams);

  // Google Trends data fetching
  const {
    data: googleTrendsData,
    isLoading: isTrendsLoading,
    error: trendsError,
  } = useGoogleTrends(queryParams);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (keyword.trim()) {
          setSubmittedKeyword(keyword.trim());
        }
      }
    },
    [keyword]
  );

  const processUrls = (data: CompetitionViewItem[], type: string) => {
    return data
      .map((item) => {
        const url = item.URL;
        if (type === "URLs") {
          // Only full URLs with protocol
          return url.startsWith("http://") || url.startsWith("https://")
            ? url
            : null;
        } else if (type === "Sites") {
          // Extract hostname (with or without www, no protocol, may have subdomain)
          try {
            const { hostname } = new URL(url);
            return hostname;
          } catch {
            return null;
          }
        } else if (type === "Domains") {
          // Extract root domain (no subdomain, no www)
          try {
            const { hostname } = new URL(url);
            // Remove www. if present
            const host = hostname.replace(/^www\./, "");
            // Only keep root domain (last two parts)
            const parts = host.split(".");
            if (parts.length >= 2) {
              return parts.slice(-2).join(".");
            }
            return host;
          } catch {
            return null;
          }
        }
        return null;
      })
      .filter(Boolean)
      .join("\n");
  };

  const handleFindCommonBacklinks = () => {
    if (!competitionData?.data) return;

    const urls = processUrls(competitionData.data, commonBacklinksType);
    const encodedUrls = encodeURIComponent(urls);
    router.push(`/sites/backlinksincommon?urls=${encodedUrls}`);
  };

  const handleFindTopBacklinks = () => {
    if (!competitionData?.data) return;

    const urls = processUrls(competitionData.data, topBacklinksType);
    const encodedUrls = encodeURIComponent(urls);
    router.push(`/sites/list_top_backlinks?urls=${encodedUrls}`);
  };

  const handleBacklinksTimeline = () => {
    if (!submittedKeyword) return;

    const encodedKeyword = encodeURIComponent(submittedKeyword);
    const encodedBase = encodeURIComponent(currentBase);
    router.push(
      `/positions/serp_backlinks?keyword=${encodedKeyword}&base=${encodedBase}`
    );
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <div className="absolute inset-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            placeholder={t("search.placeholder")}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyPress}
            className="max-w-md pl-10"
          />
        </div>
        <Select value={searchEngine} onValueChange={setSearchEngine}>
          <SelectTrigger className="w-[160px]">
            <div className="flex items-center gap-2">
              {Flag ? (
                <Flag title={countryCode} className="w-6 h-4" />
              ) : (
                <span className="w-6 h-4 bg-gray-200 rounded" />
              )}
              <span>{searchEngine}</span>
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="google.com">
              <div className="flex items-center gap-2">
                {USFlag && <USFlag title="US" className="w-4 h-3" />}
                google.com
              </div>
            </SelectItem>
            <SelectItem value="google.fr">
              <div className="flex items-center gap-2">
                {FRFlag && <FRFlag title="FR" className="w-4 h-3" />}
                google.fr
              </div>
            </SelectItem>
            <SelectItem value="google.co.uk">
              <div className="flex items-center gap-2">
                {GBFlag && <GBFlag title="GB" className="w-4 h-3" />}
                google.co.uk
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results */}
      {!submittedKeyword ? (
        <div className="text-center py-8 text-muted-foreground">
          {t("search.enterKeywordMessage")}
        </div>
      ) : isPending ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-red-500">{t("error")}</p>
        </div>
      ) : competitionData?.data ? (
        <div className="space-y-4">
          <div className="flex items-center justify-end">
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={handleFindCommonBacklinks}
                      >
                        <SendToBack className="h-4 w-4" />
                        {t("actions.findCommonBacklinks")}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {t("tooltips.findCommonBacklinks", {
                          type: commonBacklinksType,
                        })}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <span className="text-muted-foreground">{t("for")}</span>
                <Select
                  value={commonBacklinksType}
                  onValueChange={setCommonBacklinksType}
                >
                  <SelectTrigger className="w-[100px]">
                    <span>
                      {t(`filters.${commonBacklinksType.toLowerCase()}`)}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="URLs">{t("filters.urls")}</SelectItem>
                    <SelectItem value="Domains">
                      {t("filters.domains")}
                    </SelectItem>
                    <SelectItem value="Sites">{t("filters.sites")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={handleFindTopBacklinks}
                      >
                        <Link className="h-4 w-4" />
                        {t("actions.findTopBacklinks")}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {t("tooltips.findTopBacklinks", {
                          type: topBacklinksType,
                        })}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <span className="text-muted-foreground">{t("for")}</span>
                <Select
                  value={topBacklinksType}
                  onValueChange={setTopBacklinksType}
                >
                  <SelectTrigger className="w-[100px]">
                    <span>
                      {t(`filters.${topBacklinksType.toLowerCase()}`)}
                    </span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="URLs">{t("filters.urls")}</SelectItem>
                    <SelectItem value="Domains">
                      {t("filters.domains")}
                    </SelectItem>
                    <SelectItem value="Sites">{t("filters.sites")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={handleBacklinksTimeline}
                      >
                        <CalendarDays className="h-4 w-4" />{" "}
                        {t("actions.backlinksTimeline")}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        {t("tooltips.backlinksTimeline", {
                          keyword: submittedKeyword,
                        })}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
          <WebsiteProfilerCompetitionView
            data={competitionData.data}
            submittedItems={competitionData.data.map(
              (item: CompetitionViewItem) => {
                // Extract root domain from URL
                let extractedDomain = item.URL;
                try {
                  if (
                    item.URL.startsWith("http://") ||
                    item.URL.startsWith("https://")
                  ) {
                    const url = new URL(item.URL);
                    extractedDomain = url.hostname;
                  } else {
                    // If no protocol, assume it's already a hostname
                    extractedDomain = item.URL;
                  }
                  // Remove www. if present and get root domain
                  extractedDomain = extractedDomain.replace(/^www\./, "");
                  const parts = extractedDomain.split(".");
                  if (parts.length >= 2) {
                    extractedDomain = parts.slice(-2).join(".");
                  }
                } catch {
                  // Fallback to original if parsing fails
                  extractedDomain = item.URL;
                }

                return {
                  original: item.URL,
                  type: "site",
                  extracted: extractedDomain,
                };
              }
            )}
          />
          <GoogleTrendsChart
            data={googleTrendsData}
            isLoading={isTrendsLoading}
            error={trendsError}
            keyword={submittedKeyword}
          />
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          {t("noData", { keyword: submittedKeyword })}
        </div>
      )}
    </div>
  );
}
