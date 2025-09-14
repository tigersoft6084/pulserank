import { CachedMajesticClient } from "@/lib/api/cached-majestic";
import { CachedDataForSEOClient } from "@/lib/api/cached-dataforseo";
import { CacheService } from "@/lib/services/cache.service";
import { prisma } from "@repo/db";
import { getDomainIP } from "@/lib/utils/dns-utils";

interface TrackingSiteWithUser {
  id: string;
  url: string;
  type: string;
  email_alert: boolean;
  user_id: string;
  user: {
    id: string;
    email: string;
  };
}

export class BacklinksCollectionService {
  private majestic: CachedMajesticClient;
  private dataForSEO: CachedDataForSEOClient;
  private cacheService: CacheService;

  constructor() {
    this.cacheService = new CacheService();
    this.majestic = new CachedMajesticClient(this.cacheService);
    this.dataForSEO = new CachedDataForSEOClient(this.cacheService);
  }

  async collectBacklinksForWatchlist() {
    console.log("Starting automated backlinks collection for watchlist...");

    try {
      // Get all tracking sites from all users
      const trackingSites = await prisma.trackingSite.findMany({
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

      console.log(`Found ${trackingSites.length} tracking sites to process`);

      const results = {
        totalSites: trackingSites.length,
        processedSites: 0,
        totalNewBacklinks: 0,
        errors: [] as string[],
        details: [] as Array<{
          site: string;
          newBacklinks: number;
          error?: string;
        }>,
      };

      for (const trackingSite of trackingSites) {
        try {
          console.log(
            `Processing site: ${trackingSite.url} for user: ${trackingSite.user.email}`
          );

          const newBacklinksCount =
            await this.processSiteBacklinks(trackingSite);

          results.processedSites++;
          results.totalNewBacklinks += newBacklinksCount;
          results.details.push({
            site: trackingSite.url,
            newBacklinks: newBacklinksCount,
          });

          console.log(
            `Processed ${trackingSite.url}: ${newBacklinksCount} new backlinks`
          );

          // Add a small delay to avoid overwhelming the API
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } catch (error) {
          const errorMessage = `Error processing ${trackingSite.url}: ${error instanceof Error ? error.message : "Unknown error"}`;
          console.error(errorMessage);
          results.errors.push(errorMessage);
          results.details.push({
            site: trackingSite.url,
            newBacklinks: 0,
            error: errorMessage,
          });
        }
      }

      console.log("Automated backlinks collection completed:", results);
      return results;
    } catch (error) {
      console.error("Error in backlinks collection service:", error);
      throw error;
    }
  }

  private async processSiteBacklinks(trackingSite: TrackingSiteWithUser) {
    const domain = trackingSite.url;

    // Step 1: Get new backlinks from Majestic API
    const backlinksData = await this.majestic.getNewLostBacklinks(
      domain,
      "fresh",
      0, // Mode 0 for new backlinks
      {
        userId: trackingSite.user.id,
      }
    );

    if (backlinksData.length === 0) {
      return 0;
    }

    // Step 2: Get existing backlinks for this domain
    const existingBacklinks = await prisma.backlinkData.findMany({
      where: {
        type: true, // true for new backlinks
        backlink_history: {
          domain: domain,
        },
      },
      select: {
        source_url: true,
      },
    });

    // Create a set of existing domains for faster lookup
    const existingDomains = new Set(
      existingBacklinks.map((backlink: { source_url: string }) => {
        try {
          return new URL(backlink.source_url).hostname;
        } catch {
          return backlink.source_url;
        }
      })
    );

    // Step 3: Filter out backlinks with existing domains and process new ones
    const newBacklinksToProcess = [];

    for (const item of backlinksData) {
      const sourceDomain = new URL(item.SourceURL).hostname;

      // Skip if domain already exists in database
      if (existingDomains.has(sourceDomain)) {
        continue;
      }

      // Get IP address for the source domain
      let ip = "N/A";
      try {
        ip = await getDomainIP(sourceDomain);
      } catch (error) {
        console.error(`Error fetching IP for ${sourceDomain}:`, error);
      }

      // Get CMS data from DataForSEO
      let cms = "Unknown";
      try {
        const techData =
          await this.dataForSEO.getDomainTechnologies(sourceDomain);
        if (
          techData.technologies?.content?.cms &&
          techData.technologies.content.cms.length > 0
        ) {
          cms = techData.technologies.content.cms[0];
        }
      } catch (error) {
        console.error(`Error fetching CMS data for ${sourceDomain}:`, error);
      }

      // Calculate percentage (TF/CF)
      const percentage =
        item.SourceTrustFlow > 0 && item.SourceCitationFlow > 0
          ? Math.round((item.SourceTrustFlow / item.SourceCitationFlow) * 100)
          : 0;

      newBacklinksToProcess.push({
        url: item.SourceURL,
        cms,
        anchor: item.AnchorText,
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
        targetUrl: item.TargetURL,
        ip,
        tf: item.SourceTrustFlow || 0,
        cf: item.SourceCitationFlow || 0,
        percentage,
        foundDate: item.Date || "N/A",
        seen: item.LastSeenDate || "N/A",
        lastCrawl: "N/A",
      });
    }

    // Step 4: Store new backlinks in database if any
    if (newBacklinksToProcess.length > 0) {
      // Create backlink history entry with tracking site
      const backlinkHistory = await prisma.backlinkHistory.create({
        data: {
          domain: domain,
          tracking_site_id: trackingSite.id,
        },
      });

      // Store backlink data
      const backlinkDataToStore = newBacklinksToProcess.map((backlink) => ({
        source_url: backlink.url,
        cms: backlink.cms,
        anchor: backlink.anchor,
        flags: backlink.Flags,
        target_url: backlink.targetUrl,
        ip: backlink.ip,
        trust_flow: backlink.tf,
        citation_flow: backlink.cf,
        found_date: backlink.foundDate,
        seen: backlink.seen,
        last_crawl: backlink.lastCrawl,
        type: true, // true for new backlinks
        backlink_history_id: backlinkHistory.id,
      }));

      try {
        await prisma.backlinkData.createMany({
          data: backlinkDataToStore,
        });
      } catch (error) {
        console.error("Error creating backlink data:", error);
        console.error(
          "Data being inserted:",
          JSON.stringify(backlinkDataToStore[0], null, 2)
        );
        throw error;
      }

      console.log(
        `Stored ${backlinkDataToStore.length} new backlinks for domain ${domain} (user: ${trackingSite.user.email})`
      );

      return newBacklinksToProcess.length;
    }

    return 0;
  }

  async cleanup() {
    // Cleanup any resources if needed
    console.log("Cleaning up backlinks collection service...");
  }
}
