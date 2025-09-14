export interface Campaign {
  id: string;
  name: string;
  keywords: string[];
  sites: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CampaignListResponse {
  campaigns: Campaign[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CampaignDetail {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  keywords: KeywordWithHistory[];
  sites: SiteForCampaign[];
  alerts: CampaignAlert[];
}

export interface KeywordWithHistory {
  id: string;
  keyword: string;
  base: string;
  tags: string[];
  frequency: number;
  search_volume: number;
  cpc: number;
  competition: number;
  interest: number;
  properties: string[];
  createdAt: Date;
  updatedAt: Date;
  history: SERPHistory[];
}

export interface SERPHistory {
  id: string;
  date: Date;
  location_code: number;
  language_code: string;
  check_url: string;
  item_types: string[];
  keyword: {
    id: string;
    keyword: string;
    base: string;
    search_volume: number;
    cpc: number;
    competition: number;
    interest: number;
    properties: string[];
  };
  serp_data: SERPData[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SERPData {
  id: string;
  url: string;
  rank: number;
  title: string;
  description: string;
}

export interface SiteForCampaign {
  id: string;
  url: string;
  type: "page" | "subdomain" | "domain";
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CampaignAlert {
  id: string;
  email: string;
  frequency: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RankingData {
  site: string;
  keyword: string;
  base: string;
  cpc: number;
  search_volume: number;
  properties: string[];
  competition: number;
  interest: number;
  rankings: {
    date: string;
    rank: number | null;
    url: string | null;
  }[];
}

export interface KeywordListResponse {
  keywords: KeywordWithHistory[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface SiteListResponse {
  sites: SiteForCampaign[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateKeywordRequest {
  keywords: string[];
  base: string;
  tags?: string[];
  frequency?: number;
}

export interface CreateKeywordResponse {
  created: KeywordWithHistory[];
  skipped: number;
  total: number;
}

export interface CreateSiteRequest {
  sites: Array<{
    url: string;
    type: "page" | "subdomain" | "domain";
  }>;
}

export interface CreateSiteResponse {
  created: SiteForCampaign[];
  skipped: number;
  total: number;
}

export interface CreateAlertRequest {
  email: string;
  frequency: number;
}

export interface CampaignRankingsResponse {
  campaign: {
    id: string;
    name: string;
  };
  site?: {
    id: string;
    url: string;
    type: "page" | "subdomain" | "domain";
  };
  rankings: SERPHistory[];
}
