export interface BacklinkFlags {
  doFollow: boolean;
  redirect: boolean;
  frame: boolean;
  noFollow: boolean;
  images: boolean;
  deleted: boolean;
  altText: boolean;
  mention: boolean;
}

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
  Flags: BacklinkFlags;
  TF: number;
  CF: number;
  LastSeen: string;
  Theme: [string, number];
}

export interface TopBacklink {
  SourceURL: string;
  AnchorText: string;
  TargetURL: string;
  Flags: BacklinkFlags;
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
  Flags: BacklinkFlags;
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
  Flags: BacklinkFlags;
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

export interface DomainTopBacklink {
  SourceURL: string;
  AnchorText: string;
  Flags: BacklinkFlags;
  LastSeenDate: string;
  SourceTopicalTrustFlow_Topic_0: string;
  SourceTopicalTrustFlow_Value_0: number;
  keywordsCount: number;
  googleIndexed: boolean | null;
  lastIndexationCheck: string | null;
  indexedURL: string | null;
}
