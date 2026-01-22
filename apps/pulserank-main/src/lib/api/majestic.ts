import axios from "axios";
import type { AxiosError } from "axios";
import type {
  IndexItemInfo,
  BacklinkDataItem,
  RefDomainItem,
  AnchorTextItem,
  TopicItem,
  TopPageItem,
  NewLostBacklinkItem,
  AnchorTextData,
  HostedDomainItem,
  MajesticSubscriptionData,
} from "@/types/api/majestic";
import { prisma } from "@repo/db";
import { getDomainIP } from "../utils/dns-utils";

export class MajesticClient {
  // private apiKey: string = "";
  private baseUrl: string;
  private lastSubscriptionData: MajesticSubscriptionData | null = null;

  constructor() {
    this.baseUrl = "https://api.majestic.com/api/json";
  }

  private async getApiKey() {
    try {
      const service = await prisma.thirdPartyService.findFirst({
        where: {
          name: "Majestic",
        },
      });
      const config = service?.config as { apiKey?: string };
      return config.apiKey || "";
    } catch (error) {
      console.error("Failed to load Majestic API key from database:", error);
      return "";
    }
  }

  private async request(
    endpoint: string,
    params: Record<string, string | number>
  ) {
    // Ensure API key is initialized before making request

    try {
      const app_api_key = await this.getApiKey();

      const response = await axios.get(`${this.baseUrl}`, {
        params: {
          ...params,
          app_api_key,
          cmd: endpoint,
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        throw new Error(`Majestic API error: ${axiosError.message}`);
      }
      throw error;
    }
  }

  async getIndexItemInfo(
    urls: string[],
    dataSource: string = "fresh"
  ): Promise<IndexItemInfo[]> {
    const params: Record<string, string | number> = {
      datasource: dataSource,
      items: urls.length,
      AddAllTopics: 1,
    };

    urls.forEach((url, index) => {
      params[`item${index}`] = url;
    });

    const majesticData = await this.request("GetIndexItemInfo", params);

    const results = majesticData.DataTables.Results.Data.map(
      (item: IndexItemInfo, index: number) => ({
        URL: urls[index], // Add the original URL
        Title: item.Title,
        ACRank: item.ACRank,
        RefDomains: item.RefDomains,
        RefIPs: item.RefIPs,
        RefSubNets: item.RefSubNets,
        ExtBackLinks: item.ExtBackLinks,
        RefDomainsEDU: item.RefDomainsEDU,
        RefDomainsGOV: item.RefDomainsGOV,
        IndexedURLs: item.IndexedURLs,
        TrustFlow: item.TrustFlow,
        CitationFlow: item.CitationFlow,
        TopicalTrustFlow_Topic_0: item.TopicalTrustFlow_Topic_0,
        TopicalTrustFlow_Value_0: item.TopicalTrustFlow_Value_0,
        TopicalTrustFlow_Topic_1: item.TopicalTrustFlow_Topic_1,
        TopicalTrustFlow_Value_1: item.TopicalTrustFlow_Value_1,
        TopicalTrustFlow_Topic_2: item.TopicalTrustFlow_Topic_2,
        TopicalTrustFlow_Value_2: item.TopicalTrustFlow_Value_2,
        TrustCategories: item.TrustCategories,
        Status: item.Status,
        LastCrawlResult: item.LastCrawlResult,
        LastCrawlDate: item.LastCrawlDate,
        LastSeen: item.LastSeen,
      })
    ) as IndexItemInfo[];

    // Store domain information to database (historical data)
    await this.storeDomainIndexInfo(urls, results);

    return results;
  }

  async getBacklinkData(
    url: string,
    dataSource: string = "fresh",
    mode: number = 0,
    refDomain?: string,
    maxSourceURLsPerRefDomain?: number,
    count: number = 100,
    from: number = 0
  ): Promise<BacklinkDataItem[]> {
    const params: Record<string, string | number> = {
      item: url,
      datasource: dataSource,
      Mode: mode,
      Count: count,
      From: from,
    };

    if (refDomain) {
      params.RefDomain = refDomain;
    }

    if (maxSourceURLsPerRefDomain) {
      params.MaxSourceURLsPerRefDomain = maxSourceURLsPerRefDomain;
    }

    const majesticData = await this.request("GetBackLinkData", params);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return majesticData.DataTables.BackLinks.Data.map((item: any) => ({
      AnchorText: item.AnchorText,
      SourceURL: item.SourceURL,
      DiscoverDate: item.Date,
      TargetURL: item.TargetURL,
      Flags: {
        doFollow: Boolean(!item.FlagNoFollow),
        redirect: Boolean(item.FlagRedirect),
        frame: Boolean(item.FlagFrame),
        noFollow: Boolean(item.FlagNoFollow),
        images: Boolean(item.FlagImages),
        deleted: Boolean(item.FlagDeleted),
        altText: Boolean(item.FlagAltText),
        mention: Boolean(item.FlagMention),
      },
      SourceCitationFlow: item.SourceCitationFlow,
      SourceTrustFlow: item.SourceTrustFlow,
      SourceTopicalTrustFlow_Topic_0: item.SourceTopicalTrustFlow_Topic_0,
      SourceTopicalTrustFlow_Value_0:
        item.SourceTopicalTrustFlow_Value_0 === ""
          ? 0
          : item.SourceTopicalTrustFlow_Value_0,
      FirstIndexedDate: item.FirstIndexedDate,
      LastSeenDate: item.LastSeenDate,
    })) as BacklinkDataItem[];
  }

  async getBatchBacklinkData(
    urls: string[],
    dataSource: string = "fresh"
  ): Promise<BacklinkDataItem[]> {
    // Process URLs in batches to avoid overwhelming the API
    const batchSize = 10;
    const allResults: BacklinkDataItem[] = [];
    const delay = 1000; // 1 second delay between batches

    for (let i = 0; i < urls.length; i += batchSize) {
      const batch = urls.slice(i, i + batchSize);

      // Process batch concurrently
      const batchPromises = batch.map((url) =>
        this.getBacklinkData(
          url,
          dataSource,
          undefined,
          undefined,
          Math.floor(100 / urls.length)
        )
      );

      const batchResults = await Promise.all(batchPromises);

      // Flatten results into single array
      allResults.push(...batchResults.flat());

      // Add delay between batches if not the last batch
      if (i + batchSize < urls.length) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    return allResults;
  }

  async getRefDomains(
    domains: string[],
    dataSource: string = "fresh",
    count: number = 100,
    from: number = 0
  ): Promise<RefDomainItem[]> {
    const params: Record<string, string | number> = {
      datasource: dataSource,
      Count: count,
      From: from,
      // OrderBy1: 11, // 11 is Matched Links
      OrderBy1: domains.length === 1 ? 2 : 11, // 2 is RefDomains
    };

    domains.forEach((domain, index) => {
      params[`item${index}`] = domain;
    });

    const majesticData = await this.request("GetRefDomains", params);

    const results = majesticData.DataTables.Results.Data;

    // Store domain information to database (historical data)
    await this.storeRefDomainsInfo(results);

    return results;
  }

  async getAnchorText(
    url: string,
    dataSource: string = "fresh",
    count: number = 10
  ): Promise<AnchorTextData> {
    const majesticData = await this.request("GetAnchorText", {
      item: url,
      datasource: dataSource,
      Count: count,
    });

    return {
      TotalBacklinks: majesticData.DataTables.AnchorText.Headers.TotalBackLinks,
      TotalRefDomains:
        majesticData.DataTables.AnchorText.Headers.TotalRefDomains,
      anchors: majesticData.DataTables.AnchorText.Data.map(
        (item: AnchorTextItem) => ({
          AnchorText: item.AnchorText,
          RefDomains: item.RefDomains,
          TotalLinks: item.TotalLinks,
          NoFollowLinks: item.NoFollowLinks,
        })
      ) as AnchorTextItem[],
    };
  }

  async getTopics(
    url: string,
    dataSource: string = "fresh",
    count: number = 100
  ): Promise<TopicItem[]> {
    const majesticData = await this.request("GetTopics", {
      item: url,
      datasource: dataSource,
      Count: count,
    });

    return majesticData.DataTables.Topics.Data.map((item: TopicItem) => ({
      Topic: item.Topic,
      RefDomains: item.RefDomains,
    })) as TopicItem[];
  }

  async getTopPages(
    url: string,
    dataSource: string = "fresh",
    from: number = 0,
    count: number = 100
  ): Promise<TopPageItem[]> {
    const majesticData = await this.request("GetTopPages", {
      Query: url,
      datasource: dataSource,
      From: from,
      Count: count,
    });

    return majesticData.DataTables.Matches.Data.map((item: TopPageItem) => ({
      URL: item.URL,
      TrustFlow: item.TrustFlow,
      CitationFlow: item.CitationFlow,
      RefDomains: item.RefDomains,
      RefIPs: item.RefIPs,
      TopicalTrustFlow_Topic_0: item.TopicalTrustFlow_Topic_0,
      LastCrawlResult: item.LastCrawlResult,
      Date: item.Date,
    })) as TopPageItem[];
  }

  async getNewLostBacklinks(
    url: string,
    dataSource: string = "fresh",
    mode: number = 1
  ): Promise<NewLostBacklinkItem[]> {
    const majesticData = await this.request("GetNewLostBackLinks", {
      item: url,
      datasource: dataSource,
      Mode: mode,
    });

    return majesticData.DataTables.BackLinks.Data;
  }

  async getHostedDomains(
    domain: string,
    dataSource: string = "fresh"
  ): Promise<{
    domainsOnIP: HostedDomainItem[];
    domainsOnSubnet: HostedDomainItem[];
    recommendedIP: string;
    currentIP: string;
  }> {
    const majesticData = await this.request("GetHostedDomains", {
      Domain: domain,
      datasource: dataSource,
      MaxDomains: 100,
    });

    return {
      domainsOnIP: majesticData.DataTables.DomainsOnIP.Data,
      domainsOnSubnet: majesticData.DataTables.DomainsOnSubnet.Data,
      recommendedIP: majesticData.RecommendedIP,
      currentIP: majesticData.DataTables.DomainsOnIP.Headers.IP,
    };
  }

  /**
   * Store domain index information to the database (historical data)
   */
  private async storeDomainIndexInfo(urls: string[], results: IndexItemInfo[]) {
    try {
      const createPromises = urls.map(async (url, index) => {
        const result = results[index];
        if (!result) {
          console.log(`No result found for URL: ${url}`);
          return null;
        }

        // Extract domain from URL
        const domain = this.extractDomainFromUrl(url);
        if (!domain) {
          console.log(`Could not extract domain from URL: ${url}`);
          return null;
        }

        // Only process root domain URLs (bare domain name only)
        if (!this.isRootDomain(url)) {
          console.log(`Skipping non-root domain: ${url}`);
          return null;
        }

        try {
          // Check if data for this domain was already fetched today
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Set time to 00:00:00.000

          const existingRecord = await prisma.domainIndexInfo.findFirst({
            where: {
              domain: domain,
              fetched_at: {
                gte: today,
                lt: new Date(today.getTime() + 24 * 60 * 60 * 1000), // Next day
              },
            },
          });

          // Skip if data was already fetched today
          if (existingRecord) {
            console.log(`Skipping ${domain} - data already fetched today`);
            return null;
          }

          // Get IP address using DNS lookup
          const ip = await getDomainIP(domain);

          // Calculate subnet by setting last octet to 0
          const subnet = this.calculateSubnet(ip);

          // Calculate percentage as trust_flow/citation_flow * 100
          const percentage = this.calculatePercentage(
            result.TrustFlow,
            result.CitationFlow
          );

          return prisma.domainIndexInfo.create({
            data: {
              domain,
              ext_backlinks: BigInt(result.ExtBackLinks),
              ref_domains: BigInt(result.RefDomains),
              alexa_rank: result.ACRank.toString(),
              ip: ip,
              subnet: subnet,
              trust_flow: result.TrustFlow,
              citation_flow: result.CitationFlow,
              percentage: percentage,
              topical_trust_flow_topic_0: result.TopicalTrustFlow_Topic_0,
              topical_trust_flow_value_0: result.TopicalTrustFlow_Value_0,
              fetched_at: today, // Set to today at 00:00:00
            },
          });
        } catch (individualError) {
          const errorMessage =
            individualError instanceof Error
              ? individualError.message
              : String(individualError);
          console.error(`Error processing domain ${domain}: ${errorMessage}`);
          return null;
        }
      });

      const validPromises = createPromises.filter(Boolean);
      if (validPromises.length > 0) {
        await Promise.all(validPromises);
      } else {
        console.log("No valid domains to process");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`Error storing domain index info: ${errorMessage}`);
      // Don't throw error to avoid breaking the main functionality
    }
  }
  /**
   * Store reference domains information to the database (historical data)
   */
  private async storeRefDomainsInfo(results: RefDomainItem[]) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set time to 00:00:00.000

      const createPromises = results.map(async (result) => {
        if (!result) return null;

        try {
          // Check if data for this domain was already fetched today
          const existingRecord = await prisma.domainIndexInfo.findFirst({
            where: {
              domain: result.Domain,
              fetched_at: {
                gte: today,
                lt: new Date(today.getTime() + 24 * 60 * 60 * 1000), // Next day
              },
            },
          });

          // Skip if data was already fetched today
          if (existingRecord) {
            console.log(
              `Skipping ${result.Domain} - data already fetched today`
            );
            return null;
          }

          // Calculate percentage as trust_flow/citation_flow * 100
          const percentage = this.calculatePercentage(
            result.TrustFlow,
            result.CitationFlow
          );

          return prisma.domainIndexInfo.create({
            data: {
              domain: result.Domain,
              ext_backlinks: BigInt(result.ExtBackLinks),
              ref_domains: BigInt(result.RefDomains),
              alexa_rank: result.AlexaRank.toString(),
              ip: result.IP,
              subnet: result.SubNet,
              trust_flow: result.TrustFlow,
              citation_flow: result.CitationFlow,
              percentage: percentage,
              topical_trust_flow_topic_0: result.TopicalTrustFlow_Topic_0,
              topical_trust_flow_value_0: result.TopicalTrustFlow_Value_0
                ? typeof result.TopicalTrustFlow_Value_0 === "string"
                  ? parseInt(result.TopicalTrustFlow_Value_0) || 0
                  : result.TopicalTrustFlow_Value_0
                : 0,
              fetched_at: today, // Set to today at 00:00:00
            },
          });
        } catch (individualError) {
          const errorMessage =
            individualError instanceof Error
              ? individualError.message
              : String(individualError);
          console.error(
            `Error processing domain ${result.Domain}: ${errorMessage}`
          );
          return null;
        }
      });

      const validPromises = createPromises.filter(Boolean);
      if (validPromises.length > 0) {
        await Promise.all(validPromises);
      } else {
        console.log("No valid domains to process");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`Error storing ref domains info: ${errorMessage}`);
      // Don't throw error to avoid breaking the main functionality
    }
  }

  /**
   * Calculate percentage as trust_flow/citation_flow * 100
   */
  private calculatePercentage(trustFlow: number, citationFlow: number): number {
    if (citationFlow === 0) return 0;
    return Math.round((trustFlow / citationFlow) * 100);
  }

  /**
   * Calculate subnet from IP address by setting last octet to 0
   */
  private calculateSubnet(ip: string): string {
    if (ip === "N/A" || !ip) return "";

    try {
      const octets = ip.split(".");
      if (octets.length === 4) {
        return `${octets[0]}.${octets[1]}.${octets[2]}.0`;
      }
      return ip;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`Error calculating subnet for IP ${ip}: ${errorMessage}`);
      return ip;
    }
  }

