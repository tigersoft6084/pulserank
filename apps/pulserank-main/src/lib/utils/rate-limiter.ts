interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

export class RateLimiter {
  private store: RateLimitStore = {};
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 60) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  isRateLimited(key: string): boolean {
    const now = Date.now();
    const record = this.store[key];

    if (!record) {
      this.store[key] = {
        count: 1,
        resetTime: now + this.windowMs,
      };
      return false;
    }

    if (now > record.resetTime) {
      this.store[key] = {
        count: 1,
        resetTime: now + this.windowMs,
      };
      return false;
    }

    if (record.count >= this.maxRequests) {
      return true;
    }

    record.count += 1;
    return false;
  }

  getRemainingRequests(key: string): number {
    const record = this.store[key];
    if (!record) return this.maxRequests;
    return Math.max(0, this.maxRequests - record.count);
  }

  getResetTime(key: string): number {
    const record = this.store[key];
    if (!record) return Date.now() + this.windowMs;
    return record.resetTime;
  }
}
