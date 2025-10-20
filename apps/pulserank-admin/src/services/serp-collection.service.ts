import { prisma } from "@repo/db";
import { CachedDataForSEOClient } from "@/lib/api/cached-dataforseo";
import { CacheService } from "@/services/cache.service";
import { KeywordWithHistory } from "@/types/campaigns";
import { SERPItem } from "@/types/api/dataforseo";
import { BASE_DATA } from "@/lib/config";
import { NextResponse } from "next/server";

export class SERPCollectionService {
  private dataForSEO: CachedDataForSEOClient;
  private cacheService: CacheService;

  constructor() {
    this.cacheService = CacheService.getInstance();
    this.dataForSEO = new CachedDataForSEOClient(this.cacheService);
  }

  /**
   * Collect SERP data for keywords that need updating based on their frequency
   */
  async collectSERPDataForKeywords() {
    try {
      console.log("Starting SERP data collection for keywords...");

      // Get all keywords that need SERP data collection
      const keywordsToUpdate = await this.getKeywordsNeedingUpdate();

      if (keywordsToUpdate.length === 0) {
        console.log("No keywords need SERP data collection");
        return { processed: 0, success: 0, errors: 0 };
      }

      console.log(`Found ${keywordsToUpdate.length} keywords to update`);

      let successCount = 0;
      let errorCount = 0;

      // Process keywords in batches to avoid overwhelming the API
      const batchSize = 5;
      for (let i = 0; i < keywordsToUpdate.length; i += batchSize) {
        const batch = keywordsToUpdate.slice(i, i + batchSize);

        // Process batch concurrently
        const batchPromises = batch.map((keyword) =>
          this.collectSERPDataForKeyword(keyword)
        );
        const batchResults = await Promise.allSettled(batchPromises);

        // Count results
        batchResults.forEach((result) => {
          if (result.status === "fulfilled") {
            successCount++;
          } else {
            errorCount++;
            console.error("Error collecting SERP data:", result.reason);
          }
        });

        // Add delay between batches to respect rate limits
        if (i + batchSize < keywordsToUpdate.length) {
          await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 second delay
        }
      }

      console.log(
        `SERP data collection completed: ${successCount} success, ${errorCount} errors`
      );
      return {
        processed: keywordsToUpdate.length,
        success: successCount,
        errors: errorCount,
      };
    } catch (error) {
      console.error("Error in SERP data collection:", error);
      throw error;
    }
  }

  /**
   * Get keywords that need SERP data collection based on their frequency
   */
  private async getKeywordsNeedingUpdate() {
    const now = new Date();

    // Get keywords with their latest history entry
    const keywords = await prisma.keyword.findMany({
      include: {
        history: {
          orderBy: {
            date: "desc",
          },
          take: 1,
        },
      },
    });

    return keywords.filter((keyword) => {
      // If no history exists, collect data
      if (keyword.history.length === 0) {
        return true;
      }

      const lastCollection = keyword.history[0].date;
      const daysSinceLastCollection = Math.floor(
        (now.getTime() - lastCollection.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Collect data if enough days have passed based on frequency
      return daysSinceLastCollection >= keyword.frequency;
    });
  }

  /**
   * Collect SERP data for a specific keyword
   */
  private async collectSERPDataForKeyword(keyword: any) {
    try {
      console.log(`Collecting SERP data for keyword: ${keyword.keyword}`);

      // Get SERP data from DataForSEO
      const serpResponse = await this.dataForSEO.getSERPData(
        keyword.keyword,
        this.getLocationCode(keyword.base),
        this.getLanguageCode(keyword.base)
      );
      if (!serpResponse.tasks?.[0]?.result?.[0]) {
        return NextResponse.json(
          { message: "No SERP data returned for keyword" },
          { status: 400 }
        );
      }

      const serpData = serpResponse.tasks[0].result[0];

      // Get keyword metrics
      const metrics = await this.dataForSEO.getKeywordMetrics(
        keyword.keyword,
        this.getLocationCode(keyword.base),
        this.getLanguageCode(keyword.base)
      );

      // Get existing properties and merge with new item_types
      const existingProperties = keyword.properties || [];
      const newItemTypes = serpData.item_types || [];

      // Merge existing properties with new item_types, removing duplicates
      const mergedProperties = [
        ...new Set([...existingProperties, ...newItemTypes]),
      ];

      // Update keyword with metrics and merged properties
      await prisma.keyword.update({
        where: { id: keyword.id },
        data: {
          search_volume: metrics.search_volume || 0,
          cpc: metrics.cpc || 0,
          competition: metrics.competition || 0,
          interest: 0, // Will be populated by trends if needed
          properties: mergedProperties,
        },
      });

      // Create SERP history entry
      const historyEntry = await prisma.sERPMachineHistory.create({
        data: {
          keyword_id: keyword.id,
          date: new Date(),
          location_code: serpData.location_code,
          language_code: serpData.language_code,
          check_url: serpData.check_url,
          item_types: serpData.item_types,
        },
      });

      // Store SERP data (top 100 results)
      if (serpData.items && Array.isArray(serpData.items)) {
        const serpDataEntries = serpData.items
          .slice(0, 100)
          .map((item: SERPItem, index: number) => ({
            serp_machine_history_id: historyEntry.id,
            url: item.url || "",
            rank: index + 1,
            title: item.title || "",
            description: item.description || "",
          }));

        if (serpDataEntries.length > 0) {
          await prisma.sERPData.createMany({
            data: serpDataEntries,
          });
        }
      }

      console.log(
        `Successfully collected SERP data for keyword: ${keyword.keyword}`
      );
      return { keyword: keyword.keyword, success: true };
    } catch (error) {
      console.error(
        `Error collecting SERP data for keyword ${keyword.keyword}:`,
        error
      );
      throw error;
    }
  }

  private getLocationCode(base: string): number {
    return (
      BASE_DATA[base as keyof typeof BASE_DATA]?.location_code ||
      BASE_DATA.custom.location_code
    );
  }

  private getLanguageCode(base: string): string {
    return (
      BASE_DATA[base as keyof typeof BASE_DATA]?.language_code ||
      BASE_DATA.custom.language_code
    );
  }

  async cleanup() {
    await prisma.$disconnect();
  }
}
