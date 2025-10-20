import { MajesticClient } from "./majestic";
import { CacheService, CacheOptions } from "../services/cache.service";
import type {
  IndexItemInfo,
  BacklinkDataItem,
  RefDomainItem,
  TopicItem,
  TopPageItem,
  NewLostBacklinkItem,
  AnchorTextData,
  HostedDomainItem,
  MajesticSubscriptionData,
} from "@/types/api/majestic";

export class CachedMajesticClient extends MajesticClient {
  private cacheService: CacheService;

  constructor(cacheService: CacheService) {
    super();
    this.cacheService = cacheService;
  }

  /**
   * Get current subscription data for external use
   */
  async getCurrentSubscriptionData(): Promise<MajesticSubscriptionData | null> {
    return super.getCurrentSubscriptionData();
  }

  async getIndexItemInfo(
    urls: string[],
    dataSource: string = "fresh",
    options: CacheOptions = {}
  ): Promise<IndexItemInfo[]> {
    const cacheKey = this.cacheService.generateCacheKey(
      "majestic.indexItemInfo",
      {
        urls,
        dataSource,
      }
    );

    // Try cache first
    if (!options.forceRefresh) {
      const cached = await this.cacheService.getCachedData(cacheKey, options);
      if (cached) return cached as IndexItemInfo[];
    }

    // Fetch from API
    const startTime = Date.now();
    const data = await super.getIndexItemInfo(urls, dataSource);
    const responseTime = Date.now() - startTime;

    // Cache the response
    await this.cacheService.setCachedData(
      cacheKey,
      data,
      "majestic.indexItemInfo",
      { urls, dataSource },
      options
    );

    // Record API call
    await this.cacheService.recordAPICall(
      "majestic.indexItemInfo",
      responseTime,
      options.userId
    );

    return data;
  }

  async getBacklinkData(
    url: string,
    dataSource: string = "fresh",
    mode: number = 0,
    refDomain?: string,
    maxSourceURLsPerRefDomain?: number,
    count: number = 100,
    from: number = 0,
    options: CacheOptions = {}
  ): Promise<BacklinkDataItem[]> {
    const cacheKey = this.cacheService.generateCacheKey(
      "majestic.backlinkData",
      {
        url,
        dataSource,
        mode,
        refDomain,
        maxSourceURLsPerRefDomain,
        count,
        from,
      }
    );

    // Try cache first
    if (!options.forceRefresh) {
      const cached = await this.cacheService.getCachedData(cacheKey, options);
      if (cached) return cached as BacklinkDataItem[];
    }

    // Fetch from API
    const startTime = Date.now();
    const data = await super.getBacklinkData(
      url,
      dataSource,
      mode,
      refDomain,
      maxSourceURLsPerRefDomain,
      count,
      from
    );
    const responseTime = Date.now() - startTime;

    // Cache the response
    await this.cacheService.setCachedData(
      cacheKey,
      data,
      "majestic.backlinkData",
      {
        url,
        dataSource,
        mode,
        refDomain,
        maxSourceURLsPerRefDomain,
        count,
        from,
      },
      options
    );

    // Record API call
    await this.cacheService.recordAPICall(
      "majestic.backlinkData",
      responseTime,
      options.userId
    );

    return data;
  }

  async getBatchBacklinkData(
    urls: string[],
    dataSource: string = "fresh",
    options: CacheOptions = {}
  ): Promise<BacklinkDataItem[]> {
    const cacheKey = this.cacheService.generateCacheKey(
      "majestic.batchBacklinkData",
      {
        urls,
        dataSource,
      }
    );

    // Try cache first
    if (!options.forceRefresh) {
      const cached = await this.cacheService.getCachedData(cacheKey, options);
      if (cached) return cached as BacklinkDataItem[];
    }

    // Fetch from API
    const startTime = Date.now();
    const data = await super.getBatchBacklinkData(urls, dataSource);
    const responseTime = Date.now() - startTime;

    // Cache the response
    await this.cacheService.setCachedData(
      cacheKey,
      data,
      "majestic.batchBacklinkData",
      { urls, dataSource },
      options
    );

    // Record API call
    await this.cacheService.recordAPICall(
      "majestic.batchBacklinkData",
      responseTime,
      options.userId
    );

    return data;
  }

  async getRefDomains(
    items: string[],
    dataSource: string = "fresh",
    count: number = 100,
    from: number = 0,
    options: CacheOptions = {}
  ): Promise<RefDomainItem[]> {
    const cacheKey = this.cacheService.generateCacheKey("majestic.refDomains", {
      items,
      dataSource,
      count,
      from,
    });

    // Try cache first
    if (!options.forceRefresh) {
      const cached = await this.cacheService.getCachedData(cacheKey, options);
      if (cached) return cached as RefDomainItem[];
    }

    // Fetch from API
    const startTime = Date.now();
    const data = await super.getRefDomains(items, dataSource, count, from);
    const responseTime = Date.now() - startTime;

    // Cache the response
    await this.cacheService.setCachedData(
      cacheKey,
      data,
      "majestic.refDomains",
      { items, dataSource, count, from },
      options
    );

    // Record API call
    await this.cacheService.recordAPICall(
      "majestic.refDomains",
      responseTime,
      options.userId
    );

    return data;
  }

