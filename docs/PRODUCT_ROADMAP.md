# Hunt Deals - Product Roadmap & Feature Analysis

## Executive Summary

Hunt Deals is a deal aggregation platform with a three-component architecture (Flutter PWA, NestJS Backend, React-Admin Dashboard). The platform currently offers deal discovery through grid/list views and a TikTok-style "Flip" interface, with Amazon PAAPI integration for deal sourcing. This document outlines strategic enhancements to increase user engagement, retention, and affiliate revenue.

**Current State**: MVP with core deal discovery features operational
**Target State**: Engaged community-driven deal platform with personalized recommendations and gamification

---

## 1. Current Product Analysis

### 1.1 Existing Features Inventory

| Component | Feature | Status | Maturity |
|-----------|---------|--------|----------|
| Mobile App | Deal Feed (Grid/List) | Operational | Good |
| Mobile App | Flip View (TikTok-style) | Operational | Good |
| Mobile App | Save Deals (Wishlist) | Operational | Basic |
| Mobile App | Notifications | Operational | Basic |
| Mobile App | Category Filtering | Operational | Basic |
| Mobile App | Search | Partial | UI only, not functional |
| Mobile App | User Authentication | Partial | UI only, not implemented |
| Backend | Deal CRUD API | Operational | Good |
| Backend | Amazon PAAPI Sync | Operational | Good |
| Backend | Pending Deals Workflow | Operational | Good |
| Backend | Social Media Posting | Operational | Good |
| Backend | Price Tracking | Not Implemented | - |
| Admin | Deal Management | Operational | Good |
| Admin | Deal Sync | Operational | Good |
| Admin | Twitter Integration | Operational | Good |

### 1.2 User Flow Analysis

```
Current User Journey:
[App Launch] -> [Feed Page] -> [Browse Deals] -> [Save or View Deal]
                    |               |
                    v               v
              [Flip View]    [Affiliate Link]
                    |
                    v
            [Swipe Through]
```

### 1.3 Identified Gaps & Opportunities

**Critical Gaps:**
1. **No User Authentication** - Profile page is UI-only; no actual auth implementation
2. **Search Not Functional** - Search bar exists but doesn't perform actual search
3. **No Price History Tracking** - Price trend UI exists but backend doesn't persist history
4. **No User Engagement Features** - Likes/comments shown but not functional
5. **No Push Notifications** - In-app notifications only, no push
6. **Limited Personalization** - No user preferences or recommendation engine

**Revenue Opportunities:**
1. Limited affiliate click tracking/analytics
2. No email capture for deal alerts
3. No referral program
4. Single retailer focus (Amazon only)

**Competitive Weaknesses:**
1. No price alerts for saved items
2. No deal sharing features
3. No community/social features
4. No deal submission by users

---

## 2. Proposed Features & Enhancements

### 2.1 Engagement Features

| Feature | Description | Business Value |
|---------|-------------|----------------|
| **Working Search** | Full-text search with filters | Increases deal discovery, reduces bounce |
| **Price Alerts** | Notify when saved deals drop in price | Drives return visits, affiliate clicks |
| **Deal Sharing** | Share deals via social/messaging | Viral growth, new user acquisition |
| **User Comments** | Community discussion on deals | Engagement, trust signals |
| **Voting System** | Upvote/downvote deals | Community curation, quality signals |
| **Deal Submission** | Users submit deals for approval | Content generation, community building |

### 2.2 Retention Features

| Feature | Description | Business Value |
|---------|-------------|----------------|
| **User Authentication** | Google/Apple sign-in + email | User identity, personalization |
| **Push Notifications** | FCM/APNs for price drops, new deals | Re-engagement, MAU increase |
| **Daily Digest Email** | Personalized deal digest | Email as re-engagement channel |
| **Saved Searches** | Alert when matching deals appear | Targeted re-engagement |
| **Gamification** | Points, badges, streaks | Habit formation, daily engagement |

### 2.3 Monetization Features

| Feature | Description | Business Value |
|---------|-------------|----------------|
| **Multi-Retailer Support** | Walmart, Target, Best Buy | More inventory, higher conversion |
| **Click Tracking Analytics** | Full funnel analytics | Optimize revenue per user |
| **Referral Program** | Reward users for referrals | CAC reduction, viral growth |
| **Premium Features** | Ad-free, early access | Direct revenue stream |
| **Email Subscription** | Capture emails for marketing | Owned audience, multi-channel |

### 2.4 Quality of Life Improvements

| Feature | Description | Business Value |
|---------|-------------|----------------|
| **Offline Mode** | Cache deals for offline browsing | Better UX, reduces data usage |
| **Dark Mode** | System/manual dark theme | User preference, accessibility |
| **Accessibility (a11y)** | Screen reader, high contrast | Broader audience, compliance |
| **Performance Optimization** | Image lazy loading, caching | Better UX, lower bounce |

