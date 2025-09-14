import axios, { AxiosError } from "axios";
import { ExternalAPIError } from "@/lib/utils/error-handler";
import type {
  DomainOverviewData,
  DomainOrganicData,
  DomainOrganicSearchData,
  KeywordAnalyticsData,
  DomainCompetitorsData,
  DomainRankData,
  SubdomainOrganicData,
} from "@/types/api/semrush";
import { prisma } from "@repo/db";

export class SEMrushClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = "https://api.semrush.com";
  }

  private async initializeApiKey() {
    try {
      const service = await prisma.thirdPartyService.findFirst({
        where: {
          name: "SEMRush",
        },
      });

      const config = service?.config as { apiKey?: string };
      return config.apiKey || "";
    } catch (error) {
      console.error("Failed to load SEMrush API key from database:", error);
      return "";
    }
  }

  private handleError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      throw new ExternalAPIError(`SEMrush API error: ${axiosError.message}`);
    }
    throw new ExternalAPIError("Unknown SEMrush API error");
  }

  async getDomainOverview(
    domain: string,
    database: string = "us"
  ): Promise<DomainOverviewData[]> {
    // Ensure API key is initialized before making request

    try {
      const key = await this.initializeApiKey();

      const response = await axios.get(`${this.baseUrl}`, {
        params: {
          type: "domain_rank_history",
          key,
          domain,
          database,
          export_columns: "Ot,Or,Dt",
        },
      });

      const lines = response.data.split("\n");
      const results: DomainOverviewData[] = [];

      // Skip the first line (header) and process the rest
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim()) {
          const [organicTraffic, organicKeywords, date] = line.split(";");
          results.push({
            date: new Date(
              parseInt(date.slice(0, 4)), // year
              parseInt(date.slice(4, 6)) - 1, // month (0-based)
              parseInt(date.slice(6, 8)) // day
            )
              .toISOString()
              .split("T")[0],
            organicTraffic: parseInt(organicTraffic),
            organicKeywords: parseInt(organicKeywords),
          });
        }
      }

      return results;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getDomainOrganic(
    domain: string,
    database: string = "us",
    displayLimit: number = 10
  ): Promise<DomainOrganicData[]> {
    // Ensure API key is initialized before making request

    try {
      const key = await this.initializeApiKey();

      const response = await axios.get(`${this.baseUrl}`, {
        params: {
          type: "domain_organic",
          key,
          domain,
          database,
          display_limit: displayLimit,
          export_columns: "Ph,Po,Ot,Nq,Cp,Co,Td,Ur,Tr",
        },
      });

      const lines = response.data.split("\n");
      const results: DomainOrganicData[] = [];

      // Skip the first line (header) and process the rest
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim()) {
          const [
            keyword,
            position,
            searchVolume,
            cpc,
            competition,
            trends,
            url,
            traffic,
          ] = line.split(";");
          results.push({
            keyword,
            position: parseInt(position),
            searchVolume: parseInt(searchVolume),
            cpc: parseFloat(cpc),
            competition: parseFloat(competition),
            trends,
            url,
            traffic: parseFloat(traffic),
          });
        }
      }

      return results;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getDomainOrganicGross(
    domain: string,
    database: string = "us",
    displayLimit: number = 10,
    displayOffset: number = 0,
    search?: string
  ): Promise<DomainOrganicSearchData[]> {
    // Ensure API key is initialized before making request

    try {
      const key = await this.initializeApiKey();

      const params: Record<string, string | number> = {
        type: "domain_organic",
        key,
        domain,
        database,
        display_limit: displayLimit,
        display_offset: displayOffset,
        export_columns: "Ph,Po,Tr,Tc,Nq,Cp,Co,Nr,Ur",
        display_sort: "tr_desc",
      };

      if (search) {
        params.display_filter = `+|Ph|Co|${search}`;
      }

      const response = await axios.get(`${this.baseUrl}`, { params });

      const lines = response.data.split("\n");
      const results: DomainOrganicSearchData[] = [];

      // Skip the first line (header) and process the rest
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim()) {
          const [
            keyword,
            position,
            traffic,
            trafficCost,
            searchVolume,
            cpc,
            competition,
            numberOfResults,
            url,
          ] = line.split(";");
          results.push({
            keyword,
            position: parseInt(position),
            previousPosition: 0, // Not available in this endpoint
            positionDifference: 0, // Not available in this endpoint
            searchVolume: parseInt(searchVolume),
            cpc: parseFloat(cpc),
            url,
            traffic: parseFloat(traffic),
            trafficCost: parseFloat(trafficCost),
            competition: parseFloat(competition),
            numberOfResults: parseInt(numberOfResults),
          });
        }
      }

      return results;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getDomainOrganicSearch(
    domain: string,
    database: string = "us",
    displayLimit: number = 10
  ): Promise<DomainOrganicSearchData[]> {
    // Ensure API key is initialized before making request

    try {
      const key = await this.initializeApiKey();

      const response = await axios.get(`${this.baseUrl}`, {
        params: {
          type: "domain_organic",
          key,
          domain,
          database,
          display_filter: "+|Ph|Co|seo",
          display_limit: displayLimit,
          export_columns: "Ph,Po,Pp,Pd,Nq,Cp,Ur,Tr,Tc,Co,Nr",
          display_sort: "tr_desc",
        },
      });

      const lines = response.data.split("\n");
      const results: DomainOrganicSearchData[] = [];

      // Skip the first line (header) and process the rest
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim()) {
          const [
            keyword,
            position,
            previousPosition,
            positionDifference,
            searchVolume,
            cpc,
            url,
            traffic,
            trafficCost,
            competition,
            numberOfResults,
          ] = line.split(";");
          results.push({
            keyword,
            position: parseInt(position),
            previousPosition: parseInt(previousPosition),
            positionDifference: parseInt(positionDifference),
            searchVolume: parseInt(searchVolume),
            cpc: parseFloat(cpc),
            url,
            traffic: parseFloat(traffic),
            trafficCost: parseFloat(trafficCost),
            competition: parseFloat(competition),
            numberOfResults: parseInt(numberOfResults),
          });
        }
      }

      return results;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getKeywordAnalytics(
    keyword: string,
    database: string = "us"
  ): Promise<KeywordAnalyticsData> {
    // Ensure API key is initialized before making request

    try {
      const key = await this.initializeApiKey();

      const response = await axios.get(`${this.baseUrl}`, {
        params: {
          type: "phrase_this",
          key,
          phrase: keyword,
          database,
          export_columns: "Ph,Nq,Cp,Co,Nr",
        },
      });

      const lines = response.data.split("\n");
      if (lines.length > 1) {
        const [keyword, searchVolume, cpc, competition, numberOfResults] =
          lines[1].split(";");
        return {
          keyword,
          searchVolume: parseInt(searchVolume),
          cpc: parseFloat(cpc),
          competition: parseFloat(competition),
          numberOfResults: parseInt(numberOfResults),
        };
      }

      throw new ExternalAPIError("No keyword analytics data found");
    } catch (error) {
      this.handleError(error);
    }
  }

  async getKeywordSuggestions(
    keyword: string,
    database: string = "us"
  ): Promise<KeywordAnalyticsData[]> {
    // Ensure API key is initialized before making request

    try {
      const key = await this.initializeApiKey();

      const response = await axios.get(`${this.baseUrl}`, {
        params: {
          type: "phrase_related",
          key,
          phrase: keyword,
          database,
          export_columns: "Ph,Nq,Cp,Co,Nr",
        },
      });

      const lines = response.data.split("\n");
      const results: KeywordAnalyticsData[] = [];

      // Skip the first line (header) and process the rest
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim()) {
          const [keyword, searchVolume, cpc, competition, numberOfResults] =
            line.split(";");
          results.push({
            keyword,
            searchVolume: parseInt(searchVolume),
            cpc: parseFloat(cpc),
            competition: parseFloat(competition),
            numberOfResults: parseInt(numberOfResults),
          });
        }
      }

      return results;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getDomainCompetitors(
    domain: string,
    database: string = "us",
    displayLimit: number = 5
  ): Promise<DomainCompetitorsData[]> {
    // Ensure API key is initialized before making request

    try {
      const key = await this.initializeApiKey();

      const response = await axios.get(`${this.baseUrl}`, {
        params: {
          type: "domain_organic_organic",
          key,
          display_limit: displayLimit,
          export_columns: "Dn,Np,Or,Ot",
          domain,
          database,
        },
      });

      const lines = response.data.split("\n");
      const results: DomainCompetitorsData[] = [];

      // Skip the first line (header) and process the rest
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim()) {
          const [domain, commonKeywords, totalKeywords, traffic] =
            line.split(";");
          results.push({
            domain,
            commonKeywords: parseInt(commonKeywords),
            totalKeywords: parseInt(totalKeywords),
            traffic: parseInt(traffic),
          });
        }
      }

      return results;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getDomainRank(
    domain: string,
    database: string = "us"
  ): Promise<DomainRankData> {
    // Ensure API key is initialized before making request

    try {
      const key = await this.initializeApiKey();

      const response = await axios.get(`${this.baseUrl}`, {
        params: {
          type: "domain_rank",
          key,
          domain,
          database,
          export_columns: "Dn,Or,Ot",
        },
      });

      const lines = response.data.split("\n");
      if (lines.length > 1) {
        const [domain, organicKeywords, organicTraffic] = lines[1].split(";");
        return {
          domain,
          organicKeywords: parseInt(organicKeywords),
          organicTraffic: parseInt(organicTraffic),
        };
      }

      throw new ExternalAPIError("No domain rank data found");
    } catch (error) {
      this.handleError(error);
    }
  }

  async getSubdomainOrganicUnique(
    domain: string,
    database: string = "us",
    displayLimit: number = 10
  ): Promise<SubdomainOrganicData[]> {
    try {
      const key = await this.initializeApiKey();

      const response = await axios.get(`${this.baseUrl}`, {
        params: {
          type: "subdomain_organic_unique",
          key,
          subdomain: domain,
          database,
          display_limit: displayLimit,
          // Note: display_offset is not supported by this endpoint
          export_columns: "Ur,Pc,Tg,Tr",
        },
      });

      const lines = response.data.split("\n");
      const results: SubdomainOrganicData[] = [];

      // Skip the first line (header) and process the rest
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (line.trim()) {
          const [url, nbKeywords, volume, trafficPercent] = line.split(";");
          results.push({
            url,
            nbKeywords: parseInt(nbKeywords),
            volume: parseInt(volume),
            trafficPercent: parseFloat(trafficPercent),
          });
        }
      }

      return results;
    } catch (error) {
      this.handleError(error);
    }
  }
}
