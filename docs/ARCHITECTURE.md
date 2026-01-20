# Hunt Deals - System Architecture Document

## Top 5 Features Implementation Guide

This document provides comprehensive architecture decisions, database schemas, API contracts, and implementation guidance for the top 5 prioritized features from the product roadmap.

**Features Covered:**
1. Deal Sharing (P1, 1 week)
2. Working Search (P0, 2 weeks)
3. Click Tracking Analytics (P0, 1.5 weeks)
4. User Authentication (P0, 3 weeks)
5. Price Drop Alerts (P0, 3 weeks)

**Document Version:** 1.0
**Last Updated:** 2026-01-20
**Authors:** Architecture Team

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Feature 1: Deal Sharing](#2-feature-1-deal-sharing)
3. [Feature 2: Working Search](#3-feature-2-working-search)
4. [Feature 3: Click Tracking Analytics](#4-feature-3-click-tracking-analytics)
5. [Feature 4: User Authentication](#5-feature-4-user-authentication)
6. [Feature 5: Price Drop Alerts](#6-feature-5-price-drop-alerts)
7. [Shared Components](#7-shared-components)
8. [Database Migration Strategy](#8-database-migration-strategy)
9. [Security Considerations](#9-security-considerations)
10. [Testing Strategy](#10-testing-strategy)

---

## 1. Architecture Overview

### 1.1 Current System Architecture

```
+------------------+     +------------------+     +------------------+
|   Flutter App    |     |   Admin Panel    |     |   Social Media   |
|   (PWA/Mobile)   |     |   (React-Admin)  |     |   (Twitter Bot)  |
+--------+---------+     +--------+---------+     +--------+---------+
         |                        |                        |
         |                        |                        |
         +------------------------+------------------------+
                                  |
                          +-------v-------+
                          |   NestJS API  |
                          |   (Port 3000) |
                          +-------+-------+
                                  |
                    +-------------+-------------+
                    |                           |
            +-------v-------+           +-------v-------+
            |   PostgreSQL  |           |  Amazon PAAPI |
            |   (Render)    |           |   (External)  |
            +---------------+           +---------------+
```

### 1.2 Extended Architecture (Post-Implementation)

```
+------------------+     +------------------+     +------------------+
|   Flutter App    |     |   Admin Panel    |     |   Social Media   |
|   (PWA/Mobile)   |     |   (React-Admin)  |     |   (Twitter Bot)  |
+--------+---------+     +--------+---------+     +--------+---------+
         |                        |                        |
         |    +-------------------+                        |
         |    |                                            |
         +----+------------+-------------------------------+
              |            |
      +-------v-------+    |    +------------------+
      |   NestJS API  |----+--->|   Firebase FCM   |
      |   (Port 3000) |         |   (Push Notifs)  |
      +-------+-------+         +------------------+
              |
    +---------+---------+---------+---------+
    |         |         |         |         |
+---v---+ +---v---+ +---v---+ +---v---+ +---v---+
|Postgres| |Redis  | |Google | |Apple  | |Amazon |
|  (DB)  | |(Cache)| | OAuth | | OAuth | | PAAPI |
+--------+ +-------+ +-------+ +-------+ +-------+
```

### 1.3 Module Dependency Graph

```
                    AppModule
                        |
        +---------------+---------------+
        |               |               |
   SharedModule    AuthModule     DealsModule
        |               |               |
        |         +-----+-----+         |
        |         |           |         |
        |    UsersModule  JwtModule     |
        |                               |
        +---------------+---------------+
                        |
            +-----------+-----------+
            |           |           |
      SearchModule  AnalyticsModule  AlertsModule
            |           |           |
            |           |           |
        (new)       (new)       (new)
```

---

## 2. Feature 1: Deal Sharing

### 2.1 Architecture Decision Record (ADR)

**ADR-001: Deal Sharing Implementation**

**Status:** Proposed

**Context:**
Users want to share deals with friends via social media and messaging apps. This requires generating shareable links with tracking parameters and supporting deep linking for app-installed recipients.

**Decision Options:**

**Option A: Server-Generated Short Links**
- Pros: Full control over URLs, analytics tracking, link expiration
- Cons: Additional server infrastructure, latency for link generation
- Best suited for: High-volume sharing with advanced analytics needs

**Option B: Client-Side Dynamic Links (Firebase Dynamic Links)**
- Pros: Deep linking support, deferred deep links, no server changes
- Cons: Firebase dependency, limited customization, Firebase Dynamic Links deprecated (use App Links/Universal Links)
- Best suited for: Quick implementation with basic deep linking

**Option C: Hybrid Approach (Server + Universal Links)**
- Pros: Best of both worlds - server analytics + native deep linking
- Cons: More complex setup
- Best suited for: Production-grade implementation with full features

**Recommendation:** Option C (Hybrid Approach)

**Reasoning:**
- UTM tracking requires server-side link generation
- Universal Links (iOS) and App Links (Android) provide native deep linking
- Server endpoint allows future enhancements (link expiration, analytics)

### 2.2 Database Schema

No new tables required. Share tracking will be handled by the Analytics module (see Feature 3).

### 2.3 API Endpoints

```yaml
# New Endpoints for Deal Sharing

POST /deals/{id}/share-link
  Description: Generate a shareable link with UTM parameters
  Request:
    Headers:
      Authorization: Bearer <token> (optional)
    Body:
      {
        "platform": "twitter" | "facebook" | "whatsapp" | "copy" | "native",
        "campaign": string (optional)
      }
  Response:
    {
      "shareUrl": "https://huntdeals.app/deal/{id}?utm_source=app&utm_medium=share&utm_campaign=twitter",
      "shortUrl": "https://hdls.app/abc123",
      "title": "Amazing Deal - 50% Off!",
      "description": "Save $50 on this product...",
      "imageUrl": "https://..."
    }

GET /d/{shortCode}
  Description: Redirect short link to full deal page
  Response: 301 Redirect to /deals/{dealId} with tracking
```

### 2.4 Flutter Architecture

```
lib/
  features/
    sharing/
      domain/
        entities/
          share_link.dart          # ShareLink entity
        repositories/
          sharing_repository.dart  # Abstract repository
      data/
        models/
          share_link_model.dart    # JSON serialization
        repositories/
          sharing_repository_impl.dart
      presentation/
        providers/
          sharing_provider.dart    # Riverpod provider
        widgets/
          share_bottom_sheet.dart  # Native share UI
```

**New Dart Classes:**

```dart
// lib/features/sharing/domain/entities/share_link.dart
class ShareLink {
  final String shareUrl;
  final String shortUrl;
  final String title;
  final String description;
  final String? imageUrl;

  const ShareLink({...});
}

// lib/features/sharing/presentation/providers/sharing_provider.dart
final sharingServiceProvider = Provider<SharingService>((ref) {
  return SharingService(
    repository: ref.watch(sharingRepositoryProvider),
    analytics: ref.watch(analyticsServiceProvider),
  );
});
```

### 2.5 Sequence Diagram: Share Deal Flow

```
┌─────────┐          ┌──────────┐          ┌─────────┐          ┌──────────┐
│  User   │          │  Flutter │          │  NestJS │          │ Analytics│
└────┬────┘          └────┬─────┘          └────┬────┘          └────┬─────┘
     │                    │                     │                     │
     │  Tap Share Button  │                     │                     │
     │───────────────────>│                     │                     │
     │                    │                     │                     │
     │                    │ POST /deals/{id}/share-link               │
     │                    │────────────────────>│                     │
     │                    │                     │                     │
     │                    │    Share Link Data  │                     │
     │                    │<────────────────────│                     │
     │                    │                     │                     │
     │  Show Share Sheet  │                     │                     │
     │<───────────────────│                     │                     │
     │                    │                     │                     │
     │  Select Platform   │                     │                     │
     │───────────────────>│                     │                     │
     │                    │                     │                     │
     │                    │ Log share_initiated │                     │
     │                    │─────────────────────────────────────────>│
     │                    │                     │                     │
     │  Native Share UI   │                     │                     │
     │<───────────────────│                     │                     │
     │                    │                     │                     │
     │  Share Complete    │                     │                     │
     │───────────────────>│                     │                     │
     │                    │                     │                     │
     │                    │ Log share_completed │                     │
     │                    │─────────────────────────────────────────>│
     │                    │                     │                     │
```

### 2.6 Deep Linking Configuration

**iOS (Universal Links)** - `ios/Runner/Runner.entitlements`:
```xml
<key>com.apple.developer.associated-domains</key>
<array>
  <string>applinks:huntdeals.app</string>
  <string>applinks:hdls.app</string>
</array>
```

**Android (App Links)** - `android/app/src/main/AndroidManifest.xml`:
```xml
<intent-filter android:autoVerify="true">
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="https" android:host="huntdeals.app" android:pathPrefix="/deal" />
</intent-filter>
```

---

## 3. Feature 2: Working Search

### 3.1 Architecture Decision Record (ADR)

**ADR-002: Search Implementation Strategy**

**Status:** Proposed

**Context:**
The app has a search bar UI but no functional search. Need to implement full-text search with category filtering and real-time results.

**Decision Options:**

**Option A: PostgreSQL Full-Text Search (pg_trgm + tsvector)**
- Pros: No additional infrastructure, good enough for current scale, built-in PostgreSQL
- Cons: Limited relevance tuning, no fuzzy matching without extensions
- Best suited for: MVPs with <100K deals

**Option B: Elasticsearch/OpenSearch**
- Pros: Advanced relevance, fuzzy matching, faceted search, scalable
- Cons: Additional infrastructure, operational complexity, cost
- Best suited for: Large-scale search with advanced features

**Option C: Algolia/Meilisearch (SaaS)**
- Pros: Instant search, typo tolerance, easy setup, great UX
- Cons: Recurring cost, data sync complexity, vendor lock-in
- Best suited for: Fast time-to-market with premium UX

**Recommendation:** Option A (PostgreSQL Full-Text Search)

**Reasoning:**
- Current deal count is manageable (<10K deals)
- Minimizes infrastructure complexity
- Can migrate to Elasticsearch later if needed
- PostgreSQL pg_trgm provides adequate fuzzy matching

### 3.2 Database Schema Changes

```sql
-- Migration: Add search optimization to deals table

-- Add full-text search vector column
ALTER TABLE deals ADD COLUMN search_vector tsvector;

-- Create GIN index for fast full-text search
CREATE INDEX idx_deals_search_vector ON deals USING GIN(search_vector);

-- Create trigram index for fuzzy matching
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_deals_title_trgm ON deals USING GIN(title gin_trgm_ops);
CREATE INDEX idx_deals_description_trgm ON deals USING GIN(description gin_trgm_ops);

-- Create trigger to auto-update search vector
CREATE OR REPLACE FUNCTION deals_search_vector_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', COALESCE(NEW.category, '')), 'C');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER deals_search_vector_update
  BEFORE INSERT OR UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION deals_search_vector_trigger();

-- Backfill existing records
UPDATE deals SET search_vector =
  setweight(to_tsvector('english', COALESCE(title, '')), 'A') ||
  setweight(to_tsvector('english', COALESCE(description, '')), 'B') ||
  setweight(to_tsvector('english', COALESCE(category, '')), 'C');
```

### 3.3 API Endpoints

```yaml
# Search Endpoints

GET /deals/search
  Description: Full-text search with filters
  Query Parameters:
    q: string (required) - Search query
    category: string (optional) - Filter by category
    minDiscount: number (optional) - Minimum discount %
    maxPrice: number (optional) - Maximum price
    isHot: boolean (optional) - Hot deals only
    page: number (default: 1)
    limit: number (default: 10, max: 50)
    sort: "relevance" | "price_asc" | "price_desc" | "discount" | "newest"
  Response:
    {
      "data": [Deal],
      "total": number,
      "page": number,
      "limit": number,
      "totalPages": number,
      "query": string,
      "suggestions": string[] (if no results)
    }

GET /deals/search/suggestions
  Description: Auto-complete suggestions
  Query Parameters:
    q: string (required, min 2 chars)
    limit: number (default: 5)
  Response:
    {
      "suggestions": [
        { "text": "airpods", "count": 15 },
        { "text": "airpods pro", "count": 8 }
      ]
    }
```

### 3.4 Backend Implementation

**New Module Structure:**

```
src/modules/search/
  search.module.ts
  search.controller.ts
  search.service.ts
  dto/
    search-query.dto.ts
    search-result.dto.ts
```

**Key Implementation:**

```typescript
// src/modules/search/search.service.ts
@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Deal)
    private readonly dealRepository: Repository<Deal>,
    private readonly logger: LoggerService,
  ) {}

  async search(query: SearchQueryDto): Promise<PaginatedResult<Deal>> {
    const { q, category, minDiscount, maxPrice, isHot, page, limit, sort } = query;

    // Build query with full-text search
    const qb = this.dealRepository.createQueryBuilder('deal')
      .where(`deal.search_vector @@ plainto_tsquery('english', :query)`, { query: q })
      .orWhere(`deal.title ILIKE :pattern`, { pattern: `%${q}%` })
      .orWhere(`deal.description ILIKE :pattern`, { pattern: `%${q}%` });

    // Apply filters
    if (category) {
      qb.andWhere('deal.category = :category', { category });
    }
    if (minDiscount) {
      qb.andWhere('deal.discountPercentage >= :minDiscount', { minDiscount });
    }
    if (maxPrice) {
      qb.andWhere('deal.price <= :maxPrice', { maxPrice });
    }
    if (isHot !== undefined) {
      qb.andWhere('deal.isHot = :isHot', { isHot });
    }

    // Apply sorting
    switch (sort) {
      case 'relevance':
        qb.addSelect(`ts_rank(deal.search_vector, plainto_tsquery('english', :query))`, 'rank')
          .orderBy('rank', 'DESC');
        break;
      case 'price_asc':
        qb.orderBy('deal.price', 'ASC');
        break;
      case 'price_desc':
        qb.orderBy('deal.price', 'DESC');
        break;
      case 'discount':
        qb.orderBy('deal.discountPercentage', 'DESC');
        break;
      case 'newest':
        qb.orderBy('deal.createdAt', 'DESC');
        break;
    }

    // Pagination
    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
```

### 3.5 Flutter Architecture

```
lib/
  features/
    search/
      domain/
        entities/
          search_result.dart
          search_suggestion.dart
        repositories/
          search_repository.dart
      data/
        models/
          search_result_model.dart
        repositories/
          search_repository_impl.dart
      presentation/
        providers/
          search_provider.dart
          search_suggestions_provider.dart
        pages/
          search_page.dart
        widgets/
          search_bar_widget.dart
          search_results_list.dart
          search_filter_chips.dart
          no_results_widget.dart
```

**State Management:**

```dart
// lib/features/search/presentation/providers/search_provider.dart

sealed class SearchState {
  const SearchState();
}

class SearchInitial extends SearchState {
  const SearchInitial();
}

class SearchLoading extends SearchState {
  const SearchLoading();
}

class SearchSuccess extends SearchState {
  final List<Deal> results;
  final String query;
  final int total;
  final int page;
  final bool hasMore;
  final List<String> suggestions;

  const SearchSuccess({...});
}

class SearchError extends SearchState {
  final String message;
  const SearchError(this.message);
}

class SearchNotifier extends StateNotifier<SearchState> {
  final SearchRepository repository;
  Timer? _debounceTimer;

  SearchNotifier({required this.repository}) : super(const SearchInitial());

  Future<void> search(String query, {SearchFilters? filters}) async {
    _debounceTimer?.cancel();

    if (query.length < 2) {
      state = const SearchInitial();
      return;
    }

    _debounceTimer = Timer(const Duration(milliseconds: 300), () async {
      state = const SearchLoading();

      final result = await repository.search(query, filters: filters);

      result.when(
        success: (data) => state = SearchSuccess(
          results: data.deals,
          query: query,
          total: data.total,
          page: data.page,
          hasMore: data.hasMore,
          suggestions: data.suggestions,
        ),
        failure: (error) => state = SearchError(error),
      );
    });
  }
}

final searchProvider = StateNotifierProvider<SearchNotifier, SearchState>((ref) {
  return SearchNotifier(repository: ref.watch(searchRepositoryProvider));
});
```

### 3.6 Sequence Diagram: Search Flow

```
┌─────────┐          ┌──────────┐          ┌─────────┐          ┌──────────┐
│  User   │          │  Flutter │          │  NestJS │          │ PostgreSQL│
└────┬────┘          └────┬─────┘          └────┬────┘          └────┬─────┘
     │                    │                     │                     │
     │  Type "airpods"    │                     │                     │
     │───────────────────>│                     │                     │
     │                    │                     │                     │
     │                    │  (debounce 300ms)   │                     │
     │                    │─ ─ ─ ─ ─ ─ ─ ─ ─ ─>│                     │
     │                    │                     │                     │
     │                    │ GET /deals/search?q=airpods               │
     │                    │────────────────────>│                     │
     │                    │                     │                     │
     │                    │                     │ Full-text query     │
     │                    │                     │────────────────────>│
     │                    │                     │                     │
     │                    │                     │  Ranked results     │
     │                    │                     │<────────────────────│
     │                    │                     │                     │
     │                    │   Search Results    │                     │
     │                    │<────────────────────│                     │
     │                    │                     │                     │
     │  Display Results   │                     │                     │
     │<───────────────────│                     │                     │
     │                    │                     │                     │
     │  Apply Filter      │                     │                     │
     │───────────────────>│                     │                     │
     │                    │                     │                     │
     │                    │ GET /deals/search?q=airpods&category=Electronics
     │                    │────────────────────>│                     │
     │                    │                     │                     │
```

---

## 4. Feature 3: Click Tracking Analytics

### 4.1 Architecture Decision Record (ADR)

**ADR-003: Analytics Data Storage Strategy**

**Status:** Proposed

**Context:**
Need to track affiliate link clicks with timestamps, user info (if authenticated), and deal metadata for revenue optimization and reporting.

**Decision Options:**

**Option A: PostgreSQL Table with Partitioning**
- Pros: Simple, uses existing infrastructure, SQL queries
- Cons: May need partitioning for scale, not optimized for time-series
- Best suited for: <1M events/month

**Option B: TimescaleDB (PostgreSQL Extension)**
- Pros: Time-series optimized, automatic partitioning, PostgreSQL compatible
- Cons: Additional setup, extension management
- Best suited for: High-volume time-series with SQL needs

**Option C: External Analytics (Mixpanel/Amplitude)**
- Pros: Rich analytics UI, funnels, cohorts, no backend changes
- Cons: Cost, data export complexity, privacy concerns
- Best suited for: Product analytics beyond click tracking

**Recommendation:** Option A with future migration path to TimescaleDB

**Reasoning:**
- Current scale doesn't require specialized time-series DB
- PostgreSQL partitioning by month is sufficient
- Can add TimescaleDB extension later without data migration
- Keeps data in-house for privacy compliance

### 4.2 Database Schema

```sql
-- Analytics Events Table (for click tracking and more)
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,      -- 'click', 'impression', 'share', 'save'
  deal_id UUID REFERENCES deals(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_id VARCHAR(100),               -- Anonymous session tracking

  -- Event metadata
  platform VARCHAR(20),                  -- 'ios', 'android', 'web'
  app_version VARCHAR(20),
  device_type VARCHAR(50),

  -- Click-specific fields
  affiliate_url TEXT,
  referrer VARCHAR(255),
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),

  -- Timing
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Denormalized deal data for fast queries (deal may be deleted)
  deal_title VARCHAR(255),
  deal_price DECIMAL(10, 2),
  deal_category VARCHAR(100)
);

-- Indexes for common queries
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_deal_id ON analytics_events(deal_id);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);

-- Composite index for dashboard queries
CREATE INDEX idx_analytics_events_type_date ON analytics_events(event_type, created_at DESC);

-- Partitioning by month (for scale)
-- Note: Implement when data volume requires it
-- CREATE TABLE analytics_events_2026_01 PARTITION OF analytics_events
--   FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

-- Aggregated daily stats for fast dashboard queries
CREATE TABLE analytics_daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,

  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,

  unique_users INTEGER DEFAULT 0,

  UNIQUE(date, deal_id)
);

CREATE INDEX idx_analytics_daily_stats_date ON analytics_daily_stats(date DESC);
CREATE INDEX idx_analytics_daily_stats_deal ON analytics_daily_stats(deal_id);
```

### 4.3 API Endpoints

```yaml
# Analytics Endpoints

POST /analytics/events
  Description: Track a single analytics event
  Request:
    Headers:
      Authorization: Bearer <token> (optional)
      X-Session-ID: <session_id>
      X-Platform: ios | android | web
      X-App-Version: 1.0.0
    Body:
      {
        "eventType": "click" | "impression" | "share" | "save",
        "dealId": "uuid",
        "metadata": {
          "affiliateUrl": "string",
          "referrer": "string",
          "utmSource": "string",
          "utmMedium": "string",
          "utmCampaign": "string"
        }
      }
  Response:
    { "success": true, "eventId": "uuid" }

POST /analytics/events/batch
  Description: Track multiple events (for offline sync)
  Request:
    Body:
      {
        "events": [
          { "eventType": "click", "dealId": "uuid", "timestamp": "ISO8601", ... }
        ]
      }
  Response:
    { "success": true, "processed": 10 }

# Admin Dashboard Endpoints

GET /admin/analytics/overview
  Description: Dashboard overview metrics
  Query Parameters:
    startDate: ISO8601
    endDate: ISO8601
  Response:
    {
      "totalClicks": number,
      "totalImpressions": number,
      "uniqueUsers": number,
      "clickThroughRate": number,
      "topDeals": [{ dealId, title, clicks, ctr }],
      "dailyTrend": [{ date, clicks, impressions }]
    }

GET /admin/analytics/deals/{dealId}
  Description: Analytics for a specific deal
  Query Parameters:
    startDate: ISO8601
    endDate: ISO8601
  Response:
    {
      "dealId": "uuid",
      "totalClicks": number,
      "totalImpressions": number,
      "ctr": number,
      "dailyStats": [{ date, clicks, impressions }],
      "platformBreakdown": { ios: number, android: number, web: number }
    }

GET /admin/analytics/export
  Description: Export analytics data as CSV
  Query Parameters:
    startDate: ISO8601
    endDate: ISO8601
    format: csv | json
  Response:
    File download or JSON array
```

### 4.4 Backend Implementation

**New Module Structure:**

```
src/modules/analytics/
  analytics.module.ts
  analytics.controller.ts
  analytics.service.ts
  entities/
    analytics-event.entity.ts
    analytics-daily-stats.entity.ts
  dto/
    track-event.dto.ts
    analytics-query.dto.ts
  repositories/
    analytics.repository.interface.ts
    typeorm-analytics.repository.ts
  jobs/
    analytics-aggregation.job.ts    # Cron job for daily aggregation
```

**Key Implementation:**

```typescript
// src/modules/analytics/analytics.service.ts
@Injectable()
export class AnalyticsService {
  constructor(
    @Inject(ANALYTICS_REPOSITORY)
    private readonly repository: IAnalyticsRepository,
    private readonly logger: LoggerService,
  ) {}

  async trackEvent(dto: TrackEventDto, context: EventContext): Promise<AnalyticsEvent> {
    const event = await this.repository.create({
      eventType: dto.eventType,
      dealId: dto.dealId,
      userId: context.userId,
      sessionId: context.sessionId,
      platform: context.platform,
      appVersion: context.appVersion,
      affiliateUrl: dto.metadata?.affiliateUrl,
      utmSource: dto.metadata?.utmSource,
      utmMedium: dto.metadata?.utmMedium,
      utmCampaign: dto.metadata?.utmCampaign,
    });

    this.logger.debug(`Tracked ${dto.eventType} event for deal ${dto.dealId}`, 'AnalyticsService');
    return event;
  }

  async getDashboardOverview(startDate: Date, endDate: Date): Promise<DashboardOverview> {
    const [
      totalClicks,
      totalImpressions,
      uniqueUsers,
      topDeals,
      dailyTrend,
    ] = await Promise.all([
      this.repository.countEvents('click', startDate, endDate),
      this.repository.countEvents('impression', startDate, endDate),
      this.repository.countUniqueUsers(startDate, endDate),
      this.repository.getTopDeals(startDate, endDate, 10),
      this.repository.getDailyTrend(startDate, endDate),
    ]);

    return {
      totalClicks,
      totalImpressions,
      uniqueUsers,
      clickThroughRate: totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0,
      topDeals,
      dailyTrend,
    };
  }
}
```

### 4.5 Flutter Implementation

```dart
// lib/core/services/analytics_service.dart (enhanced)

class AnalyticsService {
  final ApiClient _apiClient;
  final String _sessionId;
  final Queue<AnalyticsEvent> _offlineQueue = Queue();

  AnalyticsService({required ApiClient apiClient})
      : _apiClient = apiClient,
        _sessionId = _generateSessionId();

  /// Track affiliate link click
  Future<void> trackClick({
    required String dealId,
    required String affiliateUrl,
    String? utmSource,
    String? utmMedium,
    String? utmCampaign,
  }) async {
    await _trackEvent(
      eventType: 'click',
      dealId: dealId,
      metadata: {
        'affiliateUrl': affiliateUrl,
        'utmSource': utmSource,
        'utmMedium': utmMedium,
        'utmCampaign': utmCampaign,
      },
    );
  }

  /// Track deal impression (when deal is visible on screen)
  Future<void> trackImpression(String dealId) async {
    await _trackEvent(eventType: 'impression', dealId: dealId);
  }

  /// Track deal save
  Future<void> trackSave(String dealId) async {
    await _trackEvent(eventType: 'save', dealId: dealId);
  }

  /// Track deal share
  Future<void> trackShare(String dealId, String platform) async {
    await _trackEvent(
      eventType: 'share',
      dealId: dealId,
      metadata: {'platform': platform},
    );
  }

  Future<void> _trackEvent({
    required String eventType,
    required String dealId,
    Map<String, dynamic>? metadata,
  }) async {
    final event = AnalyticsEvent(
      eventType: eventType,
      dealId: dealId,
      sessionId: _sessionId,
      timestamp: DateTime.now(),
      metadata: metadata,
    );

    try {
      await _apiClient.post('/analytics/events', data: event.toJson());
    } catch (e) {
      // Queue for later sync if offline
      _offlineQueue.add(event);
      logger.warning('Analytics event queued for later: $eventType');
    }
  }

  /// Sync queued events when back online
  Future<void> syncOfflineEvents() async {
    if (_offlineQueue.isEmpty) return;

    final events = _offlineQueue.toList();
    _offlineQueue.clear();

    try {
      await _apiClient.post('/analytics/events/batch', data: {
        'events': events.map((e) => e.toJson()).toList(),
      });
    } catch (e) {
      // Re-queue on failure
      _offlineQueue.addAll(events);
    }
  }
}
```

### 4.6 Sequence Diagram: Click Tracking Flow

```
┌─────────┐          ┌──────────┐          ┌─────────┐          ┌──────────┐
│  User   │          │  Flutter │          │  NestJS │          │ PostgreSQL│
└────┬────┘          └────┬─────┘          └────┬────┘          └────┬─────┘
     │                    │                     │                     │
     │  Tap "View Deal"   │                     │                     │
     │───────────────────>│                     │                     │
     │                    │                     │                     │
     │                    │ POST /analytics/events                    │
     │                    │ { eventType: "click", dealId, ... }       │
     │                    │────────────────────>│                     │
     │                    │                     │                     │
     │                    │                     │  INSERT event       │
     │                    │                     │────────────────────>│
     │                    │                     │                     │
     │                    │   { success: true } │                     │
     │                    │<────────────────────│                     │
     │                    │                     │                     │
     │ Open Affiliate URL │                     │                     │
     │<───────────────────│                     │                     │
     │                    │                     │                     │
     │                    │                     │                     │
     │  ═══ Later (Admin Dashboard) ═══        │                     │
     │                    │                     │                     │
     │                    │ GET /admin/analytics/overview             │
     │                    │────────────────────>│                     │
     │                    │                     │                     │
     │                    │                     │  Aggregate query    │
     │                    │                     │────────────────────>│
     │                    │                     │                     │
     │                    │  Dashboard Data     │                     │
     │                    │<────────────────────│                     │
     │                    │                     │                     │
```

---

## 5. Feature 4: User Authentication

### 5.1 Architecture Decision Record (ADR)

**ADR-004: Authentication Strategy**

**Status:** Proposed

**Context:**
Need to implement user authentication with Google and Apple OAuth for cross-device sync of saved deals and personalized features.

**Decision Options:**

**Option A: Self-Hosted OAuth + JWT**
- Pros: Full control, no vendor lock-in, works offline
- Cons: Security responsibility, token management complexity
- Best suited for: Teams with security expertise

**Option B: Firebase Authentication**
- Pros: Easy setup, handles OAuth flows, secure token management
- Cons: Firebase dependency, limited customization
- Best suited for: Rapid development, Flutter ecosystem

**Option C: Auth0/Clerk (SaaS)**
- Pros: Enterprise features, MFA, compliance
- Cons: Cost at scale, vendor lock-in
- Best suited for: Enterprise applications

**Recommendation:** Option A (Self-Hosted OAuth + JWT)

**Reasoning:**
- Existing JWT infrastructure for admin auth can be extended
- Full control over user data (important for privacy)
- No additional SaaS costs
- Passport.js provides robust OAuth strategies

### 5.2 Database Schema

```sql
-- Users table for app users (separate from admin_users)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Authentication
  email VARCHAR(255) UNIQUE,
  email_verified BOOLEAN DEFAULT FALSE,
  password_hash VARCHAR(255),              -- For email/password auth (optional)

  -- OAuth providers
  google_id VARCHAR(255) UNIQUE,
  apple_id VARCHAR(255) UNIQUE,

  -- Profile
  display_name VARCHAR(100),
  avatar_url VARCHAR(500),

  -- Preferences
  notification_preferences JSONB DEFAULT '{"push": true, "email": true, "priceAlerts": true}'::jsonb,

  -- Metadata
  last_login_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_google_id ON users(google_id);
CREATE INDEX idx_users_apple_id ON users(apple_id);

-- User sessions for JWT refresh tokens
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  refresh_token_hash VARCHAR(255) NOT NULL,
  device_info JSONB,                       -- { platform, deviceId, appVersion }
  ip_address INET,

  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);

-- Saved deals (replaces local storage)
CREATE TABLE saved_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,

  -- Alert settings
  price_alert_enabled BOOLEAN DEFAULT TRUE,
  price_alert_threshold DECIMAL(5, 2) DEFAULT 5.00,  -- Alert if drops by X%

  -- Metadata
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT,

  UNIQUE(user_id, deal_id)
);

CREATE INDEX idx_saved_deals_user_id ON saved_deals(user_id);
CREATE INDEX idx_saved_deals_deal_id ON saved_deals(deal_id);

-- FCM tokens for push notifications
CREATE TABLE user_fcm_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  fcm_token VARCHAR(500) NOT NULL,
  platform VARCHAR(20) NOT NULL,           -- 'ios', 'android', 'web'
  device_id VARCHAR(255),

  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, fcm_token)
);

CREATE INDEX idx_user_fcm_tokens_user_id ON user_fcm_tokens(user_id);
```

### 5.3 API Endpoints

```yaml
# Authentication Endpoints

POST /auth/google
  Description: Authenticate with Google OAuth token
  Request:
    Body:
      {
        "idToken": string,           # Google ID token from client
        "deviceInfo": {
          "platform": "ios" | "android" | "web",
          "deviceId": string,
          "appVersion": string
        }
      }
  Response:
    {
      "accessToken": string,         # JWT, expires in 15 minutes
      "refreshToken": string,        # Opaque token, expires in 30 days
      "expiresIn": 900,
      "user": {
        "id": "uuid",
        "email": "user@gmail.com",
        "displayName": "John Doe",
        "avatarUrl": "https://...",
        "createdAt": "ISO8601"
      }
    }

POST /auth/apple
  Description: Authenticate with Apple Sign-In
  Request:
    Body:
      {
        "identityToken": string,     # Apple identity token
        "authorizationCode": string,
        "user": {                    # Only on first sign-in
          "email": string,
          "name": { "firstName": string, "lastName": string }
        },
        "deviceInfo": { ... }
      }
  Response:
    Same as /auth/google

POST /auth/refresh
  Description: Refresh access token
  Request:
    Body:
      { "refreshToken": string }
  Response:
    {
      "accessToken": string,
      "expiresIn": 900
    }

POST /auth/logout
  Description: Invalidate current session
  Headers:
    Authorization: Bearer <accessToken>
  Request:
    Body:
      { "refreshToken": string }
  Response:
    { "success": true }

GET /auth/me
  Description: Get current user profile
  Headers:
    Authorization: Bearer <accessToken>
  Response:
    { "user": User }

PATCH /auth/me
  Description: Update user profile
  Headers:
    Authorization: Bearer <accessToken>
  Request:
    Body:
      {
        "displayName": string,
        "notificationPreferences": { ... }
      }
  Response:
    { "user": User }

DELETE /auth/me
  Description: Delete user account
  Headers:
    Authorization: Bearer <accessToken>
  Response:
    { "success": true }

# Saved Deals (Authenticated)

GET /users/me/saved-deals
  Description: Get user's saved deals
  Headers:
    Authorization: Bearer <accessToken>
  Query Parameters:
    page: number
    limit: number
  Response:
    {
      "data": [{ deal: Deal, savedAt: string, priceAlertEnabled: boolean }],
      "total": number,
      "page": number,
      "totalPages": number
    }

POST /users/me/saved-deals/{dealId}
  Description: Save a deal
  Headers:
    Authorization: Bearer <accessToken>
  Request:
    Body:
      {
        "priceAlertEnabled": boolean,
        "priceAlertThreshold": number
      }
  Response:
    { "success": true, "savedDeal": SavedDeal }

DELETE /users/me/saved-deals/{dealId}
  Description: Unsave a deal
  Headers:
    Authorization: Bearer <accessToken>
  Response:
    { "success": true }

# FCM Token Management

POST /users/me/fcm-tokens
  Description: Register FCM token for push notifications
  Headers:
    Authorization: Bearer <accessToken>
  Request:
    Body:
      {
        "fcmToken": string,
        "platform": "ios" | "android" | "web",
        "deviceId": string
      }
  Response:
    { "success": true }

DELETE /users/me/fcm-tokens/{tokenId}
  Description: Unregister FCM token
  Headers:
    Authorization: Bearer <accessToken>
  Response:
    { "success": true }
```

### 5.4 Backend Implementation

**New/Updated Module Structure:**

```
src/modules/
  users/
    users.module.ts
    users.controller.ts
    users.service.ts
    entities/
      user.entity.ts
      user-session.entity.ts
      saved-deal.entity.ts
      user-fcm-token.entity.ts
    dto/
      create-user.dto.ts
      update-user.dto.ts
      save-deal.dto.ts
    repositories/
      users.repository.interface.ts
      typeorm-users.repository.ts
  auth/
    auth.module.ts              # Extend existing
    auth.controller.ts          # Add OAuth endpoints
    auth.service.ts             # Add OAuth logic
    strategies/
      jwt.strategy.ts           # Existing
      google.strategy.ts        # New
      apple.strategy.ts         # New
    guards/
      jwt-auth.guard.ts         # Existing
      optional-auth.guard.ts    # New - allows unauthenticated
```

**Key Implementation:**

```typescript
// src/modules/auth/auth.service.ts (extended)
@Injectable()
export class AuthService {
  async authenticateWithGoogle(idToken: string, deviceInfo: DeviceInfo): Promise<AuthResult> {
    // 1. Verify Google ID token
    const payload = await this.googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { sub: googleId, email, name, picture } = payload.getPayload();

    // 2. Find or create user
    let user = await this.usersRepository.findByGoogleId(googleId);

    if (!user) {
      user = await this.usersRepository.create({
        googleId,
        email,
        emailVerified: true,
        displayName: name,
        avatarUrl: picture,
      });
    }

    // 3. Create session and tokens
    const { accessToken, refreshToken } = await this.createSession(user, deviceInfo);

    return { accessToken, refreshToken, expiresIn: 900, user };
  }

  async authenticateWithApple(
    identityToken: string,
    authorizationCode: string,
    userInfo: AppleUserInfo | null,
    deviceInfo: DeviceInfo,
  ): Promise<AuthResult> {
    // 1. Verify Apple identity token
    const appleUser = await this.appleAuth.verifyIdToken(identityToken, {
      audience: process.env.APPLE_CLIENT_ID,
      ignoreExpiration: false,
    });

    const { sub: appleId, email } = appleUser;

    // 2. Find or create user
    let user = await this.usersRepository.findByAppleId(appleId);

    if (!user) {
      // Apple only sends user info on first sign-in
      const displayName = userInfo
        ? `${userInfo.name.firstName} ${userInfo.name.lastName}`.trim()
        : email?.split('@')[0] || 'User';

      user = await this.usersRepository.create({
        appleId,
        email,
        emailVerified: true,
        displayName,
      });
    }

    // 3. Create session and tokens
    const { accessToken, refreshToken } = await this.createSession(user, deviceInfo);

    return { accessToken, refreshToken, expiresIn: 900, user };
  }

  private async createSession(user: User, deviceInfo: DeviceInfo): Promise<TokenPair> {
    const accessToken = this.jwtService.sign(
      { sub: user.id, email: user.email, type: 'access' },
      { expiresIn: '15m' },
    );

    const refreshToken = crypto.randomBytes(32).toString('hex');
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    await this.sessionsRepository.create({
      userId: user.id,
      refreshTokenHash,
      deviceInfo,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    });

    return { accessToken, refreshToken };
  }
}
```

### 5.5 Flutter Architecture

```
lib/
  features/
    auth/
      domain/
        entities/
          user.dart
          auth_result.dart
        repositories/
          auth_repository.dart
      data/
        models/
          user_model.dart
        datasources/
          auth_local_datasource.dart    # Secure storage
          auth_remote_datasource.dart   # API calls
        repositories/
          auth_repository_impl.dart
      presentation/
        providers/
          auth_provider.dart
          auth_state.dart
        pages/
          login_page.dart               # Update existing profile_page.dart
        widgets/
          google_sign_in_button.dart
          apple_sign_in_button.dart
```

**State Management:**

```dart
// lib/features/auth/presentation/providers/auth_provider.dart

sealed class AuthState {
  const AuthState();
}

class AuthInitial extends AuthState {
  const AuthInitial();
}

class AuthLoading extends AuthState {
  const AuthLoading();
}

class Authenticated extends AuthState {
  final User user;
  final String accessToken;

  const Authenticated({required this.user, required this.accessToken});
}

class Unauthenticated extends AuthState {
  const Unauthenticated();
}

class AuthError extends AuthState {
  final String message;
  const AuthError(this.message);
}

class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepository _repository;
  final SecureStorage _secureStorage;
  Timer? _refreshTimer;

  AuthNotifier({
    required AuthRepository repository,
    required SecureStorage secureStorage,
  })  : _repository = repository,
        _secureStorage = secureStorage,
        super(const AuthInitial()) {
    _checkAuthStatus();
  }

  Future<void> _checkAuthStatus() async {
    final refreshToken = await _secureStorage.read('refresh_token');
    if (refreshToken != null) {
      await _refreshAccessToken(refreshToken);
    } else {
      state = const Unauthenticated();
    }
  }

  Future<void> signInWithGoogle() async {
    state = const AuthLoading();

    try {
      final googleSignIn = GoogleSignIn(scopes: ['email', 'profile']);
      final account = await googleSignIn.signIn();

      if (account == null) {
        state = const Unauthenticated();
        return;
      }

      final authentication = await account.authentication;
      final result = await _repository.authenticateWithGoogle(
        idToken: authentication.idToken!,
        deviceInfo: await _getDeviceInfo(),
      );

      await _saveTokens(result.accessToken, result.refreshToken);
      _scheduleTokenRefresh();

      state = Authenticated(user: result.user, accessToken: result.accessToken);
    } catch (e) {
      state = AuthError(e.toString());
    }
  }

  Future<void> signInWithApple() async {
    state = const AuthLoading();

    try {
      final credential = await SignInWithApple.getAppleIDCredential(
        scopes: [AppleIDAuthorizationScopes.email, AppleIDAuthorizationScopes.fullName],
      );

      final result = await _repository.authenticateWithApple(
        identityToken: credential.identityToken!,
        authorizationCode: credential.authorizationCode,
        user: credential.givenName != null
            ? AppleUserInfo(
                email: credential.email,
                name: AppleName(
                  firstName: credential.givenName!,
                  lastName: credential.familyName ?? '',
                ),
              )
            : null,
        deviceInfo: await _getDeviceInfo(),
      );

      await _saveTokens(result.accessToken, result.refreshToken);
      _scheduleTokenRefresh();

      state = Authenticated(user: result.user, accessToken: result.accessToken);
    } catch (e) {
      state = AuthError(e.toString());
    }
  }

  Future<void> signOut() async {
    final refreshToken = await _secureStorage.read('refresh_token');
    if (refreshToken != null) {
      await _repository.logout(refreshToken);
    }

    await _secureStorage.deleteAll();
    _refreshTimer?.cancel();

    state = const Unauthenticated();
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(
    repository: ref.watch(authRepositoryProvider),
    secureStorage: ref.watch(secureStorageProvider),
  );
});
```

### 5.6 Sequence Diagram: Google Sign-In Flow

```
┌─────────┐     ┌──────────┐     ┌─────────┐     ┌─────────┐     ┌──────────┐
│  User   │     │  Flutter │     │  Google │     │  NestJS │     │PostgreSQL│
└────┬────┘     └────┬─────┘     └────┬────┘     └────┬────┘     └────┬─────┘
     │               │                │               │               │
     │  Tap Google   │                │               │               │
     │──────────────>│                │               │               │
     │               │                │               │               │
     │               │  OAuth Flow    │               │               │
     │               │───────────────>│               │               │
     │               │                │               │               │
     │  Google UI    │                │               │               │
     │<──────────────│                │               │               │
     │               │                │               │               │
     │  Consent      │                │               │               │
     │──────────────>│                │               │               │
     │               │                │               │               │
     │               │   ID Token     │               │               │
     │               │<───────────────│               │               │
     │               │                │               │               │
     │               │ POST /auth/google              │               │
     │               │ { idToken, deviceInfo }        │               │
     │               │───────────────────────────────>│               │
     │               │                │               │               │
     │               │                │  Verify Token │               │
     │               │                │<──────────────│               │
     │               │                │               │               │
     │               │                │  Token Valid  │               │
     │               │                │──────────────>│               │
     │               │                │               │               │
     │               │                │               │ Upsert User   │
     │               │                │               │──────────────>│
     │               │                │               │               │
     │               │                │               │ Create Session│
     │               │                │               │──────────────>│
     │               │                │               │               │
     │               │ { accessToken, refreshToken, user }            │
     │               │<───────────────────────────────│               │
     │               │                │               │               │
     │               │ Store in SecureStorage         │               │
     │               │─ ─ ─ ─ ─ ─ ─ ─>│               │               │
     │               │                │               │               │
     │  Logged In!   │                │               │               │
     │<──────────────│                │               │               │
     │               │                │               │               │
```

---

## 6. Feature 5: Price Drop Alerts

### 6.1 Architecture Decision Record (ADR)

**ADR-005: Price Tracking and Alert System**

**Status:** Proposed

**Context:**
Need to track price history for deals and notify users when saved deals drop in price.

**Decision Options:**

**Option A: Polling-Based Price Updates**
- Pros: Simple, works with any data source
- Cons: Delay between price change and detection, API rate limits
- Best suited for: External deal sources without webhooks

**Option B: Event-Driven Updates**
- Pros: Real-time detection, efficient
- Cons: Requires webhook support or internal events
- Best suited for: Systems with event sources

**Option C: Hybrid (Internal Events + Scheduled Sync)**
- Pros: Real-time for internal changes, catches external changes
- Cons: More complex
- Best suited for: Mix of internal and external deal sources

**Recommendation:** Option C (Hybrid)

**Reasoning:**
- Internal deal updates (admin edits) can trigger immediate events
- Amazon PAAPI sync runs on schedule, captures external price changes
- Cron job processes pending alerts in batches for efficiency

### 6.2 Database Schema

```sql
-- Price history table
CREATE TABLE price_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,

  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2) NOT NULL,
  discount_percentage DECIMAL(5, 2) NOT NULL,

  source VARCHAR(50) DEFAULT 'sync',       -- 'sync', 'manual', 'api'
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_price_history_deal_id ON price_history(deal_id);
CREATE INDEX idx_price_history_recorded_at ON price_history(recorded_at DESC);

-- Composite index for price trend queries
CREATE INDEX idx_price_history_deal_date ON price_history(deal_id, recorded_at DESC);

-- Price alerts queue (for batch processing)
CREATE TABLE price_alerts_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  old_price DECIMAL(10, 2) NOT NULL,
  new_price DECIMAL(10, 2) NOT NULL,
  price_drop_percentage DECIMAL(5, 2) NOT NULL,

  status VARCHAR(20) DEFAULT 'pending',    -- 'pending', 'sent', 'failed'

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_price_alerts_queue_status ON price_alerts_queue(status);
CREATE INDEX idx_price_alerts_queue_user ON price_alerts_queue(user_id);

-- User alert preferences (in saved_deals table)
-- Already defined in auth schema:
-- price_alert_enabled BOOLEAN DEFAULT TRUE
-- price_alert_threshold DECIMAL(5, 2) DEFAULT 5.00
```

### 6.3 API Endpoints

```yaml
# Price History Endpoints

GET /deals/{id}/price-history
  Description: Get price history for a deal
  Query Parameters:
    days: number (default: 30, max: 90)
  Response:
    {
      "dealId": "uuid",
      "currentPrice": number,
      "history": [
        { "price": number, "recordedAt": "ISO8601" }
      ],
      "stats": {
        "lowestPrice": number,
        "highestPrice": number,
        "averagePrice": number,
        "priceDrops": number,
        "trend": "up" | "down" | "stable"
      }
    }

# Alert Management (requires auth)

GET /users/me/alerts
  Description: Get user's price alert settings
  Headers:
    Authorization: Bearer <token>
  Response:
    {
      "globalSettings": {
        "pushEnabled": boolean,
        "emailEnabled": boolean,
        "defaultThreshold": number
      },
      "dealAlerts": [
        {
          "dealId": "uuid",
          "dealTitle": string,
          "currentPrice": number,
          "alertThreshold": number,
          "enabled": boolean
        }
      ]
    }

PATCH /users/me/alerts/settings
  Description: Update global alert settings
  Headers:
    Authorization: Bearer <token>
  Request:
    Body:
      {
        "pushEnabled": boolean,
        "emailEnabled": boolean,
        "defaultThreshold": number
      }
  Response:
    { "success": true }

PATCH /users/me/saved-deals/{dealId}/alert
  Description: Update alert settings for a specific deal
  Headers:
    Authorization: Bearer <token>
  Request:
    Body:
      {
        "enabled": boolean,
        "threshold": number
      }
  Response:
    { "success": true }

# Alert History

GET /users/me/alerts/history
  Description: Get past price alerts
  Headers:
    Authorization: Bearer <token>
  Query Parameters:
    page: number
    limit: number
  Response:
    {
      "data": [
        {
          "id": "uuid",
          "dealId": "uuid",
          "dealTitle": string,
          "oldPrice": number,
          "newPrice": number,
          "dropPercentage": number,
          "sentAt": "ISO8601"
        }
      ],
      "total": number,
      "page": number
    }
```

### 6.4 Backend Implementation

**New Module Structure:**

```
src/modules/
  price-tracking/
    price-tracking.module.ts
    price-tracking.service.ts
    entities/
      price-history.entity.ts
    repositories/
      price-history.repository.interface.ts
      typeorm-price-history.repository.ts
    jobs/
      price-sync.job.ts           # Record prices after PAAPI sync

  alerts/
    alerts.module.ts
    alerts.controller.ts
    alerts.service.ts
    entities/
      price-alert-queue.entity.ts
    dto/
      update-alert-settings.dto.ts
    jobs/
      process-alerts.job.ts       # Send pending alerts
    services/
      fcm.service.ts              # Firebase Cloud Messaging
```

**Key Implementation:**

```typescript
// src/modules/price-tracking/price-tracking.service.ts
@Injectable()
export class PriceTrackingService {
  constructor(
    @Inject(PRICE_HISTORY_REPOSITORY)
    private readonly repository: IPriceHistoryRepository,
    private readonly alertsService: AlertsService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Record a price point and check for alerts
   * Called after deal update or PAAPI sync
   */
  async recordPrice(deal: Deal, source: string = 'sync'): Promise<void> {
    // Get previous price
    const lastRecord = await this.repository.getLatestForDeal(deal.id);

    // Only record if price changed or first record
    if (!lastRecord || lastRecord.price !== deal.price) {
      await this.repository.create({
        dealId: deal.id,
        price: deal.price,
        originalPrice: deal.originalPrice,
        discountPercentage: deal.discountPercentage,
        source,
      });

      // Check if price dropped
      if (lastRecord && deal.price < lastRecord.price) {
        const dropPercentage = ((lastRecord.price - deal.price) / lastRecord.price) * 100;

        // Queue alerts for users who saved this deal
        await this.alertsService.queuePriceDropAlerts(
          deal,
          lastRecord.price,
          deal.price,
          dropPercentage,
        );
      }
    }
  }

  async getPriceHistory(dealId: string, days: number = 30): Promise<PriceHistoryResponse> {
    const history = await this.repository.getHistoryForDeal(dealId, days);

    if (history.length === 0) {
      return { dealId, currentPrice: 0, history: [], stats: null };
    }

    const prices = history.map(h => h.price);
    const currentPrice = prices[0];

    return {
      dealId,
      currentPrice,
      history: history.map(h => ({
        price: h.price,
        recordedAt: h.recordedAt,
      })),
      stats: {
        lowestPrice: Math.min(...prices),
        highestPrice: Math.max(...prices),
        averagePrice: prices.reduce((a, b) => a + b, 0) / prices.length,
        priceDrops: this.countPriceDrops(history),
        trend: this.calculateTrend(history),
      },
    };
  }
}

// src/modules/alerts/alerts.service.ts
@Injectable()
export class AlertsService {
  constructor(
    @InjectRepository(PriceAlertQueue)
    private readonly alertQueueRepository: Repository<PriceAlertQueue>,
    @InjectRepository(SavedDeal)
    private readonly savedDealsRepository: Repository<SavedDeal>,
    private readonly fcmService: FcmService,
    private readonly logger: LoggerService,
  ) {}

  async queuePriceDropAlerts(
    deal: Deal,
    oldPrice: number,
    newPrice: number,
    dropPercentage: number,
  ): Promise<void> {
    // Find users who saved this deal with alerts enabled
    const savedDeals = await this.savedDealsRepository.find({
      where: {
        dealId: deal.id,
        priceAlertEnabled: true,
      },
      relations: ['user'],
    });

    // Filter by threshold and queue alerts
    const alertsToQueue = savedDeals.filter(
      sd => dropPercentage >= sd.priceAlertThreshold,
    );

    for (const savedDeal of alertsToQueue) {
      await this.alertQueueRepository.save({
        dealId: deal.id,
        userId: savedDeal.userId,
        oldPrice,
        newPrice,
        priceDropPercentage: dropPercentage,
        status: 'pending',
      });
    }

    this.logger.log(
      `Queued ${alertsToQueue.length} price alerts for deal ${deal.id}`,
      'AlertsService',
    );
  }

  /**
   * Process pending alerts (called by cron job)
   */
  @Cron('*/5 * * * *') // Every 5 minutes
  async processAlertQueue(): Promise<void> {
    const pendingAlerts = await this.alertQueueRepository.find({
      where: { status: 'pending' },
      relations: ['user', 'deal'],
      take: 100,
    });

    for (const alert of pendingAlerts) {
      try {
        // Get user's FCM tokens
        const tokens = await this.getUserFcmTokens(alert.userId);

        if (tokens.length > 0) {
          await this.fcmService.sendNotification(tokens, {
            title: 'Price Drop Alert!',
            body: `${alert.deal.title} dropped from $${alert.oldPrice} to $${alert.newPrice} (${alert.priceDropPercentage.toFixed(0)}% off)`,
            data: {
              type: 'price_drop',
              dealId: alert.dealId,
            },
          });
        }

        alert.status = 'sent';
        alert.processedAt = new Date();
      } catch (error) {
        this.logger.error(`Failed to send alert ${alert.id}: ${error}`, 'AlertsService');
        alert.status = 'failed';
      }

      await this.alertQueueRepository.save(alert);
    }
  }
}

// src/modules/alerts/services/fcm.service.ts
@Injectable()
export class FcmService {
  private firebaseApp: admin.app.App;

  constructor() {
    this.firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }

  async sendNotification(
    tokens: string[],
    notification: { title: string; body: string; data?: Record<string, string> },
  ): Promise<void> {
    const message: admin.messaging.MulticastMessage = {
      tokens,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data,
      android: {
        priority: 'high',
        notification: {
          channelId: 'price_alerts',
        },
      },
      apns: {
        payload: {
          aps: {
            badge: 1,
            sound: 'default',
          },
        },
      },
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    // Handle failed tokens (remove invalid ones)
    if (response.failureCount > 0) {
      const failedTokens = response.responses
        .map((r, i) => (r.success ? null : tokens[i]))
        .filter(Boolean);

      // TODO: Mark failed tokens as inactive in database
    }
  }
}
```

### 6.5 Flutter Implementation

```
lib/
  features/
    alerts/
      domain/
        entities/
          price_alert.dart
          alert_settings.dart
        repositories/
          alerts_repository.dart
      data/
        models/
          price_alert_model.dart
        repositories/
          alerts_repository_impl.dart
      presentation/
        providers/
          alerts_provider.dart
        pages/
          alerts_settings_page.dart
        widgets/
          alert_threshold_slider.dart

    price_history/
      domain/
        entities/
          price_history.dart
          price_stats.dart
        repositories/
          price_history_repository.dart
      data/
        models/
          price_history_model.dart
        repositories/
          price_history_repository_impl.dart
      presentation/
        providers/
          price_history_provider.dart
        widgets/
          price_chart_widget.dart
          price_trend_indicator.dart
```

**Push Notification Handling:**

```dart
// lib/core/services/push_notification_service.dart

class PushNotificationService {
  final FirebaseMessaging _messaging = FirebaseMessaging.instance;

  Future<void> initialize() async {
    // Request permission
    final settings = await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      // Get FCM token
      final token = await _messaging.getToken();
      if (token != null) {
        await _registerToken(token);
      }

      // Listen for token refresh
      _messaging.onTokenRefresh.listen(_registerToken);

      // Handle foreground messages
      FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

      // Handle background messages
      FirebaseMessaging.onBackgroundMessage(_handleBackgroundMessage);

      // Handle notification tap
      FirebaseMessaging.onMessageOpenedApp.listen(_handleNotificationTap);
    }
  }

  void _handleForegroundMessage(RemoteMessage message) {
    final data = message.data;

    if (data['type'] == 'price_drop') {
      // Show local notification or in-app banner
      _showPriceDropBanner(
        dealId: data['dealId'],
        title: message.notification?.title ?? 'Price Drop!',
        body: message.notification?.body ?? '',
      );
    }
  }

  void _handleNotificationTap(RemoteMessage message) {
    final data = message.data;

    if (data['type'] == 'price_drop' && data['dealId'] != null) {
      // Navigate to deal detail
      _navigateToDeal(data['dealId']);
    }
  }
}
```

### 6.6 Sequence Diagram: Price Drop Alert Flow

```
┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐     ┌─────────┐
│  PAAPI  │     │  NestJS │     │PostgreSQL│    │   FCM   │     │ Flutter │
│  Sync   │     │  API    │     │    DB    │    │         │     │   App   │
└────┬────┘     └────┬────┘     └────┬─────┘    └────┬────┘     └────┬────┘
     │               │               │               │               │
     │  Sync Deals   │               │               │               │
     │──────────────>│               │               │               │
     │               │               │               │               │
     │               │ Update Deal   │               │               │
     │               │ (price: $80→$60)              │               │
     │               │──────────────>│               │               │
     │               │               │               │               │
     │               │ Record Price  │               │               │
     │               │ History       │               │               │
     │               │──────────────>│               │               │
     │               │               │               │               │
     │               │ Find Users    │               │               │
     │               │ with Alerts   │               │               │
     │               │──────────────>│               │               │
     │               │               │               │               │
     │               │ Users: [A, B] │               │               │
     │               │<──────────────│               │               │
     │               │               │               │               │
     │               │ Queue Alerts  │               │               │
     │               │──────────────>│               │               │
     │               │               │               │               │
     │               │               │               │               │
     │  ═══ Every 5 min (Cron) ═══  │               │               │
     │               │               │               │               │
     │               │ Get Pending   │               │               │
     │               │ Alerts        │               │               │
     │               │──────────────>│               │               │
     │               │               │               │               │
     │               │ Alerts Queue  │               │               │
     │               │<──────────────│               │               │
     │               │               │               │               │
     │               │ Send Push     │               │               │
     │               │───────────────────────────────>│               │
     │               │               │               │               │
     │               │               │               │  Push Message │
     │               │               │               │──────────────>│
     │               │               │               │               │
     │               │               │               │   "Price Drop │
     │               │               │               │    Alert!"    │
     │               │               │               │──────────────>│
     │               │               │               │               │
```

---

## 7. Shared Components

### 7.1 Cross-Cutting Concerns

The following components are shared across multiple features:

```
src/shared/
  services/
    logger.service.ts           # Existing - used everywhere
  filters/
    all-exceptions.filter.ts    # Existing
  middleware/
    correlation-id.middleware.ts  # Existing
    request-logging.middleware.ts # Existing
  guards/
    throttle.guard.ts           # NEW - rate limiting
  decorators/
    current-user.decorator.ts   # NEW - extract user from JWT
    optional-auth.decorator.ts  # NEW - optional authentication
  interceptors/
    transform.interceptor.ts    # NEW - response transformation
```

### 7.2 Shared Flutter Components

```
lib/
  core/
    services/
      api_client.dart           # Existing - add auth header interceptor
      analytics_service.dart    # Existing - enhance
      push_notification_service.dart  # NEW
      secure_storage_service.dart     # NEW
      deep_link_service.dart          # NEW
    providers/
      service_providers.dart    # Existing - add new providers
    widgets/
      loading_indicator.dart    # Shared loading states
      error_widget.dart         # Shared error display
      empty_state_widget.dart   # Shared empty states
    utils/
      debouncer.dart            # NEW - for search
      connectivity_checker.dart # NEW - for offline support
```

### 7.3 API Client Enhancement (Auth Headers)

```dart
// lib/core/services/api_client.dart (enhanced)

class ApiClient {
  final Dio dio;
  final SecureStorage secureStorage;

  ApiClient({
    required this.dio,
    required this.secureStorage,
    required String baseUrl,
  }) {
    dio.options = BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 30),
      receiveTimeout: const Duration(seconds: 30),
    );

    // Add auth interceptor
    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final token = await secureStorage.read('access_token');
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (error, handler) async {
          if (error.response?.statusCode == 401) {
            // Try to refresh token
            final refreshed = await _refreshToken();
            if (refreshed) {
              // Retry the request
              return handler.resolve(await _retry(error.requestOptions));
            }
          }
          return handler.next(error);
        },
      ),
    );
  }

  Future<bool> _refreshToken() async {
    final refreshToken = await secureStorage.read('refresh_token');
    if (refreshToken == null) return false;

    try {
      final response = await dio.post('/auth/refresh', data: {
        'refreshToken': refreshToken,
      });

      final newAccessToken = response.data['accessToken'];
      await secureStorage.write('access_token', newAccessToken);
      return true;
    } catch (e) {
      // Refresh failed, user needs to re-authenticate
      await secureStorage.deleteAll();
      return false;
    }
  }
}
```

---

## 8. Database Migration Strategy

### 8.1 Migration Order

Migrations should be applied in the following order to respect foreign key dependencies:

```
1. users                    (no dependencies)
2. user_sessions            (depends on users)
3. saved_deals              (depends on users, deals)
4. user_fcm_tokens          (depends on users)
5. analytics_events         (depends on users, deals - nullable)
6. analytics_daily_stats    (depends on deals)
7. price_history            (depends on deals)
8. price_alerts_queue       (depends on users, deals)
9. deals (ALTER)            (add search_vector column)
```

### 8.2 TypeORM Migration Files

```typescript
// migrations/1706000001-CreateUsersTable.ts
export class CreateUsersTable1706000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE,
        email_verified BOOLEAN DEFAULT FALSE,
        password_hash VARCHAR(255),
        google_id VARCHAR(255) UNIQUE,
        apple_id VARCHAR(255) UNIQUE,
        display_name VARCHAR(100),
        avatar_url VARCHAR(500),
        notification_preferences JSONB DEFAULT '{"push": true, "email": true, "priceAlerts": true}'::jsonb,
        last_login_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        is_active BOOLEAN DEFAULT TRUE
      )
    `);

    await queryRunner.query(`CREATE INDEX idx_users_email ON users(email)`);
    await queryRunner.query(`CREATE INDEX idx_users_google_id ON users(google_id)`);
    await queryRunner.query(`CREATE INDEX idx_users_apple_id ON users(apple_id)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE users`);
  }
}
```

### 8.3 Rollback Strategy

Each migration includes a `down` method for rollback. In case of deployment issues:

```bash
# Rollback last migration
npm run typeorm migration:revert

# Rollback to specific migration
npm run typeorm migration:revert -- -t 1706000005
```

---

## 9. Security Considerations

### 9.1 Authentication Security

| Concern | Mitigation |
|---------|------------|
| Token theft | Short-lived access tokens (15 min), secure storage on client |
| Refresh token theft | Refresh tokens bound to device, single use with rotation |
| Brute force | Rate limiting on auth endpoints (10 req/min) |
| OAuth token validation | Always verify tokens with provider (Google/Apple) |

### 9.2 API Security

| Concern | Mitigation |
|---------|------------|
| SQL Injection | TypeORM parameterized queries, input validation |
| XSS | Input sanitization, CSP headers |
| CSRF | JWT in Authorization header (not cookies) |
| Rate limiting | Global rate limit (100 req/min), stricter on auth |

### 9.3 Data Privacy

| Data Type | Protection |
|-----------|------------|
| User emails | Encrypted at rest, never logged |
| OAuth tokens | Never stored on backend |
| Analytics data | Anonymized after 90 days |
| FCM tokens | Deleted on logout |

### 9.4 Environment Variables (New)

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Apple Sign-In
APPLE_CLIENT_ID=your-apple-client-id
APPLE_TEAM_ID=your-apple-team-id
APPLE_KEY_ID=your-apple-key-id
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Firebase (FCM)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# JWT
JWT_SECRET=your-jwt-secret-min-32-chars
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=30d
```

---

## 10. Testing Strategy

### 10.1 Backend Testing

**Unit Tests:**
```typescript
// src/modules/search/search.service.spec.ts
describe('SearchService', () => {
  describe('search', () => {
    it('should return deals matching search query', async () => {
      const result = await service.search({ q: 'headphones', page: 1, limit: 10 });
      expect(result.data).toHaveLength(3);
      expect(result.data[0].title).toContain('headphones');
    });

    it('should filter by category when provided', async () => {
      const result = await service.search({ q: 'sale', category: 'Electronics' });
      result.data.forEach(deal => {
        expect(deal.category).toBe('Electronics');
      });
    });
  });
});
```

**Integration Tests:**
```typescript
// test/search.e2e-spec.ts
describe('SearchController (e2e)', () => {
  it('/deals/search (GET) - returns paginated results', () => {
    return request(app.getHttpServer())
      .get('/deals/search?q=laptop&limit=5')
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.total).toBeGreaterThanOrEqual(0);
        expect(res.body.page).toBe(1);
      });
  });
});
```

### 10.2 Flutter Testing

**Unit Tests:**
```dart
// test/features/search/search_provider_test.dart
void main() {
  group('SearchNotifier', () {
    late MockSearchRepository mockRepository;
    late SearchNotifier notifier;

    setUp(() {
      mockRepository = MockSearchRepository();
      notifier = SearchNotifier(repository: mockRepository);
    });

    test('search updates state to loading then success', () async {
      when(mockRepository.search(any)).thenAnswer(
        (_) async => Result.success(SearchResult(deals: [testDeal], total: 1)),
      );

      await notifier.search('headphones');

      expect(notifier.state, isA<SearchSuccess>());
      expect((notifier.state as SearchSuccess).results, hasLength(1));
    });
  });
}
```

**Widget Tests:**
```dart
// test/features/search/search_page_test.dart
void main() {
  testWidgets('SearchPage shows results when search succeeds', (tester) async {
    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          searchProvider.overrideWith((ref) => FakeSearchNotifier()),
        ],
        child: MaterialApp(home: SearchPage()),
      ),
    );

    await tester.enterText(find.byType(TextField), 'laptop');
    await tester.pump(const Duration(milliseconds: 300));
    await tester.pumpAndSettle();

    expect(find.byType(DealCard), findsWidgets);
  });
}
```

### 10.3 Test Coverage Requirements

| Module | Minimum Coverage |
|--------|-----------------|
| Auth | 90% |
| Search | 85% |
| Analytics | 80% |
| Alerts | 85% |
| Sharing | 80% |

---

## Appendix A: Implementation Timeline

```
Week 1-2: User Authentication
  - Backend: Users module, OAuth strategies, JWT tokens
  - Flutter: Auth providers, secure storage, login UI
  - Testing: Auth flow integration tests

Week 3: Click Tracking Analytics
  - Backend: Analytics module, event tracking
  - Flutter: Enhanced analytics service
  - Admin: Dashboard widgets (basic)

Week 4-5: Working Search
  - Backend: Search module, full-text indexing
  - Flutter: Search providers, UI components
  - Testing: Search accuracy tests

Week 6: Deal Sharing
  - Backend: Share link generation
  - Flutter: Native share integration, deep links
  - Testing: Share flow tests

Week 7-8: Price Drop Alerts
  - Backend: Price tracking, FCM integration, cron jobs
  - Flutter: Push notification handling
  - Testing: Alert flow tests

Week 9: Integration & Polish
  - End-to-end testing
  - Performance optimization
  - Documentation
```

---

## Appendix B: Dependencies to Add

### Backend (package.json)

```json
{
  "dependencies": {
    "firebase-admin": "^12.0.0",
    "@nestjs/schedule": "^4.0.0",
    "google-auth-library": "^9.0.0",
    "apple-signin-auth": "^1.7.0"
  }
}
```

### Flutter (pubspec.yaml)

```yaml
dependencies:
  google_sign_in: ^6.2.0
  sign_in_with_apple: ^6.0.0
  firebase_core: ^3.0.0
  firebase_messaging: ^15.0.0
  flutter_secure_storage: ^9.0.0
  share_plus: ^10.0.0
  app_links: ^6.0.0
```

---

## Appendix C: Monitoring & Observability

### Key Metrics to Track

| Metric | Source | Alert Threshold |
|--------|--------|-----------------|
| Auth success rate | API logs | < 95% |
| Search latency P95 | API logs | > 500ms |
| FCM delivery rate | Firebase console | < 90% |
| API error rate | Application logs | > 1% |
| Database connections | PostgreSQL | > 80% pool |

### Logging Standards

All new modules should follow existing logging patterns:

```typescript
this.logger.debug(`Operation details`, 'ModuleName');
this.logger.log(`Significant event`, 'ModuleName');
this.logger.warn(`Warning condition`, 'ModuleName');
this.logger.error(`Error message`, error.stack, 'ModuleName');
```

---

**Document End**

*This architecture document should be reviewed and updated as implementation progresses. Major architectural decisions should be discussed with the team before implementation.*
