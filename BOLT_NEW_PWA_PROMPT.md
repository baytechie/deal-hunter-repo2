# 🚀 Bolt.new PWA Prompt - DealHunter Ecosystem

**Use this prompt in Bolt.new to build a Progressive Web App for the DealHunter backend.**

---

## 📋 Complete Bolt.new Prompt

Copy and paste this entire prompt into Bolt.new:

```
Build a Progressive Web App (PWA) for a deal discovery platform called "DealHunter" 
that connects to an existing NestJS backend API.

## BACKEND API DETAILS

**Base URL:** http://localhost:3000/api

### API Endpoints

1. **GET /deals**
   - Get all deals with pagination and filtering
   - Query Parameters:
     - page: number (default: 1)
     - limit: number (default: 10, max: 100)
     - category: string (optional filter)
     - isHot: boolean (optional filter for trending deals)
     - isFeatured: boolean (optional filter for featured deals)
     - minDiscount: number (optional minimum discount %)
     - maxPrice: number (optional maximum price filter)
   - Response: { data: Deal[], total: number, page: number, totalPages: number }

2. **GET /deals/top**
   - Get top deals sorted by highest discount percentage
   - Query Parameters:
     - limit: number (default: 10)
   - Response: Deal[]

3. **GET /deals/hot**
   - Get hot/trending deals (marked as isHot: true)
   - Query Parameters:
     - limit: number (default: 10)
   - Response: Deal[]

4. **GET /deals/featured**
   - Get featured/curated deals (marked as isFeatured: true)
   - Query Parameters:
     - limit: number (default: 10)
   - Response: Deal[]

5. **GET /deals/categories**
   - Get all available deal categories
   - Response: string[] (e.g., ["Electronics", "Fashion", "Home & Garden", ...])

6. **GET /deals/:id**
   - Get single deal by UUID
   - Response: Deal

### Deal Data Model

Each deal has this structure:
{
  id: string (UUID),
  title: string (5-100 characters),
  description: string (20-1000 characters),
  price: number (sale price in decimal),
  originalPrice: number (original price in decimal),
  discountPercentage: number (auto-calculated, 0-100%),
  imageUrl: string (CDN URL: https://...jpg|png|gif|webp),
  affiliateLink: string (https://... - clickable partner link),
  expiryDate: date (when deal expires),
  isHot: boolean (trending deal flag),
  isFeatured: boolean (editor-selected deal flag),
  category: string (electronics, fashion, etc.),
  createdAt: date,
  updatedAt: date
}

## PWA REQUIREMENTS

### Core Features (Must Have)
1. **Home Feed**
   - Hero banner with featured deals
   - Horizontal scroll carousel: "Top Deals" (sorted by discount)
   - Horizontal scroll carousel: "Hot Deals" (trending)
   - Grid view: "All Deals" with pagination (infinite scroll preferred)
   - Search functionality (search by title/description)

2. **Deal Details Page**
   - Full deal information (title, description, images)
   - Original price ~~$199~~ vs Sale price $99 (bold green)
   - Discount percentage badge (red): "50% OFF"
   - Category badge
   - Expiry countdown timer (red if <24 hours)
   - "Open Deal" button (opens affiliateLink in new tab)
   - Share buttons (copy link, social media)
   - Related deals carousel

3. **Category Browse**
   - Sidebar/filter: All categories with count badges
   - Grid/list view toggle
   - Sort options: "Most Discounted", "Newest", "Expiring Soon"
   - Filter by price range slider
   - Filter by discount range

4. **Hot Deals Page**
   - Dedicated page for trending deals
   - Real-time badge showing "🔥 Trending"
   - Sort by most recent first

5. **Top Deals Page**
   - Dedicated page for highest discounts
   - Sort by discount percentage descending
   - Show: Original → Sale price progression

### Design & UX (Must Have)
1. **Mobile-First Responsive Design**
   - Perfect on mobile (iPhone SE - 375px width)
   - Great on tablet (iPad - 768px)
   - Full featured on desktop (1920px+)
   
2. **Color Scheme**
   - Primary: #2563EB (blue)
   - Accent: #DC2626 (red) - for discounts/sale prices
   - Success: #16A34A (green) - for savings
   - Background: #F9FAFB (light gray)
   - Text: #1F2937 (dark gray)
   - Hot/Trending: #FF6B35 (orange-red) with 🔥 emoji
   
3. **Component Library**
   - Use Tailwind CSS for styling (with custom config for colors)
   - Pre-built components:
     - DealCard (compact: image, title, prices, category, hot badge, click handler)
     - DealCarousel (horizontal scrollable carousel)
     - FilterSidebar (categories, price range, discount range)
     - PriceDisplay (shows ~~original~~ → sale + discount %)
     - ExpiryBadge (countdown timer, color changes <24h)
     - CategoryBadge (colored pill badge)

4. **Typography**
   - Hero titles: 28px (mobile) → 48px (desktop), bold, dark gray
   - Deal titles: 18px, bold
   - Prices: 16px (sale) vs 12px (original, struck)
   - Descriptions: 14px, light gray
   - Small text: 12px

### PWA Features (Must Have)
1. **Installable**
   - Web app manifest (manifest.json) with icons
   - Install prompt on mobile
   - App name: "DealHunter"
   - App icon: Create a simple deal-themed icon (or use placeholder)
   - Theme colors: Blue (#2563EB)

2. **Offline Support**
   - Service worker that caches:
     - Homepage and main routes
     - Recently viewed deals (localStorage)
     - Deal cards images (cache 20 most recent)
   - Offline fallback page: "You're offline. Recently viewed deals are available."
   - Last sync timestamp shown

3. **Fast Loading**
   - Image optimization: Use next/image or similar
   - Lazy load images on scroll
   - Code splitting by route
   - Target: Lighthouse score >90

4. **Network Optimization**
   - Cache API responses (1 hour TTL for deals list, 24h for single deal)
   - Retry failed requests with exponential backoff
   - Show "Syncing..." indicator on stale data

### Navigation & UX Patterns (Must Have)
1. **Navigation Bar** (sticky at top)
   - Logo "DealHunter" on left
   - Search bar (center, icon search, on mobile becomes fullscreen modal)
   - Icons on right: Favorites ❤️ (saved deals), Settings ⚙️
   
2. **Bottom Tab Navigation** (mobile)
   - Home 🏠
   - Top Deals 🔥
   - Categories 🏷️
   - Hot Deals 💥
   - Menu ≡

3. **Breadcrumb Navigation** (desktop/tablet)
   - Home > Categories > Category Name > Deal Title

4. **Loading States**
   - Skeleton loaders for deal cards
   - Shimmer animation while fetching
   - Loading spinner for infinite scroll

5. **Empty States**
   - "No deals found" with illustration
   - "No deals in this category" message
   - Suggestions to browse other categories

### Optional Features (Nice to Have)
1. **Favorites/Saved Deals**
   - Heart icon on deal cards (❤️ when saved)
   - Favorites page showing saved deals
   - Persist to localStorage

2. **Notifications**
   - Browser notifications for deals expiring soon (<24h)
   - Ask permission on first visit
   - "Deal expires soon: Samsung TV - 50% off"

3. **Analytics**
   - Track: page views, deal clicks, deal shares
   - Track: most viewed categories, trending searches
   - Send to backend analytics endpoint (optional)

4. **Deep Linking**
   - Share deal URLs: /deals/[id]
   - Share category URLs: /categories/[name]
   - Share filters: /deals?category=electronics&minDiscount=50

5. **User Preferences**
   - Theme toggle (light/dark mode)
   - Preferred categories (quick filter)
   - Price range preferences
   - Email subscription (optional)

## TECHNICAL STACK

- **Framework:** React 18 with TypeScript (or Next.js 14+ preferred for better PWA/SSR)
- **Styling:** Tailwind CSS v3 with custom config
- **State Management:** React Context + useReducer (or TanStack Query for server state)
- **HTTP Client:** Axios or Fetch API with retry logic
- **PWA:** next-pwa (if using Next.js) or create-react-app PWA setup
- **Routing:** React Router v6 (or Next.js router)
- **Build Tool:** Vite (fast) or Next.js (full-featured)
- **Dev Server:** Expose on http://localhost:3001 (port 3001, not 3000)

## FOLDER STRUCTURE

src/
├── components/
│   ├── DealCard.tsx
│   ├── DealCarousel.tsx
│   ├── FilterSidebar.tsx
│   ├── PriceDisplay.tsx
│   ├── ExpiryBadge.tsx
│   ├── CategoryBadge.tsx
│   ├── Navigation.tsx
│   ├── BottomTabs.tsx
│   └── SearchBar.tsx
├── pages/ (or routes/)
│   ├── Home.tsx
│   ├── DealDetails.tsx
│   ├── CategoryBrowse.tsx
│   ├── HotDeals.tsx
│   ├── TopDeals.tsx
│   └── Favorites.tsx
├── services/
│   ├── api.ts (axios instance with interceptors)
│   ├── dealsService.ts (API calls)
│   └── storageService.ts (localStorage for offline)
├── hooks/
│   ├── useFetchDeals.ts
│   ├── useFavoriteDeal.ts
│   ├── useSearchDeals.ts
│   └── useExpiryCountdown.ts
├── utils/
│   ├── formatPrice.ts
│   ├── formatDate.ts
│   ├── calculateTimeRemaining.ts
│   └── constants.ts (API URLs, categories list)
├── styles/
│   ├── globals.css (Tailwind)
│   └── tailwind.config.js
├── public/
│   ├── manifest.json (PWA manifest)
│   ├── icons/ (app icons 192x192, 512x512, favicon)
│   └── offline.html (offline fallback)
└── App.tsx

## STYLING DETAILS

Tailwind Configuration:
- Primary blue: #2563EB (use as default button, links)
- Red/Sale: #DC2626 (sale prices, "Save" amounts)
- Green: #16A34A (positive feedback, savings)
- Orange: #FF6B35 (hot/trending badges)
- Gray scale: Use Tailwind defaults for neutrals

DealCard Style:
- Rounded corners: rounded-lg
- Shadow: shadow-md on hover → shadow-lg
- Transition: transform scale-105 on hover
- Border: 1px border-gray-200

PriceDisplay Style:
- Original: line-through text-gray-500 text-sm
- Sale: text-red-600 font-bold text-lg
- Discount %: bg-red-100 text-red-700 font-bold rounded-full px-2 py-1

ExpiryBadge Style:
- >24h: bg-green-100 text-green-700
- 12-24h: bg-yellow-100 text-yellow-700
- <12h: bg-red-100 text-red-700 (animated)

## TESTING REQUIREMENTS

Before deployment:
1. Test on iPhone SE (375px) - mobile
2. Test on iPad (768px) - tablet
3. Test on Chrome desktop (1920px)
4. Test offline functionality
5. Test install prompt on mobile
6. Lighthouse PWA score ≥90
7. Load all API endpoints and verify data displays correctly
8. Test infinite scroll pagination
9. Test search functionality
10. Test deal expiry countdown (simulate with mock data)

## DEPLOYMENT NOTES

1. Build output should be optimized for:
   - Gzip compression enabled
   - Images optimized and lazy-loaded
   - Code splitting by route
   
2. Environment variables:
   - REACT_APP_API_BASE_URL=http://localhost:3000/api (dev)
   - Production URL TBD

3. Service worker should cache:
   - App shell (HTML, CSS, JS bundles)
   - Route pages
   - API responses (with stale-while-revalidate)
   - Images (with network-first strategy for freshness)

## ACCESSIBILITY REQUIREMENTS

- WCAG 2.1 Level AA compliance
- Semantic HTML (proper heading hierarchy, button/link roles)
- Alt text on all images
- Keyboard navigation (Tab through all interactive elements)
- Color contrast ≥4.5:1 for text
- Focus indicators visible on all buttons
- Screen reader friendly (aria-labels where needed)

## PERFORMANCE TARGETS

- First Contentful Paint (FCP): <1.5s
- Largest Contentful Paint (LCP): <2.5s
- Cumulative Layout Shift (CLS): <0.1
- Time to Interactive (TTI): <3.5s
- Lighthouse Score: ≥90
- Mobile Lighthouse Score: ≥85

## STARTING DEVELOPMENT

1. Create repo locally or use Bolt.new's built-in environment
2. Install dependencies
3. Create .env file with API_BASE_URL=http://localhost:3000/api
4. Start dev server (default port 3001)
5. Test API connectivity
6. Build components incrementally
7. Test PWA features before finalization

Good luck! Build a fast, beautiful, and offline-first PWA! 🚀
```

