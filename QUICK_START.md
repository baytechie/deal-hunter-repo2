# DealHunter Quick Start Guide

Get the entire DealHunter Ecosystem up and running in minutes!

## Prerequisites

- **Node.js** 18+ and npm/yarn
- **Flutter** SDK (for mobile)
- **Git** (optional, for version control)

## 5-Minute Setup

### 1. Backend (NestJS API)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Start development server
npm run start:dev
```

✅ **Backend ready** on `http://localhost:3000`

Expected output:
```
[Nest] 12345  - 01/15/2024, 10:30:00 AM     LOG [NestFactory] Nest application successfully started +2ms
```

### 2. Admin Panel (React-Admin)

```bash
# In new terminal, navigate to admin panel
cd admin_panel

# Install dependencies
npm install

# Start development server
npm run dev
```

✅ **Admin panel ready** on `http://localhost:3001`

Browser opens automatically. You'll see the React-Admin interface.

### 3. Mobile (Flutter)

```bash
# In new terminal, navigate to mobile
cd flutter_app

# Get dependencies
flutter pub get

# Run on connected device or emulator
flutter run
```

✅ **Mobile app ready** on your device/emulator

## First Steps

### Test Backend API

Open browser and navigate to:
```
http://localhost:3000/deals?page=1&limit=10
```

You should see a JSON response with deals (if any exist in database).

### Test Admin Panel

1. Navigate to `http://localhost:3001`
2. Click on "Deals" in the sidebar
3. You should see the deals list
4. Try creating a new deal:
   - Click "Create" button
   - Fill in the form
   - Click "Save"

### Check Logs

**Backend logs** - See terminal where `npm run start:dev` is running

**Admin panel logs** - Open DevTools (F12) and run:
```javascript
window.__adminLogger.getLogs()
```

**Mobile logs** - Check Flutter debug console for debugPrint output

## Common Issues & Solutions

### Backend won't start

**Issue:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solution:** Kill process on port 3000
```bash
# Windows (PowerShell)
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :3000
kill -9 <PID>
```

### Admin panel shows 404 errors

**Issue:** "Cannot GET /deals" or network errors in console

**Check:**
1. Backend is running on `http://localhost:3000`
2. `.env.development` has correct API URL:
   ```env
   VITE_API_URL=http://localhost:3000
   ```
3. Refresh the browser

### Mobile can't connect to backend

**Issue:** Network requests fail or timeout

**Check:**
1. Backend is running
2. Device is on same network (for physical device)
3. Update API URL in `lib/core/services/api_client.dart` if needed

### Dependencies missing

**Issue:** `npm install` fails with strange errors

**Solution:** Clear cache and reinstall
```bash
# For Node projects
rm -rf node_modules package-lock.json
npm install

# For Flutter
rm -rf pubspec.lock
flutter pub get
```

## Verification Checklist

Run through these to confirm everything works:

- [ ] Backend running on http://localhost:3000
- [ ] `curl http://localhost:3000/deals` returns JSON
- [ ] Admin panel running on http://localhost:3001
- [ ] Admin panel loads without errors
- [ ] Can see deals list in admin panel
- [ ] Can create a new deal via admin form
- [ ] Can edit a deal
- [ ] Can delete a deal
- [ ] Mobile app starts on device/emulator
- [ ] Mobile app displays deals
- [ ] Can see logs in browser console via `window.__adminLogger.getLogs()`

## Quick Testing Guide

### Test Creating a Deal (via Admin)

1. Go to `http://localhost:3001`
2. Click "Deals" → "Create"
3. Fill in form:
   - Title: "Test Deal"
   - Price: 99.99
   - Original Price: 199.99
   - Category: "Electronics"
   - Image URL: `https://via.placeholder.com/300`
   - Affiliate Link: `https://amazon.com`
4. Click "Save"
5. Check logs: `window.__adminLogger.getLogs()`

### Test API Directly (via curl)

