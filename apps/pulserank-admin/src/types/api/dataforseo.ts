export interface SERPResponse {
  tasks: Array<{
    id: string;
    status_code: number;
    status_message: string;
    result: Array<{
      keyword: string;
      type: string;
      se_domain: string;
      location_code: number;
      language_code: string;
      check_url: string;
      item_types: string[];
      datetime: string;
      items_count: number;
      items: SERPItem[];
    }>;
  }>;
}

export interface SERPItem {
  rank_group: number;
  rank_absolute: number;
  domain: string;
  title: string;
  url: string;
  breadcrumb: string;
  is_image: boolean;
  is_video: boolean;
  is_featured_snippet: boolean;
  is_malicious: boolean;
  description: string;
  pre_snippet: string;
  extended_snippet: string;
  table: Record<string, unknown>;
  featured_title: string;
  featured_snippet: string;
  featured_links: Record<string, unknown>[];
  timestamp: string;
}

export interface SERPChange {
  keyword: string;
  previousRank: number;
  currentRank: number;
  change: number;
  url: string;
  title: string;
}

export interface KeywordMetrics {
  keyword: string;
  search_volume: number;
  cpc: number;
  competition: number;
  trends: TrendData[];
}

export interface TrendData {
  date: string;
  value: number;
}

export interface KeywordOverviewItem {
  keyword: string;
  competition: number;
  cpc: number;
  search_volume: number;
}

export interface RelatedKeywordItem {
  keyword: string;
  competition: number;
  cpc: number;
  search_volume: number;
  serp_info: Record<string, unknown>;
}

export interface DomainTechnologyItem {
  target: string;
  technologies: {
    content: {
      cms: string[];
    };
  };
}

export interface KeywordForSiteItem {
  keyword: string;
  competition: number;
  search_volume: number;
  cpc: number;
}

export interface SERPTask {
  id: string;
  status_code: number;
  status_message: string;
}

export interface SERPResult {
  keyword: string;
  type: string;
  se_domain: string;
  location_code: number;
  language_code: string;
  check_url: string;
  datetime: string;
  items_count: number;
  items: Record<string, unknown>[];
}