  async getAnchorText(
    url: string,
    dataSource: string = "fresh",
    count: number = 10,
    options: CacheOptions = {}
  ): Promise<AnchorTextData> {
    const cacheKey = this.cacheService.generateCacheKey("majestic.anchorText", {
      url,
      dataSource,
      count,
    });

    // Try cache first
    if (!options.forceRefresh) {
      const cached = await this.cacheService.getCachedData(cacheKey, options);
      if (cached) return cached as AnchorTextData;
    }

    // Fetch from API
    const startTime = Date.now();
    const data = await super.getAnchorText(url, dataSource, count);
    const responseTime = Date.now() - startTime;

    // Cache the response
    await this.cacheService.setCachedData(
      cacheKey,
      data,
      "majestic.anchorText",
      { url, dataSource, count },
      options
    );

    // Record API call
    await this.cacheService.recordAPICall(
      "majestic.anchorText",
      responseTime,
      options.userId
    );

    return data;
  }

  async getTopics(
    url: string,
    dataSource: string = "fresh",
    count: number = 100,
    options: CacheOptions = {}
  ): Promise<TopicItem[]> {
    const cacheKey = this.cacheService.generateCacheKey("majestic.topics", {
      url,
      dataSource,
      count,
    });

    // Try cache first
    if (!options.forceRefresh) {
      const cached = await this.cacheService.getCachedData(cacheKey, options);
      if (cached) return cached as TopicItem[];
    }

    // Fetch from API
    const startTime = Date.now();
    const data = await super.getTopics(url, dataSource, count);
    const responseTime = Date.now() - startTime;

    // Cache the response
    await this.cacheService.setCachedData(
      cacheKey,
      data,
      "majestic.topics",
      { url, dataSource, count },
      options
    );

    // Record API call
    await this.cacheService.recordAPICall(
      "majestic.topics",
      responseTime,
      options.userId
    );

    return data;
  }

  async getTopPages(
    url: string,
    dataSource: string = "fresh",
    from: number = 0,
    count: number = 100,
    options: CacheOptions = {}
  ): Promise<TopPageItem[]> {
    const cacheKey = this.cacheService.generateCacheKey("majestic.topPages", {
      url,
      dataSource,
      from,
      count,
    });

    // Try cache first
    if (!options.forceRefresh) {
      const cached = await this.cacheService.getCachedData(cacheKey, options);
      if (cached) return cached as TopPageItem[];
    }

    // Fetch from API
    const startTime = Date.now();
    const data = await super.getTopPages(url, dataSource, from, count);
    const responseTime = Date.now() - startTime;

    // Cache the response
    await this.cacheService.setCachedData(
      cacheKey,
      data,
      "majestic.topPages",
      { url, dataSource, from, count },
      options
    );

    // Record API call
    await this.cacheService.recordAPICall(
      "majestic.topPages",
      responseTime,
      options.userId
    );

    return data;
  }

  async getNewLostBacklinks(
    url: string,
    dataSource: string = "fresh",
    mode: number = 1,
    options: CacheOptions = {}
  ): Promise<NewLostBacklinkItem[]> {
    const cacheKey = this.cacheService.generateCacheKey(
      "majestic.newLostBacklinks",
      {
        url,
        dataSource,
        mode,
      }
    );

    // Try cache first
    if (!options.forceRefresh) {
      const cached = await this.cacheService.getCachedData(cacheKey, options);
      if (cached) return cached as NewLostBacklinkItem[];
    }

    // Fetch from API
    const startTime = Date.now();
    const data = await super.getNewLostBacklinks(url, dataSource, mode);
    const responseTime = Date.now() - startTime;

    // Cache the response
    await this.cacheService.setCachedData(
      cacheKey,
      data,
      "majestic.newLostBacklinks",
      { url, dataSource, mode },
      options
    );

    // Record API call
    await this.cacheService.recordAPICall(
      "majestic.newLostBacklinks",
      responseTime,
      options.userId
    );

    return data;
  }

  async getHostedDomains(
    domain: string,
    dataSource: string = "fresh",
    options: CacheOptions = {}
  ): Promise<{
    domainsOnIP: HostedDomainItem[];
    domainsOnSubnet: HostedDomainItem[];
    recommendedIP: string;
    currentIP: string;
  }> {
    const cacheKey = this.cacheService.generateCacheKey(
      "majestic.hostedDomains",
      {
        domain,
        dataSource,
      }
    );

    // Try cache first
    if (!options.forceRefresh) {
      const cached = await this.cacheService.getCachedData(cacheKey, options);
      if (cached)
        return cached as {
          domainsOnIP: HostedDomainItem[];
          domainsOnSubnet: HostedDomainItem[];
          recommendedIP: string;
          currentIP: string;
        };
    }

    // Fetch from API
    const startTime = Date.now();
    const data = await super.getHostedDomains(domain, dataSource);
    const responseTime = Date.now() - startTime;

    // Cache the response
    await this.cacheService.setCachedData(
      cacheKey,
      data,
      "majestic.hostedDomains",
      { domain, dataSource },
      options
    );

    // Record API call
    await this.cacheService.recordAPICall(
      "majestic.hostedDomains",
      responseTime,
      options.userId
    );

    return data;
  }
}
