-- CreateEnum
CREATE TYPE "public"."SERPBase" AS ENUM ('fr_fr', 'com_en', 'co_uk_fr', 'ca_en', 'ca_fr', 'de_de', 'es_es', 'it_it', 'ch_fr', 'ch_de', 'be_fr', 'be_nl', 'com_mx_s', 'com_br_pt', 'com_ar_s', 'com_tr_tr', 'co_ma_fr', 'se_sv', 'com_au_fr', 'co_il_iw', 'pl_pl', 'cl_e', 'nl_nl', 'lu_de', 'lu_fr', 'sn_fr', 'cm_en', 'co_jp_ja', 'ru_ru', 'co_za_fr', 'at_de', 'com_co_es', 'gr_el', 'co_nz_fr', 'co_in_fr', 'com_hk_zh', 'ie_fr', 'com_sg_fr', 'cz_cs', 'sk_sk', 'lt_lt', 'pt_pt', 'com_my_ms', 'dk_da', 'co_kr_ko', 'fi_fi', 'ge_ka', 'co_id_id', 'no_no', 'ro_ro', 'custom');

-- CreateEnum
CREATE TYPE "public"."SiteType" AS ENUM ('domain', 'subdomain', 'page');

-- CreateEnum
CREATE TYPE "public"."PlanType" AS ENUM ('Freelance', 'Studio', 'Agency');

