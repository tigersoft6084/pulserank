import {
  format,
  formatDistanceToNow,
  eachDayOfInterval,
  eachMonthOfInterval,
  eachYearOfInterval,
} from "date-fns";
import { RankingData } from "@/types/campaigns";

export const DATE_GROUPINGS = [
  { label: "By Day", value: "day" },
  { label: "By Month", value: "month" },
  { label: "By Year", value: "year" },
];

export function formatRelativeDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString();
}

// Generate date columns based on grouping
export function generateDateColumns(
  dateFrom: string,
  dateTo: string,
  grouping: string,
) {
  const fromDate = new Date(dateFrom);
  const toDate = new Date(dateTo);
  // Add one day to include the end date
  const inclusiveEndDate = new Date(toDate);
  inclusiveEndDate.setDate(inclusiveEndDate.getDate() + 1);

  switch (grouping) {
    case "day":
      return eachDayOfInterval({
        start: fromDate,
        end: inclusiveEndDate,
      }).map((date) => format(date, "yyyy-MM-dd"));
    case "month":
      return eachMonthOfInterval({
        start: fromDate,
        end: inclusiveEndDate,
      }).map((date) => format(date, "yyyy-MM"));
    case "year":
      return eachYearOfInterval({
        start: fromDate,
        end: inclusiveEndDate,
      }).map((date) => format(date, "yyyy"));
    default:
      return [];
  }
}

// Get ranking value for a specific date
export function getRankingForDate(
  rankings: RankingData["rankings"],
  targetDate: string,
  grouping: string,
) {
  if (grouping === "day") {
    return rankings.find((r) => r.date === targetDate)?.rank ?? null;
  }

  // For month/year, find the best ranking in that period
  const targetPeriod = targetDate;
  const periodRankings = rankings.filter((r) => {
    const rankingDate = r.date;
    if (grouping === "month") {
      return rankingDate.startsWith(targetPeriod);
    } else if (grouping === "year") {
      return rankingDate.startsWith(targetPeriod);
    }
    return false;
  });

  if (periodRankings.length === 0) return null;

  return periodRankings.reduce(
    (best, current) => {
      if (current.rank !== null && (best === null || current.rank < best)) {
        return current.rank;
      }
      return best;
    },
    null as number | null,
  );
}

// Calculate variation (change from previous period)
export function getVariationForDate(
  rankings: RankingData["rankings"],
  targetDate: string,
  grouping: string,
  dateColumns: string[],
) {
  const currentIndex = dateColumns.indexOf(targetDate);
  if (currentIndex <= 0) return null;

  const previousDate = dateColumns[currentIndex - 1];
  const currentRank = getRankingForDate(rankings, targetDate, grouping);
  const previousRank = getRankingForDate(rankings, previousDate, grouping);

  if (currentRank === null || previousRank === null) return null;

  return currentRank - previousRank;
}
