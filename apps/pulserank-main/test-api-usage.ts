/**
 * Test script to verify API usage tracking implementation
 * This script tests the enhanced CacheService and ApiUsageService
 */

import { CacheService } from "./src/lib/services/cache.service";
import { ApiUsageService } from "./src/lib/services/api-usage.service";

async function testApiUsageTracking() {
  console.log("🧪 Testing API Usage Tracking Implementation...\n");

  try {
    const cacheService = CacheService.getInstance();
    const apiUsageService = ApiUsageService.getInstance();

    // Test 1: Record a sample API call with credit tracking
    console.log("1. Testing API call recording with credit tracking...");

    await cacheService.recordAPICall(
      "majestic.indexItemInfo",
      150, // responseTime in ms
      "test-user-123", // userId
      true, // success
      undefined, // errorMessage
      false, // cacheHit
      { urls: ["example.com"], dataSource: "fresh" }, // requestParams
      {
        majestic: {
          indexItemResUnits: 1,
          retrievalResUnits: 0,
          analysisResUnits: 0,
        },
      } // creditData
    );

    console.log("✅ API call recorded successfully");

    // Test 2: Record a DataForSEO API call
    console.log("\n2. Testing DataForSEO API call recording...");

    await cacheService.recordAPICall(
      "dataforseo.serpData",
      200,
      "test-user-123",
      true,
      undefined,
      false,
      { keyword: "test keyword", location: 2840, language: "en" },
      {
        dataforseo: {
          balanceUsed: 0.01,
        },
      }
    );

    console.log("✅ DataForSEO API call recorded successfully");

    // Test 3: Record a Semrush API call
    console.log("\n3. Testing Semrush API call recording...");

    await cacheService.recordAPICall(
      "semrush.domainOverview",
      180,
      "test-user-123",
      true,
      undefined,
      false,
      { domain: "example.com", database: "us" },
      {
        semrush: {
          apiUnitsUsed: 1,
        },
      }
    );

    console.log("✅ Semrush API call recorded successfully");

    // Test 4: Get usage statistics
    console.log("\n4. Testing usage statistics retrieval...");

    const timeRange = ApiUsageService.parseTimeframe("7d");
    const serviceStats = await apiUsageService.getServiceUsageStats(timeRange);
    const userStats = await apiUsageService.getUserUsageStats(timeRange);
    const summary = await apiUsageService.getUsageSummary(timeRange);

    console.log("📊 Service Stats:", serviceStats.length, "services found");
    console.log("👥 User Stats:", userStats.length, "users found");
    console.log("📈 Summary:", {
      totalCalls: summary.totalCalls,
      totalCreditsUsed: summary.totalCreditsUsed,
      totalCost: summary.totalCost,
      totalUsers: summary.totalUsers,
    });

    console.log(
      "\n✅ All tests passed! API usage tracking is working correctly."
    );
  } catch (error) {
    console.error("❌ Test failed:", error);
    throw error;
  } finally {
    // Clean up
    const cacheService = CacheService.getInstance();
    await cacheService.disconnect();

    const apiUsageService = ApiUsageService.getInstance();
    await apiUsageService.disconnect();
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testApiUsageTracking()
    .then(() => {
      console.log("\n🎉 Test completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n💥 Test failed:", error);
      process.exit(1);
    });
}

export { testApiUsageTracking };
