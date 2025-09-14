import { DataForSEOClient } from "./dataforseo";
import { CacheService, CacheOptions } from "../services/cache.service";
import type {
  SERPResponse,
  KeywordMetrics,
  KeywordOverviewItem,
  RelatedKeywordItem,
  DomainTechnologyItem,
  KeywordForSiteItem,
  SERPResult,
} from "@/types/api/dataforseo";

export class CachedDataForSEOClient extends DataForSEOClient {
  private cacheService: CacheService;

  constructor(cacheService: CacheService) {
    super();
    this.cacheService = cacheService;
  }

  async getSERPData(
    keyword: string,
    location: number = 2840,
    language: string = "en",
    options: CacheOptions = {}
  ): Promise<SERPResponse> {
    const cacheKey = this.cacheService.generateCacheKey("dataforseo.serpData", {
      keyword,
      location,
      language,
    });

    // Try cache first
    if (!options.forceRefresh) {
      const cached = await this.cacheService.getCachedData(cacheKey, options);
      if (cached) return cached as SERPResponse;
    }

    // Fetch from API
    const startTime = Date.now();
    const data = await super.getSERPData(keyword, location, language);
    const responseTime = Date.now() - startTime;

    // Cache the response
    await this.cacheService.setCachedData(
      cacheKey,
      data,
      "dataforseo.serpData",
      { keyword, location, language },
      options
    );

    // Record API call
    await this.cacheService.recordAPICall("dataforseo.serpData", responseTime);

    return data;
  }

  async getKeywordMetrics(
    keyword: string,
    locationCode: number = 2840,
    languageCode: string = "en",
    options: CacheOptions = {}
  ): Promise<KeywordMetrics> {
    const cacheKey = this.cacheService.generateCacheKey(
      "dataforseo.keywordMetrics",
      {
        keyword,
        locationCode,
        languageCode,
      }
    );

    // Try cache first
    if (!options.forceRefresh) {
      const cached = await this.cacheService.getCachedData(cacheKey, options);
      if (cached) return cached as KeywordMetrics;
    }

    // Fetch from API
    const startTime = Date.now();
    const data = await super.getKeywordMetrics(
      keyword,
      locationCode,
      languageCode
    );
    const responseTime = Date.now() - startTime;

    // Cache the response
    await this.cacheService.setCachedData(
      cacheKey,
      data,
      "dataforseo.keywordMetrics",
      { keyword },
      options
    );

    // Record API call
    await this.cacheService.recordAPICall(
      "dataforseo.keywordMetrics",
      responseTime
    );

    return data;
  }

  async getTrends(
    keyword: string,
    dateFrom: string,
    dateTo: string,
    options: CacheOptions = {}
  ): Promise<KeywordMetrics["trends"]> {
    const cacheKey = this.cacheService.generateCacheKey("dataforseo.trends", {
      keyword,
      dateFrom,
      dateTo,
    });

    // Try cache first
    if (!options.forceRefresh) {
      const cached = await this.cacheService.getCachedData(cacheKey, options);
      if (cached) return cached as KeywordMetrics["trends"];
    }

    // Fetch from API
    const startTime = Date.now();
    const data = await super.getTrends(keyword, dateFrom, dateTo);
    const responseTime = Date.now() - startTime;

    // Cache the response
    await this.cacheService.setCachedData(
      cacheKey,
      data,
      "dataforseo.trends",
      { keyword, dateFrom, dateTo },
      options
    );

    // Record API call
    await this.cacheService.recordAPICall("dataforseo.trends", responseTime);

    return data;
  }

  async getOnPageData(
    url: string,
    options: CacheOptions = {}
  ): Promise<{
    title: string;
    titleHistory: { date: string; title: string }[];
    indexedPages: number;
  }> {
    const cacheKey = this.cacheService.generateCacheKey(
      "dataforseo.onPageData",
      {
        url,
      }
    );

    // Try cache first
    if (!options.forceRefresh) {
      const cached = await this.cacheService.getCachedData(cacheKey, options);
      if (cached)
        return cached as {
          title: string;
          titleHistory: { date: string; title: string }[];
          indexedPages: number;
        };
    }

    // Fetch from API
    const startTime = Date.now();
    const data = await super.getOnPageData(url);
    const responseTime = Date.now() - startTime;

    // Cache the response
    await this.cacheService.setCachedData(
      cacheKey,
      data,
      "dataforseo.onPageData",
      { url },
      options
    );

    // Record API call
    await this.cacheService.recordAPICall(
      "dataforseo.onPageData",
      responseTime
    );

    return data;
  }