-- CreateTable
CREATE TABLE "public"."accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "image" TEXT,
    "emailVerified" TIMESTAMP(3),
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unlockedDomains" TEXT[],

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "public"."subscriptions" (
    "id" TEXT NOT NULL,
    "price_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "period_ends_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."organizations" (
    "id" TEXT NOT NULL,
    "name" VARCHAR NOT NULL,
    "owner_user_id" TEXT,
    "customer_id" TEXT,
    "subscription_id" TEXT,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."roles" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "org_name" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" VARCHAR NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."invites" (
    "id" TEXT NOT NULL,
    "org_id" VARCHAR NOT NULL,
    "email" TEXT NOT NULL,
    "role" VARCHAR NOT NULL,

    CONSTRAINT "invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."campaigns" (
    "id" TEXT NOT NULL,
    "name" VARCHAR NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."keywords" (
    "id" TEXT NOT NULL,
    "base" "public"."SERPBase" NOT NULL,
    "keyword" VARCHAR NOT NULL,
    "tags" TEXT[],
    "frequency" INTEGER NOT NULL DEFAULT 1,
    "search_volume" INTEGER NOT NULL DEFAULT 0,
    "cpc" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "competition" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "interest" INTEGER NOT NULL DEFAULT 0,
    "properties" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "keywords_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."sites" (
    "id" TEXT NOT NULL,
    "url" VARCHAR NOT NULL,
    "type" "public"."SiteType" NOT NULL,
    "tags" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "campaign_id" TEXT NOT NULL,

    CONSTRAINT "sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."alerts" (
    "id" TEXT NOT NULL,
    "email" VARCHAR NOT NULL,
    "frequency" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "campaign_id" TEXT NOT NULL,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."keyword_histories" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "location_code" INTEGER NOT NULL DEFAULT 2840,
    "language_code" TEXT NOT NULL DEFAULT 'en',
    "check_url" VARCHAR NOT NULL,
    "item_types" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "keyword_id" TEXT NOT NULL,

    CONSTRAINT "keyword_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."serp_data" (
    "id" TEXT NOT NULL,
    "url" VARCHAR NOT NULL,
    "rank" INTEGER NOT NULL DEFAULT 0,
    "title" VARCHAR NOT NULL,
    "description" VARCHAR NOT NULL,
    "serp_machine_history_id" TEXT NOT NULL,

    CONSTRAINT "serp_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."tracking_sites" (
    "id" TEXT NOT NULL,
    "url" VARCHAR NOT NULL,
    "type" "public"."SiteType" NOT NULL,
    "email_alert" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "tracking_sites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."backlink_histories" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "domain" VARCHAR NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tracking_site_id" TEXT,

    CONSTRAINT "backlink_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."backlink_data" (
    "id" TEXT NOT NULL,
    "source_url" VARCHAR NOT NULL,
    "cms" VARCHAR NOT NULL,
    "anchor" VARCHAR NOT NULL,
    "flags" JSONB NOT NULL,
    "target_url" VARCHAR NOT NULL,
    "ip" VARCHAR NOT NULL,
    "trust_flow" INTEGER NOT NULL DEFAULT 0,
    "citation_flow" INTEGER NOT NULL DEFAULT 0,
    "found_date" VARCHAR NOT NULL,
    "seen" VARCHAR NOT NULL,
    "last_crawl" VARCHAR NOT NULL,
    "type" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "backlink_history_id" TEXT NOT NULL,

    CONSTRAINT "backlink_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."domain_index_info" (
    "id" TEXT NOT NULL,
    "domain" VARCHAR NOT NULL,
    "ext_backlinks" BIGINT NOT NULL DEFAULT 0,
    "ref_domains" BIGINT NOT NULL DEFAULT 0,
    "alexa_rank" VARCHAR NOT NULL,
    "ip" VARCHAR NOT NULL,
    "subnet" VARCHAR NOT NULL,
    "trust_flow" INTEGER NOT NULL DEFAULT 0,
    "citation_flow" INTEGER NOT NULL DEFAULT 0,
    "percentage" INTEGER NOT NULL DEFAULT 0,
    "topical_trust_flow_topic_0" VARCHAR NOT NULL,
    "topical_trust_flow_value_0" INTEGER NOT NULL DEFAULT 0,
    "fetched_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "domain_index_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."site_index_info" (
    "id" TEXT NOT NULL,
    "url" VARCHAR NOT NULL,
    "google_indexed" BOOLEAN NOT NULL DEFAULT false,
    "indexed_rank" INTEGER NOT NULL DEFAULT 0,
    "indexed_url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_index_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_exports" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_exports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_histories" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "item" TEXT NOT NULL,
    "cost" INTEGER NOT NULL DEFAULT 0,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "interval" TEXT NOT NULL,
    "paypalPlanId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "constraints" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_orders" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "paypalSubscriptionId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentPeriodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tierName" TEXT,

    CONSTRAINT "user_orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."billing_histories" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "amount" DOUBLE PRECISION,
    "currency" TEXT,
    "data" JSONB NOT NULL,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ThirdPartyService" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "threshold" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThirdPartyService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."api_cache" (
    "id" TEXT NOT NULL,
    "cacheKey" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "parameters" JSONB NOT NULL,
    "response" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "hitCount" INTEGER NOT NULL DEFAULT 0,
    "userId" TEXT,
    "lastAccessed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cache_config" (
    "id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "ttl" INTEGER NOT NULL,
    "maxHits" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cache_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cache_stats" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endpoint" TEXT NOT NULL,
    "totalRequests" INTEGER NOT NULL DEFAULT 0,
    "cacheHits" INTEGER NOT NULL DEFAULT 0,
    "cacheMisses" INTEGER NOT NULL DEFAULT 0,
    "apiCalls" INTEGER NOT NULL DEFAULT 0,
    "averageResponseTime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cache_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "public"."accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "public"."sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "public"."verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "public"."verification_tokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_id_name_key" ON "public"."organizations"("id", "name");

-- CreateIndex
CREATE INDEX "domain_index_info_domain_fetched_at_idx" ON "public"."domain_index_info"("domain", "fetched_at");

-- CreateIndex
CREATE UNIQUE INDEX "site_index_info_url_key" ON "public"."site_index_info"("url");

-- CreateIndex
CREATE UNIQUE INDEX "plans_paypalPlanId_key" ON "public"."plans"("paypalPlanId");

-- CreateIndex
CREATE UNIQUE INDEX "user_orders_paypalSubscriptionId_key" ON "public"."user_orders"("paypalSubscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "public"."Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "api_cache_cacheKey_key" ON "public"."api_cache"("cacheKey");

-- CreateIndex
CREATE INDEX "api_cache_endpoint_expiresAt_idx" ON "public"."api_cache"("endpoint", "expiresAt");

-- CreateIndex
CREATE INDEX "api_cache_cacheKey_idx" ON "public"."api_cache"("cacheKey");

-- CreateIndex
CREATE INDEX "api_cache_userId_idx" ON "public"."api_cache"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "cache_config_endpoint_key" ON "public"."cache_config"("endpoint");

-- CreateIndex
CREATE INDEX "cache_stats_date_idx" ON "public"."cache_stats"("date");

-- CreateIndex
CREATE INDEX "cache_stats_endpoint_idx" ON "public"."cache_stats"("endpoint");

-- CreateIndex
CREATE UNIQUE INDEX "cache_stats_date_endpoint_key" ON "public"."cache_stats"("date", "endpoint");

-- AddForeignKey
ALTER TABLE "public"."accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."organizations" ADD CONSTRAINT "organizations_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."organizations" ADD CONSTRAINT "organizations_subscription_id_fkey" FOREIGN KEY ("subscription_id") REFERENCES "public"."subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."roles" ADD CONSTRAINT "roles_org_id_org_name_fkey" FOREIGN KEY ("org_id", "org_name") REFERENCES "public"."organizations"("id", "name") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."roles" ADD CONSTRAINT "roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."invites" ADD CONSTRAINT "invites_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."campaigns" ADD CONSTRAINT "campaigns_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."keywords" ADD CONSTRAINT "keywords_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."keywords" ADD CONSTRAINT "keywords_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."sites" ADD CONSTRAINT "sites_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."alerts" ADD CONSTRAINT "alerts_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."keyword_histories" ADD CONSTRAINT "keyword_histories_keyword_id_fkey" FOREIGN KEY ("keyword_id") REFERENCES "public"."keywords"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."serp_data" ADD CONSTRAINT "serp_data_serp_machine_history_id_fkey" FOREIGN KEY ("serp_machine_history_id") REFERENCES "public"."keyword_histories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."tracking_sites" ADD CONSTRAINT "tracking_sites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."backlink_histories" ADD CONSTRAINT "backlink_histories_tracking_site_id_fkey" FOREIGN KEY ("tracking_site_id") REFERENCES "public"."tracking_sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."backlink_data" ADD CONSTRAINT "backlink_data_backlink_history_id_fkey" FOREIGN KEY ("backlink_history_id") REFERENCES "public"."backlink_histories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_exports" ADD CONSTRAINT "user_exports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_histories" ADD CONSTRAINT "user_histories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_orders" ADD CONSTRAINT "user_orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_orders" ADD CONSTRAINT "user_orders_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."billing_histories" ADD CONSTRAINT "billing_histories_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "public"."user_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
