import { AnchorTextItem } from "./api/majestic";

export interface SiteCompareData {
  ACRank: number;
  RefDomains: number;
  ExtBackLinks: number;
  RefIPs: number;
  RefSubNets: number;
  CitationFlow: number;
  TrustFlow: number;
  TopicalTrustFlow_Topic_0: string;
  TopicalTrustFlow_Value_0: number;
}

export interface SiteCompareResponse {
  data: SiteCompareData[];
  urls: string[];
}

export interface DomainExtractorData {
  URL: string;
  TrustFlow: number;
  CitationFlow: number;
  RefDomains: number;
  TopicalTrustFlow_Value_0: number;
  TopicalTrustFlow_Topic_0: string;
  Percentage: number;
  Title: string;
}

export interface DomainExtractorResponse {
  data: DomainExtractorData[];
}

export interface DomainInfo {
  offsiteData: OffsiteData;
  domainInfo: DomainInfoData;
  anchorTextData: AnchorTextData;
}

export interface OffsiteData {
  trustFlow: number;
  citationFlow: number;
  topicalTrustFlowDetails: {
    topic: string;
    percentage: number;
    trustFlow: number;
    normalizedPercentage: number;
  }[];
}

export interface DomainInfoData {
  referringDomains: number;
  referringPages: number;
  ipSubnets: string;
  eduDomains: number;
  govDomains: number;
  crawlStatus: string;
  lastCrawlResult: string;
  lastCrawlDate: string;
}

export interface AnchorTextData {
  anchors: AnchorTextItem[];
  TotalBacklinks: number;
  TotalRefDomains: number;
}

export interface OnsiteData {
  title: string;
  alexaRank: number;
  majesticIndexedPages: number;
  googleGlobalIndex: number;
  cms: string[];
  ipAddress: string;
  whoisLink: string;
}
