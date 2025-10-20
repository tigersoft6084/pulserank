-- CreateTable
CREATE TABLE "public"."api_usage_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "serviceName" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "requestParams" JSONB,
    "responseTime" INTEGER NOT NULL,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "errorMessage" TEXT,
    "cacheHit" BOOLEAN NOT NULL DEFAULT false,
    "majesticIndexItemResUnitsUsed" INTEGER DEFAULT 0,
    "majesticRetrievalResUnitsUsed" INTEGER DEFAULT 0,
    "majesticAnalysisResUnitsUsed" INTEGER DEFAULT 0,
    "dataforseoBalanceUsed" DOUBLE PRECISION DEFAULT 0,
    "semrushApiUnitsUsed" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_usage_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."api_usage_stats" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "serviceName" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalCalls" INTEGER NOT NULL DEFAULT 0,
    "averageResponseTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cacheHits" INTEGER NOT NULL DEFAULT 0,
    "cacheMisses" INTEGER NOT NULL DEFAULT 0,
    "errors" INTEGER NOT NULL DEFAULT 0,
    "totalMajesticIndexItemResUnitsUsed" INTEGER NOT NULL DEFAULT 0,
    "totalMajesticRetrievalResUnitsUsed" INTEGER NOT NULL DEFAULT 0,
    "totalMajesticAnalysisResUnitsUsed" INTEGER NOT NULL DEFAULT 0,
    "totalDataforseoBalanceUsed" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalSemrushApiUnitsUsed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "api_usage_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "api_usage_logs_userId_idx" ON "public"."api_usage_logs"("userId");

-- CreateIndex
CREATE INDEX "api_usage_logs_serviceName_idx" ON "public"."api_usage_logs"("serviceName");

-- CreateIndex
CREATE INDEX "api_usage_logs_endpoint_idx" ON "public"."api_usage_logs"("endpoint");

-- CreateIndex
CREATE INDEX "api_usage_logs_createdAt_idx" ON "public"."api_usage_logs"("createdAt");

-- CreateIndex
CREATE INDEX "api_usage_stats_userId_idx" ON "public"."api_usage_stats"("userId");

-- CreateIndex
CREATE INDEX "api_usage_stats_serviceName_idx" ON "public"."api_usage_stats"("serviceName");

-- CreateIndex
CREATE INDEX "api_usage_stats_endpoint_idx" ON "public"."api_usage_stats"("endpoint");

-- CreateIndex
CREATE INDEX "api_usage_stats_date_idx" ON "public"."api_usage_stats"("date");

-- CreateIndex
CREATE UNIQUE INDEX "api_usage_stats_userId_serviceName_endpoint_date_key" ON "public"."api_usage_stats"("userId", "serviceName", "endpoint", "date");

-- AddForeignKey
ALTER TABLE "public"."api_usage_logs" ADD CONSTRAINT "api_usage_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."api_usage_stats" ADD CONSTRAINT "api_usage_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