---

## 3. Product Roadmap

### Phase 1: MVP Completion (0-4 weeks)
Focus: Complete core functionality gaps

| Priority | Feature | Effort | Dependencies |
|----------|---------|--------|--------------|
| P0 | Working Search Implementation | M | None |
| P0 | User Authentication (Google/Apple) | L | None |
| P0 | Basic Click Tracking Analytics | S | None |
| P1 | Price History Tracking | M | None |
| P1 | Functional Categories Page | S | None |

### Phase 2: Engagement & Retention (5-10 weeks)
Focus: Drive daily active usage

| Priority | Feature | Effort | Dependencies |
|----------|---------|--------|--------------|
| P0 | Push Notifications | M | Auth |
| P0 | Price Drop Alerts | M | Price History |
| P1 | Deal Sharing | S | None |
| P1 | Voting System (Upvote/Downvote) | M | Auth |
| P2 | User Comments | L | Auth |

### Phase 3: Community & Growth (11-18 weeks)
Focus: Build community, viral growth

| Priority | Feature | Effort | Dependencies |
|----------|---------|--------|--------------|
| P0 | User Deal Submission | L | Auth |
| P0 | Referral Program | M | Auth |
| P1 | Daily Digest Email | M | Auth, Email service |
| P1 | Gamification (Points/Badges) | L | Auth |
| P2 | Multi-Retailer Support | XL | Backend refactor |

### Phase 4: Monetization & Scale (19-26 weeks)
Focus: Revenue optimization, scale

| Priority | Feature | Effort | Dependencies |
|----------|---------|--------|--------------|
| P0 | Advanced Analytics Dashboard | L | Click Tracking |
| P1 | Premium/Pro Features | M | Auth |
| P1 | A/B Testing Framework | L | Analytics |
| P2 | Personalized Recommendations | XL | User data, ML |

---

## 4. RICE Prioritization

### RICE Scoring Framework

```
RICE Score = (Reach x Impact x Confidence) / Effort

Reach: Number of users affected per quarter (1-100 scale)
Impact: Effect on key metrics (3=Massive, 2=High, 1=Medium, 0.5=Low, 0.25=Minimal)
Confidence: How sure we are (100%=High, 80%=Medium, 50%=Low)
Effort: Person-weeks required
```

### Feature Prioritization Matrix

| Feature | Reach | Impact | Confidence | Effort (weeks) | RICE Score | Priority |
|---------|-------|--------|------------|----------------|------------|----------|
| Working Search | 90 | 2 | 100% | 2 | 90.0 | P0 |
| Price Drop Alerts | 70 | 3 | 80% | 3 | 56.0 | P0 |
| User Authentication | 100 | 2 | 90% | 3 | 60.0 | P0 |
| Push Notifications | 80 | 2.5 | 80% | 3 | 53.3 | P0 |
| Deal Sharing | 60 | 2 | 80% | 1 | 96.0 | P1 |
| Voting System | 50 | 1.5 | 70% | 2 | 26.3 | P1 |
| Click Tracking | 100 | 1.5 | 90% | 1.5 | 90.0 | P0 |
| User Comments | 40 | 1 | 60% | 4 | 6.0 | P2 |
| User Deal Submission | 30 | 2 | 60% | 5 | 7.2 | P2 |
| Referral Program | 50 | 2.5 | 70% | 3 | 29.2 | P1 |
| Gamification | 40 | 1.5 | 50% | 5 | 6.0 | P2 |
| Multi-Retailer | 70 | 2 | 60% | 8 | 10.5 | P2 |
| Premium Features | 20 | 2 | 50% | 4 | 5.0 | P3 |

### Top 5 Features by RICE Score

1. **Deal Sharing** (96.0) - High impact, low effort
2. **Working Search** (90.0) - Essential functionality gap
3. **Click Tracking Analytics** (90.0) - Revenue visibility
4. **User Authentication** (60.0) - Foundation for personalization
5. **Price Drop Alerts** (56.0) - High engagement driver

---

## 5. User Stories for Top 5 Features

### 5.1 User Story: Working Search Implementation

