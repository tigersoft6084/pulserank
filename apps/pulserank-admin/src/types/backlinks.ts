export interface BacklinkInCommon {
  Domain: string;
  RefDomains: number;
  TrustFlow: number;
  TopicalTrustFlow_Topic_0: string;
  TopicalTrustFlow_Value_0: number;
  CitationFlow: number;
  AlexaRank: number;
  Matches: number;
  Backlinks_Counts: number[];
}

export interface BacklinkInCommonDetail {
  URL: string;
  Anchor: string;
  Type: boolean[];
  TF: number;
  CF: number;
  LastSeen: string;
  Theme: [string, number];
}

export interface TopBacklink {
  SourceURL: string;
  AnchorText: string;
  TargetURL: string;
  Flag: boolean[];
  LastSeenDate: string;
  SourceTrustFlow: number;
  SourceTopicalTrustFlow_Topic_0: string;
  SourceTopicalTrustFlow_Value_0: number;
  Domain: string;
}

export interface LatestBacklink {
  SourceURL: string;
  Anchor: string;
  TargetURL: string;
  Type: boolean[];
  TF: number;
  CF: number;
  Theme: [string, number];
  Discovered: string;
}

export interface WebsiteInterlink {
  URL: string;
  LinksFromOther: number;
  IP: string;
  RefDomains: number;
  BackLinks: number;
  RefIPs: number;
  TF: number;
  CF: number;
  Theme: [string, number];
  details: WebsiteInterlinkDetail[];
}

export interface WebsiteInterlinkDetail {
  Source: string;
  Target: string;
  Anchor: string;
  Type: boolean[];
  TF: number;
  CF: number;
  LastCrawl: string;
  Theme: [string, number];
}

export interface SameIPDomain {
  domain: string;
  ip: string;
  refDomains: number;
  backLinks: number;
  trustFlow: number;
  citationFlow: number;
  percentage: number;
  theme: string;
  themeValue: number;
  type: "same-ip" | "same-subnet";
}

export interface SameIPCheckerResponse {
  data: SameIPDomain[];
  originalDomain: SameIPDomain;
  totalFound: number;
  searchType: string;
  dataSource: string;
  summary: {
    sameIP: number;
    sameSubnet: number;
    total: number;
  };
  ipInfo: {
    currentIP: string;
    recommendedIP: string;
    hasDifferentIPs: boolean;
  };
}
