import { SEMrushClient } from "./semrush";
import { CacheService, CacheOptions } from "../services/cache.service";
import type {
  DomainOverviewData,
  DomainOrganicData,
  DomainOrganicSearchData,
  KeywordAnalyticsData,
  DomainCompetitorsData,
  DomainRankData,
  SubdomainOrganicData,
} from "@/types/api/semrush";

export class CachedSEMrushClient extends SEMrushClient {
  private cacheService: CacheService;

  constructor(cacheService: CacheService) {
    super();
    this.cacheService = cacheService;
  }

  async getDomainOverview(
    domain: string,
    database: string = "us",
    options: CacheOptions = {}
  ): Promise<DomainOverviewData[]> {
    const cacheKey = this.cacheService.generateCacheKey(
      "semrush.domainOverview",
      {
        domain,
        database,
      }
    );

    // Try cache first
    if (!options.forceRefresh) {
      const cached = await this.cacheService.getCachedData(cacheKey, options);
      if (cached) return cached as DomainOverviewData[];
    }

    // Fetch from API
    const startTime = Date.now();
    const data = await super.getDomainOverview(domain, database);
    const responseTime = Date.now() - startTime;

    // Cache the response
    await this.cacheService.setCachedData(
      cacheKey,
      data,
      "semrush.domainOverview",
      { domain, database },
      options
    );

    // Record API call with credit tracking
    const creditData = this.estimateSemrushCredits("domainOverview");
    await this.cacheService.recordAPICall(
      "semrush.domainOverview",
      responseTime,
      options.userId,
      true,
      undefined,
      false,
      { domain, database },
      creditData
    );
    return data;
  }

  async getDomainOrganic(
    domain: string,
    database: string = "us",
    displayLimit: number = 10,
    options: CacheOptions = {}
  ): Promise<DomainOrganicData[]> {
    const cacheKey = this.cacheService.generateCacheKey(
      "semrush.domainOrganic",
      {
        domain,
        database,
        displayLimit,
      }
    );

    // Try cache first
    if (!options.forceRefresh) {
      const cached = await this.cacheService.getCachedData(cacheKey, options);
      if (cached) return cached as DomainOrganicData[];
    }

    // Fetch from API
    const startTime = Date.now();
    const data = await super.getDomainOrganic(domain, database, displayLimit);
    const responseTime = Date.now() - startTime;

    // Cache the response
    await this.cacheService.setCachedData(
      cacheKey,
      data,
      "semrush.domainOrganic",
      { domain, database, displayLimit },
      options
    );

    // Record API call with credit tracking
    const creditData = this.estimateSemrushCredits("domainOrganic");
    await this.cacheService.recordAPICall(
      "semrush.domainOrganic",
      responseTime,
      options.userId,
      true,
      undefined,
      false,
      { domain, database, displayLimit },
      creditData
    );

    return data;
  }

  async getDomainOrganicGross(
    domain: string,
    database: string = "us",
    displayLimit: number = 10,
    displayOffset: number = 0,
    search?: string,
    options: CacheOptions = {}
  ): Promise<DomainOrganicSearchData[]> {
    const cacheKey = this.cacheService.generateCacheKey(
      "semrush.domainOrganicGross",
      {
        domain,
        database,
        displayLimit,
        displayOffset,
        search,
      }
    );

    // Try cache first
    if (!options.forceRefresh) {
      const cached = await this.cacheService.getCachedData(cacheKey, options);
      if (cached) return cached as DomainOrganicSearchData[];
    }

    // Fetch from API
    const startTime = Date.now();
    const data = await super.getDomainOrganicGross(
      domain,
      database,
      displayLimit,
      displayOffset,
      search
    );
    const responseTime = Date.now() - startTime;

    // Cache the response
    await this.cacheService.setCachedData(
      cacheKey,
      data,
      "semrush.domainOrganicGross",
      { domain, database, displayLimit, displayOffset, search },
      options
    );

    // Record API call with credit tracking
    const creditData = this.estimateSemrushCredits("domainOrganicGross");
    await this.cacheService.recordAPICall(
      "semrush.domainOrganicGross",
      responseTime,
      options.userId,
      true,
      undefined,
      false,
      { domain, database, displayLimit, displayOffset, search },
      creditData
    );

    return data;
  }

