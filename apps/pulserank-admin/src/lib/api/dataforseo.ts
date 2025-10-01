import axios, { AxiosError } from "axios";
import { ExternalAPIError } from "@/lib/error-handler";
import type {
  SERPResponse,
  KeywordMetrics,
  KeywordOverviewItem,
  RelatedKeywordItem,
  DomainTechnologyItem,
  KeywordForSiteItem,
  SERPTask,
  SERPResult,
} from "@/types/api/dataforseo";

export class DataForSEOClient {
  private client;

  constructor() {
    this.client = axios.create({
      baseURL: "https://api.dataforseo.com",
      auth: {
        username: process.env.DATAFORSEO_LOGIN || "",
        password: process.env.DATAFORSEO_PASSWORD || "",
      },
    });
  }

  private handleError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      throw new ExternalAPIError(`DataForSEO API error: ${axiosError.message}`);
    }
    throw new ExternalAPIError("Unknown DataForSEO API error");
  }

  async getSERPData(
    keyword: string,
    location: number = 2840,
    language: string = "en"
  ): Promise<SERPResponse> {
    try {
      const response = await this.client.post(
        "/v3/serp/google/organic/live/advanced",
        [
          {
            keyword,
            location_code: location,
            language_code: language,
            depth: 100,
          },
        ]
      );
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getKeywordMetrics(
    keyword: string,
    locationCode: number = 2840,
    languageCode: string = "en"
  ): Promise<KeywordMetrics> {
    try {
      const response = await this.client.post(
        "/v3/dataforseo_labs/google/keyword_overview/live",
        [
          {
            keywords: [keyword],
            location_code: locationCode,
            language_code: languageCode,
          },
        ]
      );

      const data =
        response.data.tasks?.[0]?.result?.[0]?.items?.[0]?.keyword_info;
      if (!data) {
        throw new ExternalAPIError("No keyword metrics data found");
      }

      return {
        keyword: data.keyword,
        search_volume: data.search_volume,
        cpc: data.cpc,
        competition: data.competition,
        trends: [], // Will be populated by getTrends
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async getTrends(
    keyword: string,
    dateFrom: string,
    dateTo: string
  ): Promise<KeywordMetrics["trends"]> {
    try {
      const response = await this.client.post(
        "/v3/keywords_data/google_trends/live",
        {
          keywords: [keyword],
          date_from: dateFrom,
          date_to: dateTo,
        }
      );

      const data = response.data.tasks?.[0]?.result?.[0];
      if (!data) {
        throw new ExternalAPIError("No trends data found");
      }

      return data.trends.map((trend: { date: string; value: number }) => ({
        date: trend.date,
        value: trend.value,
      }));
    } catch (error) {
      this.handleError(error);
    }
  }

  async getOnPageData(url: string): Promise<{
    title: string;
    titleHistory: { date: string; title: string }[];
    indexedPages: number;
  }> {
    try {
      const response = await this.client.post("/v3/on_page/task_post", {
        url,
      });

      const data = response.data.tasks?.[0]?.result?.[0];
      if (!data) {
        throw new ExternalAPIError("No on-page data found");
      }

      return {
        title: data.title,
        titleHistory: data.title_history,
        indexedPages: data.indexed_pages,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async getDomainKeywordPositions(domain: string): Promise<
    {
      keyword: string;
      position: number;
      searchVolume: number;
      cpc: number;
      competition: number;
    }[]
  > {
    try {
      const response = await this.client.post(
        "/v3/domain_analytics/ranked_keywords/live",
        {
          target: domain,
          location_code: 2840, // US
          language_code: "en",
          limit: 1000, // Adjust as needed
        }
      );

      const data = response.data.tasks?.[0]?.result?.[0]?.items;
      if (!data) {
        throw new ExternalAPIError("No keyword positions data found");
      }

      return data.map((item: Record<string, unknown>) => ({
        keyword: item.keyword as string,
        position: item.rank_group as number,
        searchVolume: item.search_volume as number,
        cpc: item.cpc as number,
        competition: item.competition as number,
      }));
    } catch (error) {
      this.handleError(error);
    }
  }

  // New methods based on the research diagram

  async getKeywordOverview(
    keywords: string[],
    locationCode: number = 2840,
    languageCode: string = "en"
  ): Promise<KeywordOverviewItem[]> {
    try {
      const response = await this.client.post(
        "/v3/dataforseo_labs/google/keyword_overview/live",
        [
          {
            keywords,
            location_code: locationCode,
            language_code: languageCode,
          },
        ]
      );

      const data = response.data.tasks?.[0]?.result?.[0]
        ?.items as KeywordOverviewItem[];
      if (!data) {
        throw new ExternalAPIError("No keyword overview data found");
      }

      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getRelatedKeywords(
    keyword: string,
    locationCode: number = 2840,
    languageCode: string = "en",
    filters?: Record<string, unknown>
  ): Promise<RelatedKeywordItem[]> {
    try {
      const response = await this.client.post(
        "/v3/dataforseo_labs/google/related_keywords/live",
        [
          {
            keyword,
            location_code: locationCode,
            language_code: languageCode,
            filters,
          },
        ]
      );

      const data = response.data.tasks?.[0]?.result?.[0]
        ?.items as RelatedKeywordItem[];
      if (!data) {
        throw new ExternalAPIError("No related keywords data found");
      }

      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getDomainTechnologies(target: string): Promise<DomainTechnologyItem> {
    try {
      const response = await this.client.post(
        "/v3/domain_analytics/technologies/domain_technologies/live",
        [
          {
            target,
          },
        ]
      );

      const data = response.data.tasks?.[0]
        ?.result?.[0] as DomainTechnologyItem;
      if (!data) {
        throw new ExternalAPIError("No domain technologies data found");
      }

      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getKeywordsForSite(
    target: string,
    locationCode: number = 2840,
    languageCode: string = "en"
  ): Promise<KeywordForSiteItem[]> {
    try {
      const response = await this.client.post(
        "/v3/keywords_data/google_ads/keywords_for_site/live",
        [
          {
            target,
            location_code: locationCode,
            language_code: languageCode,
          },
        ]
      );

      const data = response.data.tasks?.[0]?.result as KeywordForSiteItem[];
      if (!data) {
        throw new ExternalAPIError("No keywords for site data found");
      }

      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // SERP Task methods for async processing
  async postSERPTask(
    keywords: string[],
    locationCode: number = 2840,
    languageCode: string = "en"
  ): Promise<string[]> {
    try {
      const response = await this.client.post(
        "/v3/serp/google/organic/task_post",
        keywords.map((keyword) => ({
          keyword,
          location_code: locationCode,
          language_code: languageCode,
        }))
      );

      const taskIds = response.data.tasks?.map((task: SERPTask) => task.id);
      if (!taskIds) {
        throw new ExternalAPIError("No task IDs returned");
      }

      return taskIds;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getSERPTasksReady(): Promise<string[]> {
    try {
      const response = await this.client.get(
        "/v3/serp/google/organic/tasks_ready"
      );

      const taskIds = response.data.tasks?.map((task: SERPTask) => task.id);
      if (!taskIds) {
        throw new ExternalAPIError("No ready task IDs found");
      }

      return taskIds;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getSERPResults(taskId: string): Promise<SERPResult> {
    try {
      const response = await this.client.get(
        `/v3/serp/google/organic/task_get/advanced/${taskId}`
      );

      const data = response.data.tasks?.[0]?.result?.[0] as SERPResult;
      if (!data) {
        throw new ExternalAPIError("No SERP results found");
      }

      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getGoogleTrends(
    keywords: string[],
    locationCode: number = 2840,
    languageCode: string = "en",
    dateFrom?: string,
    dateTo?: string
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
    try {
      // Calculate date range for last 4 years if not provided
      const toDate = dateTo || new Date().toISOString().split("T")[0];
      const fromDate =
        dateFrom ||
        new Date(Date.now() - 4 * 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0];

      const response = await this.client.post(
        "/v3/keywords_data/google_trends/explore/live",
        [
          {
            keywords,
            location_code: locationCode,
            language_code: languageCode,
            date_from: fromDate,
            date_to: toDate,
          },
        ]
      );

      const data = response.data.tasks?.[0]?.result?.[0];
      if (!data) {
        throw new ExternalAPIError("No Google Trends data found");
      }

      return data;
    } catch (error) {
      this.handleError(error);
    }
  }
}
