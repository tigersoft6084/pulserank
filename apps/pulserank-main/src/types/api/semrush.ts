export interface DomainOverviewData {
  date: string;
  organicTraffic: number;
  organicKeywords: number;
}

export interface DomainOrganicData {
  keyword: string;
  position: number;
  searchVolume: number;
  cpc: number;
  competition: number;
  trends: string;
  url: string;
  traffic: number;
}

export interface DomainOrganicSearchData {
  keyword: string;
  position: number;
  previousPosition: number;
  positionDifference: number;
  searchVolume: number;
  cpc: number;
  url: string;
  traffic: number;
  trafficCost: number;
  competition: number;
  numberOfResults: number;
}

export interface KeywordAnalyticsData {
  keyword: string;
  searchVolume: number;
  cpc: number;
  competition: number;
  numberOfResults: number;
}

export interface DomainCompetitorsData {
  domain: string;
  commonKeywords: number;
  totalKeywords: number;
  traffic: number;
}

export interface DomainRankData {
  domain: string;
  organicKeywords: number;
  organicTraffic: number;
}

export interface SubdomainOrganicData {
  url: string;
  nbKeywords: number;
  volume: number;
  trafficPercent: number;
}
