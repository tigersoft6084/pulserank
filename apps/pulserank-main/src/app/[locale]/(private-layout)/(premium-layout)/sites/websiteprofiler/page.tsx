"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  filterValidMultiFormatList,
  MultiFormatValidationResult,
} from "@/lib/utils/url-utils";
import {
  useWebsiteProfiler,
  CompactViewItem,
  DetailedViewItem,
  CompetitionViewItem,
  CrawlViewItem,
} from "@/hooks/features/sites/use-website-profiler";
import { WebsiteProfilerCompactView } from "@/components/features/sites/website-profiler/compact-view";
import { WebsiteProfilerDetailedView } from "@/components/features/sites/website-profiler/detailed-view";
import { WebsiteProfilerCompetitionView } from "@/components/features/sites/website-profiler/competition-view";
import { WebsiteProfilerCrawlView } from "@/components/features/sites/website-profiler/crawl-view";

export default function WebsiteProfilerPage() {
  const t = useTranslations("websiteProfiler");

  const [urls, setUrls] = useState("");
  const [category, setCategory] = useState("auto");
  const [datasource, setDatasource] = useState("fresh");
  const [view, setView] = useState<
    "compact" | "detailed" | "competition" | "crawl"
  >("compact");
  const [validationResult, setValidationResult] =
    useState<MultiFormatValidationResult | null>(null);
  const [submittedItems, setSubmittedItems] = useState<
    Array<{
      original: string;
      type: "url" | "site" | "domain";
    }>
  >([]);
  const [submittedParams, setSubmittedParams] = useState<{
    category: string;
    datasource: string;
    view: "compact" | "detailed" | "competition" | "crawl";
  } | null>(null);

  const maxSites = 100;

  const {
    data: profilerData,
    isLoading,
    error,
  } = useWebsiteProfiler({
    urls: submittedItems.map((item) => item.original),
    category: submittedParams?.category || "auto",
    datasource: submittedParams?.datasource || "fresh",
    view: submittedParams?.view || "compact",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Create translation functions for the validator
    const validationTranslations = {
      empty: t("validation.empty"),
      tooMany: (max: number, count: number) =>
        t("validation.tooMany", { max, count }),
      invalidFormat: (line: number, url: string) =>
        t("validation.invalidFormat", { line, url }),
    };

    // Validate the input
    const result = filterValidMultiFormatList(
      urls,
      maxSites,
      validationTranslations
    );
    setValidationResult(result);

    if (result.isValid) {
      // Create nested structure with original items, types, and extracted domains
      const items = result.validItems.map((item, index) => ({
        original: item,
        type: result.itemTypes[index],
      }));

      setSubmittedItems(items);
      setSubmittedParams({
        category,
        datasource,
        view,
      });
    }
  };

  const handleReset = () => {
    setUrls("");
    setCategory("auto");
    setDatasource("fresh");
    setView("compact");
    setValidationResult(null);
    setSubmittedItems([]);
    setSubmittedParams(null);
  };

  const renderResults = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      );
    }

    if (error) {
      return (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            Error loading website profiler data. Please try again.
          </AlertDescription>
        </Alert>
      );
    }

    if (!profilerData || !profilerData.data || profilerData.data.length === 0) {
      return null;
    }

    switch (profilerData.view) {
      case "compact":
        return (
          <WebsiteProfilerCompactView
            data={profilerData.data as CompactViewItem[]}
            submittedItems={submittedItems}
          />
        );
      case "detailed":
        return (
          <WebsiteProfilerDetailedView
            data={profilerData.data as DetailedViewItem[]}
            submittedItems={submittedItems}
          />
        );
      case "competition":
        return (
          <WebsiteProfilerCompetitionView
            data={profilerData.data as CompetitionViewItem[]}
            submittedItems={submittedItems}
          />
        );
      case "crawl":
        return (
          <WebsiteProfilerCrawlView
            data={profilerData.data as CrawlViewItem[]}
            submittedItems={submittedItems}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="container pt-4 space-y-6">
      <form className="space-y-4 mx-auto" onSubmit={handleSubmit}>
        <div className="flex gap-4">
          <Label className="pt-2.5 w-20 text-right">{t("form.urls")}</Label>
          <Textarea
            placeholder={t("form.placeholder")}
            className="min-h-[120px]"
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
          />
        </div>

        <div className="flex gap-4">
          <Label className="pt-2.5 w-20 text-right">{t("form.category")}</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">{t("categories.auto")}</SelectItem>
              <SelectItem value="domain">{t("categories.domain")}</SelectItem>
              <SelectItem value="site">{t("categories.site")}</SelectItem>
              <SelectItem value="url">{t("categories.url")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-4">
          <Label className="pt-2.5 w-20 text-right">
            {t("form.datasource")}
          </Label>
          <Select value={datasource} onValueChange={setDatasource}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a datasource" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fresh">{t("datasources.fresh")}</SelectItem>
              <SelectItem value="historic">
                {t("datasources.historic")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-4">
          <Label className="pt-2.5 w-20 text-right">{t("form.view")}</Label>
          <Select
            value={view}
            onValueChange={(
              value: "compact" | "detailed" | "competition" | "crawl"
            ) => setView(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose how to see" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="compact">{t("views.compact")}</SelectItem>
              <SelectItem value="detailed">{t("views.detailed")}</SelectItem>
              <SelectItem value="competition">
                {t("views.competition")}
              </SelectItem>
              <SelectItem value="crawl">{t("views.crawl")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Validation Errors */}
        {validationResult && !validationResult.isValid && (
          <Alert className="border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              <ul className="list-disc list-inside space-y-1">
                {validationResult.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={handleReset}>
            {t("form.reset")}
          </Button>
          <Button type="submit" className="gap-2" disabled={isLoading}>
            {isLoading ? "Loading..." : t("form.submit")}
          </Button>
        </div>
      </form>

      {/* Results */}
      {renderResults()}
    </div>
  );
}