  /**
   * Extract domain from URL
   */
  private extractDomainFromUrl(url: string): string | null {
    try {
      // If it's already a bare domain name, return it as is
      if (!url.includes("://") && !url.includes("/")) {
        return url;
      }

      // Otherwise, parse as URL
      const urlObj = new URL(url.startsWith("http") ? url : `https://${url}`);
      return urlObj.hostname;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`Error extracting domain from URL ${url}: ${errorMessage}`);
      return null;
    }
  }

  /**
   * Check if URL is a root domain (bare domain name only)
   */
  private isRootDomain(url: string): boolean {
    try {
      // Check if it's just a bare domain name (no protocol, no path)
      if (url.includes("://") || url.includes("/")) {
        return false;
      }

      // Check if it's just a root domain (e.g., example.com, not sub.example.com)
      const parts = url.split(".");
      return parts.length === 2;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(
        `Error checking if URL is root domain ${url}: ${errorMessage}`
      );
      return false;
    }
  }

  /**
   * Get subscription information from Majestic API
   */
  async getSubscriptionInfo(dataSource: string = "fresh") {
    const params: Record<string, string | number> = {
      datasource: dataSource,
    };

    const response = await this.request("GetSubscriptionInfo", params);
    return response;
  }

  /**
   * Get current subscription data for external use
   */
  async getCurrentSubscriptionData(): Promise<MajesticSubscriptionData | null> {
    try {
      const subscriptionInfo = await this.getSubscriptionInfo();

      if (subscriptionInfo.Code !== "OK") {
        console.error(
          "Failed to get subscription info:",
          subscriptionInfo.ErrorMessage
        );
        return null;
      }

      return subscriptionInfo.DataTables.Subscriptions.Data[0] || null;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`Error getting subscription data: ${errorMessage}`);
      return null;
    }
  }
}
