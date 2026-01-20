# Social Media Integration Feature Plan

## Overview
Add a new "Social Media" section to the Admin Dashboard with sub-tabs for Twitter/X, Facebook, Instagram, and TikTok to post deals directly to these platforms.

---

## Phase 1: Twitter/X Integration (First Priority)

### 1.1 Backend Implementation

#### New Module: `src/modules/social-media/`
```
src/modules/social-media/
├── social-media.module.ts
├── social-media.controller.ts
├── social-media.service.ts
├── twitter/
│   ├── twitter.service.ts
│   └── twitter.config.ts
├── entities/
│   └── social-post.entity.ts
├── repositories/
│   ├── social-post.repository.interface.ts
│   └── typeorm-social-post.repository.ts
├── dto/
│   ├── create-twitter-post.dto.ts
│   └── post-response.dto.ts
└── types/
    └── social-platform.enum.ts
```

#### Entity: SocialPost
```typescript
@Entity('social_posts')
export class SocialPost {
  id: string;              // UUID
  platform: SocialPlatform; // TWITTER, FACEBOOK, INSTAGRAM, TIKTOK
  dealId: string;          // Reference to deal
  postContent: string;     // The tweet/post text
  postId?: string;         // Platform's post ID after publishing
  postUrl?: string;        // URL to the published post
  status: PostStatus;      // DRAFT, POSTED, FAILED, DELETED
  scheduledAt?: Date;      // For scheduled posts (future)
  postedAt?: Date;
  errorMessage?: string;   // If posting failed
  createdAt: Date;
  updatedAt: Date;
}
```

#### API Endpoints
```
POST   /social-media/twitter/post        - Post a deal to Twitter
POST   /social-media/twitter/preview     - Generate preview of tweet
GET    /social-media/posts               - List all social posts
GET    /social-media/posts/:dealId       - Get posts for a specific deal
DELETE /social-media/twitter/:postId     - Delete a tweet
```

#### Twitter API Integration
- Use Twitter API v2 (OAuth 2.0)
- Required scopes: `tweet.read`, `tweet.write`, `users.read`
- Environment variables needed:
  ```
  TWITTER_API_KEY=xxx
  TWITTER_API_SECRET=xxx
  TWITTER_ACCESS_TOKEN=xxx
  TWITTER_ACCESS_SECRET=xxx
  TWITTER_BEARER_TOKEN=xxx
  ```

#### Tweet Template
```
🔥 {DEAL_TITLE}

💰 ${PRICE} (was ${ORIGINAL_PRICE})
📉 {DISCOUNT}% OFF!

{COUPON_CODE ? "🎟️ Use code: " + COUPON_CODE : ""}

🛒 {AFFILIATE_LINK}

#huntDeals
```

#### Features Confirmed
- ✅ Editable tweets (admins can modify auto-generated text)
- ✅ Product images attached to tweets
- ✅ Scheduled posting with date/time picker
- ✅ Immediate posting option

---

### 1.2 Admin Dashboard Implementation

#### New Pages Structure
```
src/pages/social-media/
├── index.tsx              - Main Social Media page with tabs
├── twitter/
│   ├── index.tsx          - Twitter tab content
│   ├── PostComposer.tsx   - Tweet composition component
│   └── PostHistory.tsx    - List of past tweets
├── facebook/
│   └── index.tsx          - Placeholder for Phase 2
├── instagram/
│   └── index.tsx          - Placeholder for Phase 2
└── tiktok/
    └── index.tsx          - Placeholder for Phase 2
```

#### Twitter Tab Features
1. **Deal Selector**: Dropdown to select an active deal to post
2. **Tweet Preview**:
   - Auto-generated tweet from deal data
   - Character count (280 limit)
   - Editable text field
3. **Post Button**: Post immediately to Twitter
4. **Post History Table**:
   - Columns: Deal, Tweet Content, Status, Posted At, Actions
   - View tweet link, Delete option