  async getDomainKeywordPositions(
    domain: string,
    options: CacheOptions = {}
  ): Promise<
    {
      keyword: string;
      position: number;
      searchVolume: number;
      cpc: number;
      competition: number;
    }[]
  > {
    const cacheKey = this.cacheService.generateCacheKey(
      "dataforseo.domainKeywordPositions",
      {
        domain,
      }
    );

    // Try cache first
    if (!options.forceRefresh) {
      const cached = await this.cacheService.getCachedData(cacheKey, options);
      if (cached)
        return cached as {
          keyword: string;
          position: number;
          searchVolume: number;
          cpc: number;
          competition: number;
        }[];
    }

    // Fetch from API
    const startTime = Date.now();
    const data = await super.getDomainKeywordPositions(domain);
    const responseTime = Date.now() - startTime;

    // Cache the response
    await this.cacheService.setCachedData(
      cacheKey,
      data,
      "dataforseo.domainKeywordPositions",
      { domain },
      options
    );

    // Record API call
    await this.cacheService.recordAPICall(
      "dataforseo.domainKeywordPositions",
      responseTime
    );

    return data;
  }

  async getKeywordOverview(
    keywords: string[],
    locationCode: number = 2840,
    languageCode: string = "en",
    options: CacheOptions = {}
  ): Promise<KeywordOverviewItem[]> {
    const cacheKey = this.cacheService.generateCacheKey(
      "dataforseo.keywordOverview",
      {
        keywords,
        locationCode,
        languageCode,
      }
    );

    // Try cache first
    if (!options.forceRefresh) {
      const cached = await this.cacheService.getCachedData(cacheKey, options);
      if (cached) return cached as KeywordOverviewItem[];
    }

    // Fetch from API
    const startTime = Date.now();
    const data = await super.getKeywordOverview(
      keywords,
      locationCode,
      languageCode
    );
    const responseTime = Date.now() - startTime;

    // Cache the response
    await this.cacheService.setCachedData(
      cacheKey,
      data,
      "dataforseo.keywordOverview",
      { keywords, locationCode, languageCode },
      options
    );

    // Record API call
    await this.cacheService.recordAPICall(
      "dataforseo.keywordOverview",
      responseTime
    );

    return data;
  }

  async getRelatedKeywords(
    keyword: string,
    locationCode: number = 2840,
    languageCode: string = "en",
    filters?: Record<string, unknown>,
    options: CacheOptions = {}
  ): Promise<RelatedKeywordItem[]> {
    const cacheKey = this.cacheService.generateCacheKey(
      "dataforseo.relatedKeywords",
      {
        keyword,
        locationCode,
        languageCode,
        filters,
      }
    );

    // Try cache first
    if (!options.forceRefresh) {
      const cached = await this.cacheService.getCachedData(cacheKey, options);
      if (cached) return cached as RelatedKeywordItem[];
    }

    // Fetch from API
    const startTime = Date.now();
    const data = await super.getRelatedKeywords(
      keyword,
      locationCode,
      languageCode,
      filters
    );
    const responseTime = Date.now() - startTime;

    // Cache the response
    await this.cacheService.setCachedData(
      cacheKey,
      data,
      "dataforseo.relatedKeywords",
      { keyword, locationCode, languageCode, filters },
      options
    );

    // Record API call
    await this.cacheService.recordAPICall(
      "dataforseo.relatedKeywords",
      responseTime
    );

    return data;
  }

  async getDomainTechnologies(
    target: string,
    options: CacheOptions = {}
  ): Promise<DomainTechnologyItem> {
    const cacheKey = this.cacheService.generateCacheKey(
      "dataforseo.domainTechnologies",
      {
        target,
      }
    );

    // Try cache first
    if (!options.forceRefresh) {
      const cached = await this.cacheService.getCachedData(cacheKey, options);
      if (cached) return cached as DomainTechnologyItem;
    }

    // Fetch from API
    const startTime = Date.now();
    const data = await super.getDomainTechnologies(target);
    const responseTime = Date.now() - startTime;

    // Cache the response
    await this.cacheService.setCachedData(
      cacheKey,
      data,
      "dataforseo.domainTechnologies",
      { target },
      options
    );

    // Record API call
    await this.cacheService.recordAPICall(
      "dataforseo.domainTechnologies",
      responseTime
    );

    return data;
  }

