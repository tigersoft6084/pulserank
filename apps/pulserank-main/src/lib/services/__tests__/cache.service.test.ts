import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { CacheService } from "../cache.service";

describe("CacheService", () => {
  let cacheService: CacheService;

  beforeEach(() => {
    cacheService = new CacheService();
  });

  afterEach(async () => {
    await cacheService.disconnect();
  });

  it("should generate consistent cache keys", () => {
    const params1 = { url: "example.com", dataSource: "fresh" };
    const params2 = { dataSource: "fresh", url: "example.com" }; // Different order

    const key1 = cacheService.generateCacheKey(
      "majestic.backlinkData",
      params1
    );
    const key2 = cacheService.generateCacheKey(
      "majestic.backlinkData",
      params2
    );

    expect(key1).toBe(key2);
  });

  it("should generate different keys for different parameters", () => {
    const params1 = { url: "example.com", dataSource: "fresh" };
    const params2 = { url: "example.com", dataSource: "historic" };

    const key1 = cacheService.generateCacheKey(
      "majestic.backlinkData",
      params1
    );
    const key2 = cacheService.generateCacheKey(
      "majestic.backlinkData",
      params2
    );

    expect(key1).not.toBe(key2);
  });

  it("should get default TTL for endpoint", () => {
    const ttl = cacheService["getDefaultTTLForEndpoint"](
      "majestic.backlinkData"
    );
    expect(ttl).toBe(24 * 60 * 60); // 24 hours in seconds
  });

  it("should get default TTL for unknown endpoint", () => {
    const ttl = cacheService["getDefaultTTLForEndpoint"]("unknown.endpoint");
    expect(ttl).toBe(24 * 60 * 60); // Default 24 hours
  });
});