  async getDomainOrganicSearch(
    domain: string,
    database: string = "us",
    displayLimit: number = 10,
    options: CacheOptions = {}
  ): Promise<DomainOrganicSearchData[]> {
    const cacheKey = this.cacheService.generateCacheKey(
      "semrush.domainOrganicSearch",
      {
        domain,
        database,
        displayLimit,
      }
    );

    // Try cache first
    if (!options.forceRefresh) {
      const cached = await this.cacheService.getCachedData(cacheKey, options);
      if (cached) return cached as DomainOrganicSearchData[];
    }

    // Fetch from API
    const startTime = Date.now();
    const data = await super.getDomainOrganicSearch(
      domain,
      database,
      displayLimit
    );
    const responseTime = Date.now() - startTime;

    // Cache the response
    await this.cacheService.setCachedData(
      cacheKey,
      data,
      "semrush.domainOrganicSearch",
      { domain, database, displayLimit },
      options
    );

    // Record API call with credit tracking
    const creditData = this.estimateSemrushCredits("domainOrganicSearch");
    await this.cacheService.recordAPICall(
      "semrush.domainOrganicSearch",
      responseTime,
      options.userId,
      true,
      undefined,
      false,
      { domain, database, displayLimit },
      creditData
    );

    return data;
  }

  async getKeywordAnalytics(
    keyword: string,
    database: string = "us",
    options: CacheOptions = {}
  ): Promise<KeywordAnalyticsData> {
    const cacheKey = this.cacheService.generateCacheKey(
      "semrush.keywordAnalytics",
      {
        keyword,
        database,
      }
    );

    // Try cache first
    if (!options.forceRefresh) {
      const cached = await this.cacheService.getCachedData(cacheKey, options);
      if (cached) return cached as KeywordAnalyticsData;
    }

    // Fetch from API
    const startTime = Date.now();
    const data = await super.getKeywordAnalytics(keyword, database);
    const responseTime = Date.now() - startTime;

    // Cache the response
    await this.cacheService.setCachedData(
      cacheKey,
      data,
      "semrush.keywordAnalytics",
      { keyword, database },
      options
    );

    // Record API call with credit tracking
    const creditData = this.estimateSemrushCredits("keywordAnalytics");
    await this.cacheService.recordAPICall(
      "semrush.keywordAnalytics",
      responseTime,
      options.userId,
      true,
      undefined,
      false,
      { keyword, database },
      creditData
    );

    return data;
  }

  async getKeywordSuggestions(
    keyword: string,
    database: string = "us",
    options: CacheOptions = {}
  ): Promise<KeywordAnalyticsData[]> {
    const cacheKey = this.cacheService.generateCacheKey(
      "semrush.keywordSuggestions",
      {
        keyword,
        database,
      }
    );

    // Try cache first
    if (!options.forceRefresh) {
      const cached = await this.cacheService.getCachedData(cacheKey, options);
      if (cached) return cached as KeywordAnalyticsData[];
    }

    // Fetch from API
    const startTime = Date.now();
    const data = await super.getKeywordSuggestions(keyword, database);
    const responseTime = Date.now() - startTime;

    // Cache the response
    await this.cacheService.setCachedData(
      cacheKey,
      data,
      "semrush.keywordSuggestions",
      { keyword, database },
      options
    );

    // Record API call with credit tracking
    const creditData = this.estimateSemrushCredits("keywordSuggestions");
    await this.cacheService.recordAPICall(
      "semrush.keywordSuggestions",
      responseTime,
      options.userId,
      true,
      undefined,
      false,
      { keyword, database },
      creditData
    );

    return data;
  }