---

## 🎯 How to Use This Prompt

### Step 1: Open Bolt.new
- Go to [Bolt.new](https://bolt.new)
- Click "Create new"

### Step 2: Paste the Prompt
- Copy the entire "Complete Bolt.new Prompt" section above
- Paste it into Bolt.new's prompt input field
- Click "Create"

### Step 3: Let Bolt Build
Bolt will automatically:
- Set up React/Next.js project structure
- Create all necessary components
- Configure Tailwind CSS with your colors
- Set up routing and pages
- Create API service layer
- Implement PWA features
- Generate manifest.json

### Step 4: Connect to Your Backend
Once the app is generated:
1. Make sure your NestJS backend is running: `npm run start:dev` (on port 3000)
2. Update `API_BASE_URL` in environment variables if needed
3. Test API endpoints by navigating through the app

### Step 5: Customize
You can ask Bolt to make changes:
- "Add dark mode toggle"
- "Change the red to purple"
- "Add favorites functionality"
- "Fix the mobile layout"
- "Add a search feature"

---

## 📱 Key Features Bolt Will Build

✅ **Responsive Design** - Mobile, tablet, desktop  
✅ **API Integration** - Connects to all 6 backend endpoints  
✅ **PWA Ready** - Manifest, service worker, installable  
✅ **Offline Support** - Cached deals, works without internet  
✅ **Fast Performance** - Optimized images, lazy loading  
✅ **Beautiful UI** - Your color scheme applied throughout  
✅ **State Management** - Pagination, filtering, sorting  
✅ **Error Handling** - Network retries, fallback pages  

---

## 🚀 Next Steps After Bolt Builds

1. **Test on devices:**
   ```bash
   npm run dev  # Start dev server
   # Open http://localhost:3001 on mobile device
   ```

2. **Install as app:**
   - Mobile: Tap menu → "Install DealHunter"
   - Desktop: Install button in address bar

3. **Go offline:**
   - Turn off WiFi/mobile data
   - App still works with cached data

4. **Build for production:**
   ```bash
   npm run build
   npm run start  # Serves optimized PWA
   ```

5. **Deploy to Vercel/Netlify:**
   - Push to GitHub
   - Connect to Vercel/Netlify
   - Auto-deploy on push

---

## 💡 Pro Tips

- Bolt is **very good** at PWA setup - let it handle manifest, icons, service workers
- If Bolt asks for clarification, mention "DealHunter deal discovery PWA"
- The prompt specifies all API details so Bolt can integrate immediately
- Ask Bolt to adjust styling if you want different colors
- Request specific features iteratively after the initial build

---

## 🔗 Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    DealHunter PWA                        │
│                   (Built by Bolt.new)                    │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │            React Components                      │   │
│  │  DealCard │ DealCarousel │ FilterSidebar      │   │
│  │  PriceDisplay │ ExpiryBadge │ CategoryBadge   │   │
│  └─────────────────────────────────────────────────┘   │
│                           ↓                              │
│  ┌─────────────────────────────────────────────────┐   │
│  │         React Router Pages                       │   │
│  │  Home │ DealDetails │ CategoryBrowse            │   │
│  │  HotDeals │ TopDeals │ Favorites                │   │
│  └─────────────────────────────────────────────────┘   │
│                           ↓                              │
│  ┌─────────────────────────────────────────────────┐   │
│  │      API Service Layer (Axios)                   │   │
│  │  - Retry logic                                  │   │
│  │  - Cache interceptors                           │   │
│  │  - Error handling                               │   │
│  └─────────────────────────────────────────────────┘   │
│                           ↓                              │
│              ┌────────────┴────────────┐                │
│              ↓                         ↓                │
│    ┌──────────────────┐     ┌──────────────────┐       │
│    │ NestJS Backend   │     │  localStorage    │       │
│    │  (Port 3000)     │     │  (Offline data)  │       │
│    │                  │     │                  │       │
│    │ GET /deals       │     │  Cached deals    │       │
│    │ GET /deals/top   │     │  Favorites       │       │
│    │ GET /deals/hot   │     │  Recent searches │       │
│    │ etc.             │     │                  │       │
│    └──────────────────┘     └──────────────────┘       │
│              ↑                                           │
│              └───────────────────────────────────────────│
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │       PWA Features (Service Worker)              │   │
│  │  - Offline support                              │   │
│  │  - Cache strategies                             │   │
│  │  - Push notifications                           │   │
│  │  - Installable on home screen                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │      Tailwind CSS Styling                        │   │
│  │  - Mobile-first responsive                      │   │
│  │  - Dark mode support                            │   │
│  │  - Your custom color scheme                     │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 📊 Backend-PWA Data Flow

```
┌──────────────────────────────────────────────────────────┐
│  User Navigates to Home Page                             │
└────────────────────────┬─────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│  PWA Checks Service Worker Cache                         │
│  - Is data cached and fresh (<1h)?                       │
│  - YES: Show cached deals + "Last updated: 5 mins ago"   │
│  - NO: Proceed to network request                        │
└────────────────────────┬─────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│  API Service Makes HTTP Request                          │
│  GET http://localhost:3000/api/deals?page=1&limit=20     │
│  (With retry logic: 3 attempts with exponential backoff) │
└────────────────────────┬─────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│  NestJS Backend Processes Request                        │
│  - DealsController receives GET /deals                   │
│  - DealsService queries database                         │
│  - Returns paginated result: { data: [], total, page }   │
└────────────────────────┬─────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│  API Response Returns to PWA                             │
│  Status: 200 OK                                          │
│  Body: { data: [Deal, Deal, ...], total: 245, page: 1 } │
└────────────────────────┬─────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│  PWA Caches Response                                     │
│  - Stored in Service Worker cache (1 hour TTL)           │
│  - Also stored in localStorage for quick access          │
│  - Images lazy-loaded and cached separately              │
└────────────────────────┬─────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│  React Components Render                                 │
│  - DealCard components created for each deal             │
│  - Images lazy-loaded as user scrolls                    │
│  - Tailwind CSS applied for responsive layout            │
└────────────────────────┬─────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│  User Sees Beautiful Deal Feed 🎉                        │
│  - Responsive on mobile/tablet/desktop                   │
│  - Smooth scroll with infinite pagination                │
│  - Can click deals for more details                      │
│  - Can open affiliate links in new tab                   │
└──────────────────────────────────────────────────────────┘
```

---

**You're all set! Now create your PWA in Bolt.new! 🚀**
