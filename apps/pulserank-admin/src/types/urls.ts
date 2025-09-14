import { AnchorTextItem } from "./api/majestic";

export interface UrlInfo {
  offsiteData: OffsiteData;
  domainInfo: DomainInfo;
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

export interface DomainInfo {
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

export interface ReferringDomain {
  Domain: string;
  MatchedLinks: number;
  RefDomains: number;
  AlexaRank: string;
  IP: string;
  CountryCode: string;
  TLD: string;
  TrustFlow: number;
  CitationFlow: number;
  TopicalTrustFlow_Topic_0: string;
  TopicalTrustFlow_Value_0: number;
  LastCrawl: string;
}