  async getKeywordsForSite(
    target: string,
    locationCode: number = 2840,
    languageCode: string = "en",
    options: CacheOptions = {}
  ): Promise<KeywordForSiteItem[]> {
    const cacheKey = this.cacheService.generateCacheKey(
      "dataforseo.keywordsForSite",
      {
        target,
        locationCode,
        languageCode,
      }
    );

    // Try cache first
    if (!options.forceRefresh) {
      const cached = await this.cacheService.getCachedData(cacheKey, options);
      if (cached) return cached as KeywordForSiteItem[];
    }

    // Fetch from API
    const startTime = Date.now();
    const data = await super.getKeywordsForSite(
      target,
      locationCode,
      languageCode
    );
    const responseTime = Date.now() - startTime;

    // Cache the response
    await this.cacheService.setCachedData(
      cacheKey,
      data,
      "dataforseo.keywordsForSite",
      { target, locationCode, languageCode },
      options
    );

    // Record API call
    await this.cacheService.recordAPICall(
      "dataforseo.keywordsForSite",
      responseTime
    );

    return data;
  }

  async postSERPTask(
    keywords: string[],
    locationCode: number = 2840,
    languageCode: string = "en"
  ): Promise<string[]> {
    // SERP tasks are not cached as they are one-time operations
    const startTime = Date.now();
    const data = await super.postSERPTask(keywords, locationCode, languageCode);
    const responseTime = Date.now() - startTime;

    // Record API call
    await this.cacheService.recordAPICall(
      "dataforseo.postSERPTask",
      responseTime
    );

    return data;
  }

  async getSERPTasksReady(): Promise<string[]> {
    // Task status checks are not cached as they change frequently
    const startTime = Date.now();
    const data = await super.getSERPTasksReady();
    const responseTime = Date.now() - startTime;

    // Record API call
    await this.cacheService.recordAPICall(
      "dataforseo.getSERPTasksReady",
      responseTime
    );

    return data;
  }

  async getSERPResults(
    taskId: string,
    options: CacheOptions = {}
  ): Promise<SERPResult> {
    const cacheKey = this.cacheService.generateCacheKey(
      "dataforseo.sERPResults",
      {
        taskId,
      }
    );

    // Try cache first
    if (!options.forceRefresh) {
      const cached = await this.cacheService.getCachedData(cacheKey, options);
      if (cached) return cached as SERPResult;
    }

    // Fetch from API
    const startTime = Date.now();
    const data = await super.getSERPResults(taskId);
    const responseTime = Date.now() - startTime;

    // Cache the response
    await this.cacheService.setCachedData(
      cacheKey,
      data,
      "dataforseo.sERPResults",
      { taskId },
      options
    );

    // Record API call
    await this.cacheService.recordAPICall(
      "dataforseo.sERPResults",
      responseTime
    );

    return data;
  }

  async getGoogleTrends(
    keywords: string[],
    locationCode: number = 2840,
    languageCode: string = "en",
    dateFrom?: string,
    dateTo?: string,
    options: CacheOptions = {}
  ): Promise<{
    keywords: string[];
    location_code: number;
    language_code: string;
    items: Array<{
      data: Array<{
        date_from: string;
        date_to: string;
        timestamp: number;
        missing_data: boolean;
        values: number[];
      }>;
    }>;
  }> {
    const cacheKey = this.cacheService.generateCacheKey(
      "dataforseo.googleTrends",
      {
        keywords,
        locationCode,
        languageCode,
        dateFrom,
        dateTo,
      }
    );

    // Try cache first
    if (!options.forceRefresh) {
      const cached = await this.cacheService.getCachedData(cacheKey, options);
      if (cached)
        return cached as {
          keywords: string[];
          location_code: number;
          language_code: string;
          items: Array<{
            data: Array<{
              date_from: string;
              date_to: string;
              timestamp: number;
              missing_data: boolean;
              values: number[];
            }>;
          }>;
        };
    }

    // Fetch from API
    const startTime = Date.now();
    const data = await super.getGoogleTrends(
      keywords,
      locationCode,
      languageCode,
      dateFrom,
      dateTo
    );
    const responseTime = Date.now() - startTime;

    // Cache the response
    await this.cacheService.setCachedData(
      cacheKey,
      data,
      "dataforseo.googleTrends",
      { keywords, locationCode, languageCode, dateFrom, dateTo },
      options
    );

    // Record API call
    await this.cacheService.recordAPICall(
      "dataforseo.googleTrends",
      responseTime
    );

    return data;
  }
}
