# Project: DealHunter Admin Panel (Refine.dev)
**Goal:** Build a comprehensive admin dashboard for a Deal/Coupon app using Refine.dev and Ant Design.
**Tech Stack:**
- **Framework:** React (Vite)
- **Core:** @refine/core
- **UI:** @refine/antd (Ant Design)
- **Data:** Custom Mock Data Provider (Simulating a real Deals API)

## 1. The Data Strategy (Crucial)
Since we don't have a real API yet, create a `dummyDataProvider.ts`.
- It must implement the `DataProvider` interface from `@refinedev/core`.
- It should serve mock data for these resources:
  - **deals**: { id, title, price, originalPrice, storeName, imageUrl, status (active/expired/pending), clicks, createdAt }
  - **users**: { id, username, email, role (admin/user), status (banned/active) }
  - **stores**: { id, name, affiliateStatus (active/inactive) }
  - **stats**: { revenue, totalDeals, activeUsers }

## 2. Page Requirements

### A. The Dashboard (Home)
Create a `DashboardPage` with high-level metrics.
1. **KPI Cards:** Display 'Total Revenue' (formatted $), 'Active Deals', and 'Pending Approvals' using Ant Design `<Card>`.
2. **Chart:** A simple bar chart showing 'Deals Posted by Day' (use Recharts or Ant Design Charts).
3. **Recent Activity:** A small table showing the last 5 deals added, with a status badge.

### B. Deal Management (Resource: `deals`)
Create a `DealList` page.
1. **Table View:**
   - **Column 1:** Image (Avatar size).
   - **Column 2:** Title (Clickable to edit).
   - **Column 3:** Price (Show as: "$20 $̶5̶0̶" with strikethrough).
   - **Column 4:** Status (Tag: Green for 'Active', Orange for 'Pending', Red for 'Expired').
   - **Column 5:** Actions (Edit, Delete, "Approve" button).
2. **Filters:** Add a dropdown filter for Status (e.g., "Show only Pending").

### C. Deal Editing (Resource: `deals`)
Create a `DealEdit` page (Drawer or Page).
1. **Form Fields:**
   - **Title:** Text Input.
   - **Affiliate Link:** URL Input (Add a "Test Link" button next to it).
   - **Pricing:** Two inputs side-by-side (Sale Price, Original Price).
   - **Status:** Select Dropdown (Active, Expired, Pending).
   - **Store:** Select Dropdown (Mock fetch from `stores`).

### D. User Moderation (Resource: `users`)
Create a `UserList` page.
1. **Table:** Username, Email, Role.
2. **Action:** A "Ban User" button that changes their status to 'banned'.

## 3. Implementation Steps for Copilot
1. First, generate the `dummyDataProvider.ts` with at least 10 realistic deals (e.g., "AirPods Pro", "PS5 Bundle").
2. Configure `<Refine>` in `App.tsx` to use this provider.
3. Build the `DashboardPage` first, then the `DealList`.