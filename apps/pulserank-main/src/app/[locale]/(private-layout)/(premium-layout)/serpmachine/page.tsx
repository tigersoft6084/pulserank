"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  useGetSERPResults,
  useGetKeywordMetrics,
} from "@/hooks/features/serp/use-serp";
import { useGetAvailableDates } from "@/hooks/features/serp/use-available-dates";
import { useCreateUserHistory } from "@/hooks/features/user-histories/use-user-histories";
import {
  PeriodSelector,
  getHistoricalDate,
} from "@/components/features/campaigns/shared/period-selector";
import {
  KeywordSummary,
  SERPTable,
  CompareView,
} from "@/components/features/serp";

export default function SERPMachinePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get keyword from URL params (when coming from dashboard)
  const keyword = searchParams.get("keyword") || "";
  const [period, setPeriod] = useState("7d");
  const [customDateFrom, setCustomDateFrom] = useState<Date>();
  const [customDateTo, setCustomDateTo] = useState<Date>();
  const [selectedUrl, setSelectedUrl] = useState<string>();

  const { mutate: createHistory } = useCreateUserHistory();

  // Create user history when keyword is available
  useEffect(() => {
    if (keyword) {
      createHistory({
        description: "Viewed SERP machine",
        item: keyword,
        cost: 0,
      });
    }
  }, [keyword, createHistory]);

  // Determine which dates to use based on period
  const getDateRange = () => {
    if (period === "custom" && customDateFrom && customDateTo) {
      // Custom mode with two dates: first date on left, second date on right
      return {
        leftDate: customDateFrom.toISOString().split("T")[0],
        rightDate: customDateTo.toISOString().split("T")[0],
        isCustomRange: true,
      };
    } else {
      // Standard mode: historical date on left, today on right
      const historicalDate = getHistoricalDate(period, customDateFrom);
      return {
        leftDate: historicalDate,
        rightDate: undefined, // undefined means today
        isCustomRange: false,
      };
    }
  };

  const { leftDate, rightDate, isCustomRange } = getDateRange();

  // Get left SERP results (historical or first custom date)
  const { data: leftSERPResults, isLoading: fetchingLeftSERP } =
    useGetSERPResults(keyword, leftDate);

  // Get right SERP results (today or second custom date)
  const { data: rightSERPResults, isLoading: fetchingRightSERP } =
    useGetSERPResults(keyword, rightDate);

  // Get keyword metrics
  const { data: keywordMetrics, isLoading: fetchingMetrics } =
    useGetKeywordMetrics(keyword);

  // Get available dates for custom date selection
  const { data: availableDatesData } = useGetAvailableDates(keyword);

  // Calculate differences between left and right results
  const calculateDifferences = () => {
    if (!leftSERPResults || !rightSERPResults) return {};

    const differences: Record<string, number> = {};

    // Create maps for quick lookup
    const leftMap = new Map(
      leftSERPResults.map((item) => [item.url, item.rank]),
    );
    const rightMap = new Map(
      rightSERPResults.map((item) => [item.url, item.rank]),
    );

    // Calculate differences for URLs that appear in both
    for (const [url, leftRank] of leftMap) {
      const rightRank = rightMap.get(url);
      if (rightRank) {
        differences[url] = leftRank - rightRank; // Positive = moved up, Negative = moved down
      }
    }

    return differences;
  };

  const differences = calculateDifferences();

  const handleSeeSERP = () => {
    if (keyword) {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(keyword)}`;
      window.open(searchUrl, "_blank");
    }
  };

  const handleSeeBacklinksTimeline = () => {
    if (keyword) {
      router.push(
        `/positions/serp_backlinks?keyword=${encodeURIComponent(keyword)}`,
      );
    }
  };

  const handleSeeCompetition = () => {
    if (keyword) {
      router.push(
        `/positions/competition?keyword=${encodeURIComponent(keyword)}`,
      );
    }
  };

  const handleAddToCampaign = () => {
    if (keyword) {
      router.push(`/campaigns/keywords?keyword=${encodeURIComponent(keyword)}`);
    }
  };

  // Calculate days difference for the compare card
  const getDaysDifference = () => {
    if (isCustomRange && customDateFrom && customDateTo) {
      return Math.round(
        (customDateTo.getTime() - customDateFrom.getTime()) /
          (1000 * 60 * 60 * 24),
      );
    } else if (leftDate) {
      // Normalize both dates to midnight to avoid time-of-day differences
      const today = new Date();
      const todayMidnight = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
      );
      const historical = new Date(leftDate);
      const historicalMidnight = new Date(
        historical.getFullYear(),
        historical.getMonth(),
        historical.getDate(),
      );
      return Math.round(
        (todayMidnight.getTime() - historicalMidnight.getTime()) /
          (1000 * 60 * 60 * 24),
      );
    }
    return 7;
  };

  const daysDifference = getDaysDifference();

  // Get display titles for the tables
  const getLeftTableTitle = () => {
    if (isCustomRange && customDateFrom) {
      return `SERP (${customDateFrom.toLocaleDateString()})`;
    } else if (leftDate) {
      return `Historical SERP (${new Date(leftDate).toLocaleDateString()})`;
    }
    return "Historical SERP";
  };

  const getRightTableTitle = () => {
    if (isCustomRange && customDateTo) {
      return `SERP (${customDateTo.toLocaleDateString()})`;
    }
    return "Current SERP";
  };

  return (
    <div className="space-y-6">
      {/* Keyword Summary Section */}
      {keyword && (
        <KeywordSummary
          keyword={keyword}
          metrics={keywordMetrics}
          isLoading={fetchingMetrics}
          onSeeSERP={handleSeeSERP}
          onSeeBacklinksTimeline={handleSeeBacklinksTimeline}
          onSeeCompetition={handleSeeCompetition}
          onAddToCampaign={handleAddToCampaign}
        />
      )}

      {/* Time Selector */}
      <div className="flex items-center gap-4">
        <PeriodSelector
          period={period}
          onPeriodChange={setPeriod}
          customDateFrom={customDateFrom}
          customDateTo={customDateTo}
          onCustomDateFromChange={setCustomDateFrom}
          onCustomDateToChange={setCustomDateTo}
          availableDates={availableDatesData?.availableDates || []}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left SERP Table */}
        <div className="lg:col-span-2">
          <SERPTable
            title={getLeftTableTitle()}
            results={leftSERPResults}
            isLoading={fetchingLeftSERP}
            differences={differences}
            emptyMessage={
              !keyword
                ? "Enter a keyword to see data"
                : "No SERP data found for the selected date."
            }
            isLeftTable={true}
            otherResults={rightSERPResults || []}
            onRowHover={(url) => setSelectedUrl(url)}
          />
        </div>

        {/* Compare View Card - Sticky */}
        <div className="lg:col-span-1">
          <CompareView
            daysDifference={daysDifference}
            currentResults={rightSERPResults}
            historicalResults={leftSERPResults}
            differences={differences}
            selectedUrl={selectedUrl}
            onUrlSelect={setSelectedUrl}
          />
        </div>

        {/* Right SERP Table */}
        <div className="lg:col-span-2">
          <SERPTable
            title={getRightTableTitle()}
            results={rightSERPResults}
            isLoading={fetchingRightSERP}
            differences={differences}
            emptyMessage={
              !keyword
                ? "Enter a keyword to see data"
                : "No SERP data found for the selected date."
            }
            isLeftTable={false}
            otherResults={leftSERPResults || []}
            onRowHover={(url) => setSelectedUrl(url)}
          />
        </div>
      </div>
    </div>
  );
}
