"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { filterValidUrls, type ValidationResult } from "@/lib/utils/url-utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCompareSites } from "@/hooks/features/sites/use-sites";
import { SiteCompareTable } from "@/components/features/sites/site-compare-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function ComparePage() {
  const t = useTranslations("sitesCompare");
  const [urls, setUrls] = useState("");
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
  const [submittedUrls, setSubmittedUrls] = useState<string[]>([]);
  const maxSites = 10;

  const {
    data: compareData,
    isLoading: fetchingCompareData,
    error,
  } = useCompareSites(submittedUrls);

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
    const result = filterValidUrls(urls, maxSites, validationTranslations);
    setValidationResult(result);

    if (result.isValid) {
      // Extract domains from URLs and set them for the query
      const extractedDomains = result.validUrls.map((url) => {
        // Remove protocol and path, keep only domain
        return url.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
      });
      setSubmittedUrls(extractedDomains);
    }
  };

  return (
    <div className="space-y-6">
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <Textarea
          id="urls"
          value={urls}
          onChange={(e) => setUrls(e.target.value)}
          placeholder={t("form.placeholder")}
          className="min-h-[120px]"
        />
        <div className="flex items-center gap-3 self-end">
          <span className="text-muted-foreground text-sm">
            {t("form.maxSites", { max: maxSites })}
          </span>
          <Button type="submit" disabled={fetchingCompareData}>
            {fetchingCompareData ? "Validating..." : t("form.submit")}
          </Button>
        </div>
      </form>

      {/* Validation Results */}
      {validationResult && !validationResult.isValid && (
        <Alert className="border-red-200 bg-red-50 mt-4">
          <AlertDescription className="text-red-800">
            <ul className="list-disc list-inside space-y-1">
              {validationResult.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Results Table */}
      {submittedUrls.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("cardTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            {fetchingCompareData ? (
              <div className="space-y-2">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="flex space-x-4">
                    <Skeleton className="h-4 w-[150px]" />
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-4 w-[100px]" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  {t("errorLoading")}
                </AlertDescription>
              </Alert>
            ) : compareData &&
              compareData.data &&
              compareData.data.length > 0 ? (
              <SiteCompareTable
                data={compareData.data}
                urls={compareData.urls}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {t("noData")}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
