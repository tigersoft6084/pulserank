import { BacklinkFlags } from "../backlinks";

export interface MajesticConfig {
  apiKey: string;
}

export interface BacklinkHistoryItem {
  SourceURL: string;
  TargetURL: string;
  AnchorText: string;
  FirstSeen: string;
  LastSeen: string;
  TrustFlow: number;
  CitationFlow: number;
  Thematic: string;
  LinkType: string;
}

export interface NewLostBacklinkItem {
  SourceURL: string;
  Date: string;
  AnchorText: string;
  FlagRedirect: boolean;
  FlagFrame: boolean;
  FlagNoFollow: boolean;
  FlagImages: boolean;
  FlagDeleted: boolean;
  FlagAltText: boolean;
  FlagMention: boolean;
  TargetURL: string;
  LastSeenDate: string;
  DateLost: string;
  ReasonLost: string;
  SourceTrustFlow: number;
  SourceCitationFlow: number;
}

export interface IndexItemInfo {
  URL: string;
  Title: string;
  ACRank: number;
  RefDomains: number;
  RefIPs: number;
  RefSubNets: number;
  ExtBackLinks: number;
  RefDomainsEDU: number;
  RefDomainsGOV: number;
  IndexedURLs: number;
  TrustFlow: number;
  CitationFlow: number;
  TopicalTrustFlow_Topic_0: string;
  TopicalTrustFlow_Value_0: number;
  TopicalTrustFlow_Topic_1: string;
  TopicalTrustFlow_Value_1: number;
  TopicalTrustFlow_Topic_2: string;
  TopicalTrustFlow_Value_2: number;
  TrustCategories?: string;
  Status: string;
  LastCrawlResult: string;
  LastCrawlDate: string;
  LastSeen: string;
}

export interface BacklinkDataItem {
  AnchorText: string;
  SourceURL: string;
  TargetURL: string;
  Flags: BacklinkFlags;
  SourceCitationFlow: number;
  SourceTrustFlow: number;
  SourceTopicalTrustFlow_Topic_0: string;
  SourceTopicalTrustFlow_Value_0: number | string;
  FirstIndexedDate: string;
  LastSeenDate: string;
}

export interface RefDomainItem {
  Position: number;
  Domain: string;
  MatchedLinks: number;
  RefDomains: number;
  ExtBackLinks: number;
  AlexaRank: number;
  Matches: number;
  IP: string;
  SubNet: string;
  CountryCode: string;
  TrustFlow: number;
  CitationFlow: number;
  TopicalTrustFlow_Topic_0: string;
  TopicalTrustFlow_Value_0: number | string;
  LastSuccessfulCrawl: string;
  [key: string]: number | string;
}

export interface AnchorTextItem {
  AnchorText: string;
  RefDomains: number;
  TotalLinks: number;
  NoFollowLinks: number;
}

export interface AnchorTextData {
  TotalBacklinks: number;
  TotalRefDomains: number;
  anchors: AnchorTextItem[];
}

export interface TopicItem {
  Topic: string;
  RefDomains: number;
  isGroup?: boolean;
}

export interface TopPageItem {
  URL: string;
  TrustFlow: number;
  CitationFlow: number;
  RefDomains: number;
  RefIPs: number;
  TopicalTrustFlow_Topic_0: string;
  Keywords: number;
  LastCrawlResult: string;
  Date: string;
}

export interface HostedDomainItem {
  Domain: string;
  IPAddress: string;
  RefDomains: number;
  ExtBackLinks: number;
  CitationFlow: number;
  TrustFlow: number;
  TopicalTrustFlow_Topic_0: string;
  TopicalTrustFlow_Value_0: number;
}

export interface HostedDomainsHeaders {
  IP: string;
  MaxRefDomainTopics: number;
  RefDomainTopicsCount: number;
  TotalDomains: number;
  TotalExtBackLinks: number;
  TotalRefDomains: number;
}

export interface MajesticSubscriptionData {
  Starts: string;
  Expires: string;
  IndexItemInfoResUnits: number;
  RetrievalResUnits: number;
  AnalysisResUnits: number;
  AdvancedReportsRemaining: number;
  StandardReportsRemaining: number;
  StandardReportBacklinksShown: number;
  DetailedReportsPerPeriodRemaining: number;
}

export interface MajesticCreditUsage {
  timestamp: string;
  subscriptionData: MajesticSubscriptionData;
  changes?: {
    IndexItemInfoResUnits?: number;
    RetrievalResUnits?: number;
    AnalysisResUnits?: number;
    AdvancedReportsRemaining?: number;
    StandardReportsRemaining?: number;
    DetailedReportsPerPeriodRemaining?: number;
  };
}