#### UI Mockup (Twitter Tab)
```
┌─────────────────────────────────────────────────────────────┐
│  Social Media                                               │
├─────────────────────────────────────────────────────────────┤
│  [Twitter] [Facebook] [Instagram] [TikTok]                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─ Post New Tweet ─────────────────────────────────────┐   │
│  │                                                       │   │
│  │  Select Deal: [Dropdown - Active Deals List     ▼]   │   │
│  │                                                       │   │
│  │  ┌─────────────┐  Tweet Content (editable):          │   │
│  │  │             │  ┌─────────────────────────────────┐ │   │
│  │  │   [IMAGE]   │  │ 🔥 43" 4K UHD Digital Signage  │ │   │
│  │  │   Preview   │  │ Display                         │ │   │
│  │  │             │  │                                 │ │   │
│  │  │             │  │ 💰 $645.00 (was $1289.00)      │ │   │
│  │  └─────────────┘  │ 📉 50% OFF!                    │ │   │
│  │                    │                                 │ │   │
│  │  ☑ Include Image   │ 🎟️ Use code: GQH5NJ6X          │ │   │
│  │                    │                                 │ │   │
│  │                    │ 🛒 https://amzn.to/49LUj1B     │ │   │
│  │                    │                                 │ │   │
│  │                    │ #huntDeals                     │ │   │
│  │                    └─────────────────────────────────┘ │   │
│  │                                                       │   │
│  │  Characters: 165/280                                  │   │
│  │                                                       │   │
│  │  Schedule Post:                                       │   │
│  │  ○ Post Now    ● Schedule for: [📅 Date] [🕐 Time]   │   │
│  │                                                       │   │
│  │  [Post to Twitter 🐦]    [Schedule Tweet 📅]         │   │
│  │                                                       │   │
│  └───────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─ Posts History ──────────────────────────────────────┐   │
│  │ Deal           │ Status    │ Scheduled/Posted│Actions│   │
│  │ 43" 4K Display │ ✓ Posted  │ 2 hours ago     │ 🔗 🗑️│   │
│  │ EV Charger     │ 📅 Queued │ Tomorrow 9:00AM │ ✏️ 🗑️│   │
│  │ Weighted Vest  │ ✗ Failed  │ 1 day ago       │ 🔄 🗑️│   │
│  └───────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### 1.3 Implementation Steps

#### Backend (NestJS)
1. Create `SocialMediaModule` with Twitter service
2. Create `SocialPost` entity and repository
3. Implement Twitter API integration using `twitter-api-v2` package
4. Create endpoints for posting, preview, and history
5. Add environment variable validation

#### Admin Dashboard (React)
1. Add "Social Media" resource to App.tsx
2. Create Social Media page with Ant Design Tabs
3. Implement Twitter tab with:
   - Deal selector dropdown
   - Tweet composer with preview
   - Character counter
   - Post button with loading state
   - Post history table
4. Add placeholder tabs for other platforms

---

## Phase 2: Future Platforms (Not in scope for now)

### Facebook Integration
- Facebook Graph API
- Post to Page (not personal profile)
- Image support

### Instagram Integration
- Instagram Graph API (Business account required)
- Image required for posts
- Story support

### TikTok Integration
- TikTok for Business API
- Video content required
- May need different approach (link in bio)

---

## Files to Create/Modify

### Backend
| Action | File |
|--------|------|
| CREATE | `src/modules/social-media/social-media.module.ts` |
| CREATE | `src/modules/social-media/social-media.controller.ts` |
| CREATE | `src/modules/social-media/social-media.service.ts` |
| CREATE | `src/modules/social-media/twitter/twitter.service.ts` |
| CREATE | `src/modules/social-media/entities/social-post.entity.ts` |
| CREATE | `src/modules/social-media/repositories/*.ts` |
| CREATE | `src/modules/social-media/dto/*.ts` |
| CREATE | `src/modules/social-media/types/social-platform.enum.ts` |
| MODIFY | `src/app.module.ts` - Register SocialMediaModule |

### Admin Dashboard
| Action | File |
|--------|------|
| CREATE | `src/pages/social-media/index.tsx` |
| CREATE | `src/pages/social-media/twitter/index.tsx` |
| CREATE | `src/pages/social-media/twitter/PostComposer.tsx` |
| CREATE | `src/pages/social-media/twitter/PostHistory.tsx` |
| CREATE | `src/pages/social-media/facebook/index.tsx` (placeholder) |
| CREATE | `src/pages/social-media/instagram/index.tsx` (placeholder) |
| CREATE | `src/pages/social-media/tiktok/index.tsx` (placeholder) |
| MODIFY | `src/App.tsx` - Add social-media resource and routes |

---

## Environment Variables Required

```env
# Twitter API Credentials
TWITTER_API_KEY=your_api_key
TWITTER_API_SECRET=your_api_secret
TWITTER_ACCESS_TOKEN=your_access_token
TWITTER_ACCESS_SECRET=your_access_secret
TWITTER_BEARER_TOKEN=your_bearer_token
```

---

## Dependencies to Add

### Backend
```bash
npm install twitter-api-v2
```

### Admin Dashboard
None required (using existing Ant Design components)

---

## Questions for You

1. **Twitter Account**: Do you have a Twitter Developer account with API access? (Required for posting)

2. **Tweet Customization**: Should admins be able to edit the auto-generated tweet before posting, or should it be fixed template only?

3. **Hashtags**: Any specific hashtags you want to always include? Current suggestion: `#deals #savings #huntdeals`

4. **Image Posting**: Should tweets include the deal's product image, or text-only for now?

5. **Scheduled Posts**: Do you want to add scheduled posting feature in Phase 1, or keep it simple with immediate posting only?

---

## Approval Needed

Please review this plan and let me know:
- [ ] Approve to proceed with implementation
- [ ] Any modifications needed
- [ ] Answers to the questions above
