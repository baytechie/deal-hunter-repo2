# 🎯 Deal UI Components - Quick Reference

Quick lookup for DealList and DealCreate components.

---

## 📋 DealList - Datagrid View

**File:** `admin_panel/src/resources/DealList.tsx`

**URL:** `http://localhost:3001/deals`

### What Shows Up

```
[Search Box] [Filters] [Create] [Export]

┌────────┬──────────┬────────┬─────────┬──────────┬─────────┬─────────┐
│ Title  │Category  │ Price  │ Status  │Featured  │Expires  │Created  │
├────────┼──────────┼────────┼─────────┼──────────┼─────────┼─────────┤
│Samsung │Electronics│$99.99 │[🔥 Hot]│⭐...     │5 days   │Jan 15   │
│ TV 55" │           │50% OFF │        │          │         │         │
├────────┼──────────┼────────┼─────────┼──────────┼─────────┼─────────┤
│ Apple  │Electronics│$899.99│[Regular]│Standard  │2 days🔴 │Jan 14   │
│ Watch  │           │25% OFF │        │          │         │         │
└────────┴──────────┴────────┴─────────┴──────────┴─────────┴─────────┘

[Show] [Edit] [Delete]  [Show] [Edit] [Delete]  ...

← Page 1 of 10 - Items 1-25 of 245 →
```

### Columns

| Column | Shows | Color |
|--------|-------|-------|
| **Title** | Deal name | Black |
| **Category** | Electronics, Fashion, etc. | Blue chip |
| **Price** | $99.99 with 50% OFF | Bold |
| **Status** | 🔥 Hot / Regular | Red/Gray toggle |
| **Featured** | ⭐ or Standard | Blue/Default |
| **Expires** | "5 days" or "Expired" | 🟢🟠🔴 |
| **Created** | "Jan 15, 2026" | Gray |

### Actions

- **Show** (👁️) - View full details
- **Edit** (✏️) - Edit the deal
- **Delete** (🗑️) - Delete the deal

---

## 📝 DealCreate - Form View

**File:** `admin_panel/src/resources/DealCreate.tsx`

**URL:** `http://localhost:3001/deals/create`

### Form Layout

```
┌─────────────────────────────────────────┐
│  ➕ Create New Deal                      │
├─────────────────────────────────────────┤
│                                         │
│  📋 Basic Information                    │
│  ┌─────────────────────────────────┐   │
│  │ Deal Title        [5-100 chars] │   │
│  │ Description       [20-1000 chars]   │
│  │ Category          [Dropdown ↓]  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  💰 Pricing                              │
│  ┌──────────────────┐  ┌──────────────┐ │
│  │ Sale Price  $99  │  │ Original $199│ │
│  └──────────────────┘  └──────────────┘ │
│  ┌─────────────────────────────────┐   │
│  │ Discount: 50% OFF - Save $100   │   │
│  └─────────────────────────────────┘   │
│                                         │
│  🖼️ Media                                │
│  │ Image URL    [https://...jpg]    │   │
│  │ 💡 Use CDN links (Cloudinary)    │   │
│  │                                  │   │
│  🔗 Affiliate Link                      │
│  │ Link         [https://amazon...]  │   │
│  │ 💡 Suggest: https://...  [Apply] │   │
│  │                                  │   │
│  ⚡ Status                               │
│  │ [✓] 🔥 Mark as Trending         │   │
│  │ [ ] ⭐ Featured Deal            │   │
│  │                                  │   │
│  ⏰ Expiry Date                         │
│  │ Date Picker: [Jan 15, 2026]    │   │
│  │                                  │   │
│  ┌──────────────────────────────────┐  │
│  │ [✅ Create Deal] [🔄 Clear Form] │  │
│  └──────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

---

## 🎮 Interactive Features

### Hot Toggle Switch

**Location:** DealList, Status column

**Click the switch:**
```
[OFF] ←click→ [ON]
Regular      🔥 Hot
```

**What happens:**
- Switch flips instantly
- Chip badge updates
- Status logged to console
- (API update TBD)

### Smart URL Suggestion

**Location:** DealCreate, Affiliate Link field

**Type:** `amazon.com/deal`

**System suggests:**
```
💡 Suggestion: https://amazon.com/deal   [Apply]
```

**Click Apply:**
- URL automatically gets `https://` prefix
- Field value updates
- Suggestion disappears

### Price Comparison

**Location:** DealCreate, Pricing section

**Shows automatically when:**
- Both Sale Price and Original Price are filled

**Displays:**
```
┌──────────────────────────────────────┐
│ Original    Sale Price    Savings     │
│ $199.99     $99.99        50% OFF     │
│ (crossed)   (green bold)  (red)      │
└──────────────────────────────────────┘
```

**Warns if:**
- Sale Price > Original Price
- Shows red alert

---

## ✅ Validation Rules