  async getDomainCompetitors(
    domain: string,
    database: string = "us",
    displayLimit: number = 5,
    options: CacheOptions = {}
  ): Promise<DomainCompetitorsData[]> {
    const cacheKey = this.cacheService.generateCacheKey(
      "semrush.domainCompetitors",
      {
        domain,
        database,
        displayLimit,
      }
    );

    // Try cache first
    if (!options.forceRefresh) {
      const cached = await this.cacheService.getCachedData(cacheKey, options);
      if (cached) return cached as DomainCompetitorsData[];
    }

    // Fetch from API
    const startTime = Date.now();
    const data = await super.getDomainCompetitors(
      domain,
      database,
      displayLimit
    );
    const responseTime = Date.now() - startTime;

    // Cache the response
    await this.cacheService.setCachedData(
      cacheKey,
      data,
      "semrush.domainCompetitors",
      { domain, database, displayLimit },
      options
    );

    // Record API call with credit tracking
    const creditData = this.estimateSemrushCredits("domainCompetitors");
    await this.cacheService.recordAPICall(
      "semrush.domainCompetitors",
      responseTime,
      options.userId,
      true,
      undefined,
      false,
      { domain, database, displayLimit },
      creditData
    );

    return data;
  }

  async getDomainRank(
    domain: string,
    database: string = "us",
    options: CacheOptions = {}
  ): Promise<DomainRankData> {
    const cacheKey = this.cacheService.generateCacheKey("semrush.domainRank", {
      domain,
      database,
    });

    // Try cache first
    if (!options.forceRefresh) {
      const cached = await this.cacheService.getCachedData(cacheKey, options);
      if (cached) return cached as DomainRankData;
    }

    // Fetch from API
    const startTime = Date.now();
    const data = await super.getDomainRank(domain, database);
    const responseTime = Date.now() - startTime;

    // Cache the response
    await this.cacheService.setCachedData(
      cacheKey,
      data,
      "semrush.domainRank",
      { domain, database },
      options
    );

    // Record API call with credit tracking
    const creditData = this.estimateSemrushCredits("domainRank");
    await this.cacheService.recordAPICall(
      "semrush.domainRank",
      responseTime,
      options.userId,
      true,
      undefined,
      false,
      { domain, database },
      creditData
    );

    return data;
  }

  async getSubdomainOrganicUnique(
    domain: string,
    database: string = "us",
    displayLimit: number = 10,
    options: CacheOptions = {}
  ): Promise<SubdomainOrganicData[]> {
    const cacheKey = this.cacheService.generateCacheKey(
      "semrush.subdomainOrganicUnique",
      {
        domain,
        database,
        displayLimit,
      }
    );

    // Try cache first
    if (!options.forceRefresh) {
      const cached = await this.cacheService.getCachedData(cacheKey, options);
      if (cached) return cached as SubdomainOrganicData[];
    }

    // Fetch from API
    const startTime = Date.now();
    const data = await super.getSubdomainOrganicUnique(
      domain,
      database,
      displayLimit
    );
    const responseTime = Date.now() - startTime;

    // Cache the response
    await this.cacheService.setCachedData(
      cacheKey,
      data,
      "semrush.subdomainOrganicUnique",
      { domain, database, displayLimit },
      options
    );

    // Record API call with credit tracking
    const creditData = this.estimateSemrushCredits("subdomainOrganicUnique");
    await this.cacheService.recordAPICall(
      "semrush.subdomainOrganicUnique",
      responseTime,
      options.userId,
      true,
      undefined,
      false,
      { domain, database, displayLimit },
      creditData
    );

    return data;
  }

  /**
   * Estimate Semrush credit consumption based on endpoint and parameters
   * Semrush charges based on API units consumed per request
   */
  private estimateSemrushCredits(
    endpoint: string,
    itemCount: number = 1
  ): { semrush: { apiUnitsUsed?: number } } {
    // Based on Semrush API pricing and typical usage patterns
    const creditEstimates: Record<string, number> = {
      domainOverview: 1, // 1 API unit per domain overview
      domainOrganic: 1, // 1 API unit per organic data request
      domainOrganicGross: 1, // 1 API unit per gross organic data
      domainOrganicSearch: 1, // 1 API unit per organic search data
      keywordAnalytics: 1, // 1 API unit per keyword analytics
      keywordSuggestions: 1, // 1 API unit per keyword suggestions
      domainCompetitors: 1, // 1 API unit per competitors data
      domainRank: 1, // 1 API unit per domain rank
      subdomainOrganicUnique: 1, // 1 API unit per subdomain data
    };

    const estimatedUnits = creditEstimates[endpoint] || 1; // Default 1 unit

    return {
      semrush: {
        apiUnitsUsed: estimatedUnits,
      },
    };
  }
}