```bash
# List deals
curl http://localhost:3000/deals?page=1&limit=10

# Create deal
curl -X POST http://localhost:3000/deals \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Deal",
    "description": "Test",
    "price": 99.99,
    "originalPrice": 199.99,
    "category": "Electronics",
    "imageUrl": "https://via.placeholder.com/300",
    "affiliateLink": "https://amazon.com"
  }'

# Get single deal (replace 1 with actual ID)
curl http://localhost:3000/deals/1
```

### Test Mobile

1. Run app: `flutter run`
2. Wait for deals to load
3. Tap on a deal
4. Should open in Amazon app or WebView
5. Check debugPrint logs in console

## File Locations

| Component | Main File | Config File |
|-----------|-----------|------------|
| **Backend** | `backend/src/main.ts` | `backend/package.json` |
| **Admin** | `admin_panel/src/main.tsx` | `admin_panel/vite.config.ts` |
| **Mobile** | `flutter_app/lib/main.dart` | `flutter_app/pubspec.yaml` |

## Environment Variables

### Backend
No special setup needed (uses defaults)

### Admin Panel (`.env.development`)
```env
VITE_API_URL=http://localhost:3000
VITE_ENABLE_DEBUG_LOGS=true
```

### Mobile (`lib/core/services/api_client.dart`)
Update `_baseUrl` if needed:
```dart
static const String _baseUrl = 'http://localhost:3000';
```

## Default Ports

| Service | Port | URL |
|---------|------|-----|
| Backend API | 3000 | http://localhost:3000 |
| Admin Panel | 3001 | http://localhost:3001 |
| Mobile | Device | (via Flutter) |

## Useful Commands

### Backend
```bash
# Start dev server
npm run start:dev

# Start production build
npm run build && npm run start

# Run tests (if configured)
npm run test
```

### Admin Panel
```bash
# Dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Mobile
```bash
# Run on device/emulator
flutter run

# Run with verbose logging
flutter run -v

# Clean and rebuild
flutter clean && flutter pub get && flutter run
```

## Database

The backend uses **SQLite** for development. Database file is created at:
```
backend/dev.db
```

To reset the database, delete `dev.db` and restart the backend.

## Debugging Tips

### View all logs in admin panel
```javascript
window.__adminLogger.getLogs()
```

### Filter logs by context
```javascript
window.__adminLogger.getLogsByContext('DataProvider')
```

### Get only error logs
```javascript
window.__adminLogger.getLogsByLevel('error')
```

### Export logs to JSON
```javascript
window.__adminLogger.exportAsJson()
```

### Monitor API calls
Open DevTools → Network tab, then perform actions in admin panel

### Backend Winston logs
Check terminal where `npm run start:dev` is running (look for JSON logs)

### Mobile Flutter logs
Check Flutter console output in terminal (look for `[ServiceName]` prefixes)

## Next Steps

1. **Backend:** Add more endpoints, authentication, database seeding
2. **Admin:** Create custom resource pages, add analytics dashboard
3. **Mobile:** Add favorites, notifications, user profiles
4. **All:** Add proper error handling, logging, and testing

## Documentation

- **Backend Details:** See `backend/README.md`
- **Admin Panel Details:** See `admin_panel/README.md`
- **Mobile Details:** See `flutter_app/README.md`
- **Project Structure:** See `COMPLETE_PROJECT_STRUCTURE.md`
- **API Testing:** See `admin_panel/API_TESTING_GUIDE.md`

## Getting Help

Check these files for detailed information:
- `COMPLETE_PROJECT_STRUCTURE.md` - Architecture overview
- `ADMIN_PANEL_IMPLEMENTATION.md` - Admin panel details
- `admin_panel/API_TESTING_GUIDE.md` - Testing guide
- `admin_panel/README.md` - React-Admin documentation

---

**You're all set! Start building! 🚀**

With all three components running, you have:
- ✅ API backend for data management
- ✅ Mobile app for users
- ✅ Admin panel for content management
- ✅ Complete logging and debugging tools
- ✅ Production-ready architecture