```
## User Story: Implement Full-Text Deal Search

**As a** deal-hunting user
**I want to** search for deals by keyword, brand, or product name
**So that** I can quickly find specific deals without browsing through all items

**Acceptance Criteria:**
- [ ] Given I am on the Feed page, when I type in the search bar, then I see real-time search results filtered by my query
- [ ] Given I search for "headphones", when results load, then I see all deals containing "headphones" in title or description
- [ ] Given I have search results, when I apply a category filter, then results are filtered by both search term AND category
- [ ] Given I search for a term with no matches, when results load, then I see "No deals found" message with suggestions
- [ ] Given I am searching, when I clear the search input, then I see the full deal feed again
- [ ] Edge case: Search with special characters → sanitize input and return results
- [ ] Edge case: Very long search query (>100 chars) → truncate and search

**Priority:** P0
**Estimate:** M (2 weeks)
**Dependencies:** None

**Technical Notes:**
- Backend: Add full-text search to deals endpoint using TypeORM LIKE or pg_trgm
- Frontend: Debounce search input (300ms), show loading state
- Consider adding search analytics to track popular queries
```

### 5.2 User Story: Deal Sharing

```
## User Story: Share Deals via Social Media and Messaging

**As a** user who found a great deal
**I want to** share the deal with friends via social media or messaging apps
**So that** my friends can also benefit from the deal

**Acceptance Criteria:**
- [ ] Given I am viewing a deal in Feed or Flip, when I tap the share icon, then I see a native share sheet with sharing options
- [ ] Given I share a deal, when the recipient opens the link, then they see the deal in the app (or web fallback)
- [ ] Given I share to Twitter, when the share completes, then the post includes deal title, price, discount %, and affiliate link
- [ ] Given I share via copy link, when I paste, then the link includes proper UTM parameters for tracking
- [ ] Given I share a deal, when the share succeeds, then I see a confirmation toast
- [ ] Edge case: Sharing expired deal → show warning but allow share with "(Expired)" tag
- [ ] Edge case: No share apps installed → show "Copy Link" option only

**Priority:** P1
**Estimate:** S (1 week)
**Dependencies:** None

**Technical Notes:**
- Use Flutter share_plus package for native share sheet
- Backend: Create shareable link endpoint with UTM parameters
- Track share events in analytics (deal_shared, share_method)
- Consider deep linking for app-installed recipients
```

### 5.3 User Story: Click Tracking Analytics

```
## User Story: Track Affiliate Link Clicks and Conversions

**As a** product manager
**I want to** track when users click affiliate links and which deals drive the most clicks
**So that** I can optimize the deal feed for revenue and understand user behavior

**Acceptance Criteria:**
- [ ] Given a user taps "View Deal", when the affiliate link opens, then a click event is recorded with deal_id, user_id (if auth), timestamp
- [ ] Given clicks are tracked, when I view the admin dashboard, then I see click counts per deal, daily/weekly trends
- [ ] Given I have analytics data, when I export, then I can download CSV with all click events
- [ ] Given a deal has high impressions but low clicks, when I view analytics, then I can see CTR (click-through rate) per deal
- [ ] Given I track clicks, when I compare to affiliate network reports, then numbers align within 5% tolerance
- [ ] Edge case: User clicks same deal multiple times → count all clicks but flag as duplicate in analytics
- [ ] Edge case: Offline click (cached deal) → queue event and send when online

**Priority:** P0
**Estimate:** S (1.5 weeks)
**Dependencies:** None

**Technical Notes:**
- Backend: Create analytics endpoint POST /analytics/click
- Store in separate analytics table for fast queries
- Consider using time-series DB (InfluxDB) for scale
- Add admin dashboard widgets for visualization
- Integrate with Google Analytics 4 for cross-platform view
```

### 5.4 User Story: User Authentication

```
## User Story: Sign In with Google and Apple

**As a** returning user
**I want to** sign in with my Google or Apple account
**So that** my saved deals and preferences sync across devices

**Acceptance Criteria:**
- [ ] Given I am on the Profile page, when I tap "Sign in with Google", then I see Google OAuth flow and am signed in on success
- [ ] Given I am on the Profile page, when I tap "Sign in with Apple", then I see Apple Sign-In flow and am signed in on success
- [ ] Given I am signed in, when I save a deal, then the saved deal is associated with my account
- [ ] Given I am signed in on device A, when I sign in on device B, then I see my saved deals from device A
- [ ] Given I am signed in, when I tap "Sign Out", then my session ends and local data is cleared
- [ ] Given I was signed in, when I return to the app after a week, then I am still signed in (persistent session)
- [ ] Edge case: User cancels OAuth flow → return to Profile page with no error
- [ ] Edge case: Network error during sign-in → show "Sign-in failed, try again" with retry option

**Priority:** P0
**Estimate:** L (3 weeks)
**Dependencies:** None

**Technical Notes:**
- Backend: Implement OAuth flow with Passport.js (Google, Apple strategies)
- Backend: Create users table, link to saved_deals
- Frontend: Use google_sign_in and sign_in_with_apple packages
- Store JWT tokens securely using flutter_secure_storage
- Handle token refresh gracefully
```

### 5.5 User Story: Price Drop Alerts

