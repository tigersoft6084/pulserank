import { useMemo } from "react";
import { RankingData } from "@/types/campaigns";
import { CampaignDetail } from "@/types/campaigns";

// Filter rankings based on tags
export function useFilteredRankings(
  rankings: RankingData[] | undefined,
  campaignDetail: CampaignDetail | undefined,
  keywordTag: string,
  siteTag: string,
) {
  return useMemo(() => {
    if (!rankings || !campaignDetail) return rankings;

    return rankings.filter((ranking) => {
      const keyword = campaignDetail.keywords.find(
        (k) => k.keyword === ranking.keyword,
      );
      const site = campaignDetail.sites.find((s) => s.url === ranking.site);

      const keywordTagMatch =
        !keywordTag || (keyword && keyword.tags.includes(keywordTag));
      const siteTagMatch = !siteTag || (site && site.tags.includes(siteTag));

      return keywordTagMatch && siteTagMatch;
    });
  }, [rankings, campaignDetail, keywordTag, siteTag]);
}

// Group rankings by site
export function groupBySite(rankings: RankingData[]) {
  const grouped: Record<string, RankingData[]> = {};
  rankings.forEach((ranking) => {
    if (!grouped[ranking.site]) {
      grouped[ranking.site] = [];
    }
    grouped[ranking.site].push(ranking);
  });
  return grouped;
}

// Group rankings by keyword
export function groupByKeyword(rankings: RankingData[]) {
  const grouped: Record<string, RankingData[]> = {};
  rankings.forEach((ranking) => {
    if (!grouped[ranking.keyword]) {
      grouped[ranking.keyword] = [];
    }
    grouped[ranking.keyword].push(ranking);
  });
  return grouped;
}

// Calculate best URL for each ranking
export function getBestUrl(rankings: RankingData["rankings"]) {
  const bestRanking = rankings.reduce(
    (best, current) => {
      if (
        current.rank !== null &&
        (best.rank === null || current.rank < best.rank)
      ) {
        return current;
      }
      return best;
    },
    { date: "", rank: null as number | null, url: null as string | null },
  );
  return bestRanking.url;
}

// Group ranking data by best URL
export function groupByBestUrl(rankings: RankingData[]) {
  const grouped: Record<string, RankingData[]> = {};

  rankings.forEach((ranking) => {
    const bestUrl = getBestUrl(ranking.rankings);
    if (bestUrl) {
      if (!grouped[bestUrl]) {
        grouped[bestUrl] = [];
      }
      grouped[bestUrl].push(ranking);
    }
  });

  return grouped;
}