### Title
```
Min: 5 characters
Max: 100 characters
Example: "Samsung 55-inch 4K TV"
```

### Description
```
Min: 20 characters
Max: 1000 characters
Example: "Premium 4K UHD display with HDR..."
```

### Price
```
Min: $0.01
Max: $999,999
Decimal: 2 places ($99.99)
```

### Original Price
```
Min: $0.01
Max: $999,999
Decimal: 2 places
Must be ≥ Sale Price
```

### Category
```
Options: 9 categories
- Electronics
- Home & Garden
- Fashion
- Sports & Outdoors
- Books
- Toys & Games
- Beauty & Personal Care
- Automotive
- Other
```

### Image URL
```
Format: https://....(jpg|png|gif|webp)
Example: https://cdn.example.com/image.jpg
Must: Start with http:// or https://
Must: End with image extension
```

### Affiliate Link
```
Format: https?://...
Example: https://amazon.com/product-id
Must: Start with http:// or https://
Must: Be valid URL
```

### Expiry Date
```
Type: Date picker
Must: Be in the future
Default: 30 days from today
```

---

## 🔧 Keyboard Shortcuts

### In DealList
```
[Enter] on Title → Edit that deal
[Delete] key → Delete selected item
[Ctrl+F] → Search deals
```

### In DealCreate
```
[Tab] → Move to next field
[Shift+Tab] → Move to previous field
[Enter] → Submit form (on button)
[Escape] → Clear field
```

---

## 📊 Data Flow

### Creating a Deal

```
User fills form
    ↓
Validation runs
    ├─ Error? → Show message
    └─ Valid? → Continue
    ↓
Click "✅ Create Deal"
    ↓
Submit to API
    ↓
Success! → Redirect to list
    ↓
New deal appears in datagrid
```

### Toggling Hot Status

```
Click switch in DealList
    ↓
Status flips
    ↓
Chip badge updates
    ↓
Logged to console
    ↓
(Backend update pending)
```

### Getting URL Suggestion

```
Type in Affiliate Link
    ↓
System checks for "http"
    ├─ Has "http"? → No suggestion
    └─ No "http"? → Show suggestion
    ↓
User clicks "Apply"
    ↓
https:// prepended
    ↓
Field updated
    ↓
Ready to submit
```

---

## 🧪 Quick Tests

### Test 1: List Features
- [ ] Open `http://localhost:3001/deals`
- [ ] See datagrid with deals
- [ ] Click toggle on Hot status
- [ ] See switch flip
- [ ] Check badge updates

### Test 2: Create Form
- [ ] Open `http://localhost:3001/deals/create`
- [ ] Leave Title empty, tab out
- [ ] See error message
- [ ] Type "test" (4 chars)
- [ ] See min length error
- [ ] Type longer title (5+ chars)
- [ ] Error disappears

### Test 3: Smart URL
- [ ] In Affiliate Link field
- [ ] Type "amazon.com"
- [ ] See suggestion appear
- [ ] Click "Apply"
- [ ] See "https://amazon.com"

### Test 4: Price Comparison
- [ ] Enter Sale Price: 99.99
- [ ] Enter Original Price: 199.99
- [ ] See comparison card
- [ ] Shows 50% OFF

### Test 5: Validation
- [ ] Try creating without required fields
- [ ] See all error messages
- [ ] Fill all correctly
- [ ] Submit succeeds

---

## 🔍 Debugging

### View DealList Logs
```javascript
window.__adminLogger.getLogsByContext('DealList')
```

### View DealCreate Logs
```javascript
window.__adminLogger.getLogsByContext('DealCreate')
```

### View All Logs
```javascript
window.__adminLogger.getLogs()
```

### Export Logs
```javascript
window.__adminLogger.exportAsJson()
```

---

## 📱 Responsive Layout

### Desktop (>1200px)
```
Full datagrid with all columns visible
Form in 2-column layout for pricing
Price card displays inline
```

### Tablet (768px-1200px)
```
Datagrid with horizontal scroll
Form stacks to single column
Price card full width
```

### Mobile (<768px)
```
Datagrid collapses to card view
Form single column
Simplified layout
```

---

## 🎨 Color Guide

| Color | Meaning | Example |
|-------|---------|---------|
| 🔵 Blue | Primary action | Category chip |
| 🔴 Red | Hot/Urgent | 🔥 Hot status |
| 🟢 Green | Positive/Savings | Discount % |
| 🟠 Orange | Warning | 3-7 days until expiry |
| 🟡 Red | Critical | Less than 3 days |
| ⭐ Blue | Featured | Featured badge |
| Gray | Secondary | Regular status |

---

## 📚 Full Documentation

For complete details, see:
- `DEAL_UI_COMPONENTS_GUIDE.md` (400+ lines)
- `DEAL_UI_IMPLEMENTATION.md` (300+ lines)

---

**Everything you need to use Deal Management UI!** 🚀