```
## User Story: Get Notified When Saved Deals Drop in Price

**As a** user who saved a deal for later
**I want to** receive a notification when the price drops
**So that** I can buy at the best possible price

**Acceptance Criteria:**
- [ ] Given I have saved a deal, when the price drops by 5% or more, then I receive a push notification
- [ ] Given I receive a price drop notification, when I tap it, then I am taken directly to that deal in the app
- [ ] Given price drops occur, when I open Notifications page, then I see all recent price changes for my saved deals
- [ ] Given I no longer want alerts for a deal, when I unsave it, then I stop receiving price alerts for that item
- [ ] Given a deal I saved expires, when expiry occurs, then I receive a "Deal expired" notification
- [ ] Given multiple price drops happen, when I am notified, then notifications are batched (max 3 per hour)
- [ ] Edge case: Price increases → do not notify (or optional setting to notify on increases)
- [ ] Edge case: Price drops then increases same day → send single notification for lowest price

**Priority:** P0
**Estimate:** M (3 weeks)
**Dependencies:** User Authentication, Price History Tracking

**Technical Notes:**
- Backend: Implement price history table, track daily prices
- Backend: Cron job to compare prices and trigger notifications
- Backend: Integrate Firebase Cloud Messaging (FCM) for push
- Frontend: Handle push notification permissions, deep linking
- Consider user settings: alert threshold (5%, 10%, 20%)
```

---

## 6. Success Metrics & KPIs

### Primary Metrics

| Metric | Current | Phase 1 Target | Phase 2 Target | Phase 4 Target |
|--------|---------|----------------|----------------|----------------|
| MAU (Monthly Active Users) | Baseline | +20% | +50% | +150% |
| DAU/MAU Ratio | TBD | 15% | 25% | 35% |
| Affiliate Click Rate | TBD | 5% | 8% | 12% |
| Average Session Duration | TBD | 3 min | 5 min | 7 min |
| User Retention (D7) | TBD | 20% | 35% | 45% |
| Deals Saved per User | TBD | 3 | 8 | 15 |

### Secondary Metrics

| Metric | Description | Target |
|--------|-------------|--------|
| Search Usage Rate | % of sessions with search | 40% |
| Notification Opt-in Rate | % of users enabling push | 60% |
| Share Rate | % of users who share deals | 10% |
| Auth Conversion Rate | % of users who sign up | 30% |
| Price Alert Engagement | % who click price drop notifications | 25% |

---

## 7. Risks & Mitigations

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Amazon PAAPI rate limits | Medium | High | Implement caching, request queuing |
| Push notification delivery issues | Medium | Medium | Use reliable FCM, add in-app fallback |
| Database performance with price history | Low | High | Use time-series DB, implement archiving |
| OAuth provider outages | Low | Medium | Support multiple providers, email fallback |

### Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Low authentication adoption | Medium | High | Make auth optional, show value (sync, alerts) |
| Notification fatigue | Medium | Medium | User controls, smart batching, relevance tuning |
| Amazon ToS changes | Low | High | Diversify to other affiliate programs |
| Competition from established players | High | Medium | Focus on UX, community features as differentiator |

---

## 8. Open Questions

1. **Monetization Strategy**: Should we pursue premium features, or focus on affiliate volume?
2. **Multi-Retailer Priority**: Which retailers should we add first (Walmart, Target, Best Buy)?
3. **Community Moderation**: How will we moderate user-submitted deals and comments?
4. **International Expansion**: Should we localize for UK, EU, or other markets?
5. **Data Privacy**: What is our strategy for GDPR/CCPA compliance with user tracking?

---

## 9. Appendix

### A. Technical Architecture for Key Features

**Search Implementation:**
```
[Search Input] -> [Debounced Query] -> GET /deals?search=query&category=X
                                              |
                                     [TypeORM: ILIKE %query%]
                                              |
                                     [Paginated Results]
```

**Price Alert System:**
```
[Cron Job: Daily 6am] -> [Fetch all saved deals with price history]
                                    |
                         [Compare today vs yesterday]
                                    |
                         [Price dropped > 5%?]
                                    |
                    [Yes] -> [Create notification]
                                    |
                         [Send FCM push to user]
```

### B. Competitive Analysis Summary

| Feature | Hunt Deals | Slickdeals | Honey | CamelCamelCamel |
|---------|------------|------------|-------|-----------------|
| Deal Discovery | Yes | Yes | No | No |
| Price Alerts | Planned | Yes | Yes | Yes |
| Browser Extension | No | Yes | Yes | Yes |
| Community | Planned | Yes | No | No |
| Multi-Retailer | Planned | Yes | Yes | No (Amazon only) |
| Mobile App | Yes (PWA) | Yes | Yes | No |

### C. Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-20 | Product Team | Initial roadmap |

