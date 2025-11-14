# ARYA Mobility OS - Quick Start Setup

## Prerequisites

- **Node.js**: 18.x or higher
- **npm** or **pnpm**: Latest version
- **Git**: For version control

## Installation Steps

### Step 1: Clone and Install Dependencies

```bash
# If starting fresh
git clone <your-repo-url>
cd arya-mobility-os

# Install dependencies
npm install
# or
pnpm install
```

### Step 2: Set Up Environment Variables

```bash
# Copy example file
cp .env.example .env.local
```

Edit `.env.local` with your keys:

```env
# Gemini AI (optional - for natural language understanding)
# Get key at: https://ai.google.dev/
NEXT_PUBLIC_GEMINI_API_KEY=your_key_here

# Mapbox (optional - for interactive maps)
# Get token at: https://account.mapbox.com/
NEXT_PUBLIC_MAPBOX_TOKEN=your_token_here

# Builder.io (optional - for content management)
# Get key at: https://builder.io/account/spaces
NEXT_PUBLIC_BUILDER_API_KEY=your_key_here
NEXT_PUBLIC_BUILDER_API_URL=https://cdn.builder.io/api/v3

# App Configuration (update these for your deployment)
NEXT_PUBLIC_APP_NAME=ARYA Mobility OS
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Add Landing Page Assets

The landing page requires media files from the original Vite project:

```bash
# Create asset directories
mkdir -p public/landing/assets/images
mkdir -p public/landing/assets/videos
mkdir -p public/landing/assets/fonts
```

Copy from your original project:

```bash
# From src/assets/images/
cp src/assets/images/* public/landing/assets/images/

# From src/assets/videos/
cp src/assets/videos/* public/landing/assets/videos/

# From src/assets/fonts/
cp src/assets/fonts/* public/landing/assets/fonts/
```

**Required files:**
- Images: `hero-bg.png`, `hero-img.png`, `nav-logo.svg`, all flavor images, menu images, etc.
- Videos: `hero-bg.mp4`, `splash.mp4`, `pin-video.mp4`, all testimonial videos (f1-f7)
- Fonts: `ProximaNova-Regular.otf`

### Step 4: Run Development Server

```bash
npm run dev
# Server starts at http://localhost:3000
```

Visit:
- Landing page: http://localhost:3000
- App dashboard: http://localhost:3000/app
- App pages: http://localhost:3000/app/map, /app/ev, /app/routes, etc.

### Step 5: Verify Installation

Check the following:

1. **Landing page loads**: http://localhost:3000
   - Should display hero section with video background
   - Navbar and menu should work
   - Animations should be smooth

2. **App dashboard loads**: http://localhost:3000/app
   - Should show overview with metrics
   - Navigation sidebar should be visible
   - Quick action buttons should work

3. **EV page works**: http://localhost:3000/app/ev
   - Should display charger list
   - Filter buttons should function

4. **No console errors**: Open DevTools (F12)
   - Check for TypeScript errors
   - Check for missing assets warning

## Configuration

### Tailwind CSS Customization

Edit `tailwind.config.ts` to change colors:

```typescript
theme: {
  extend: {
    colors: {
      'accent-warm': '#c97c3f',  // Main accent
      'accent-teal': '#4a7c7e',   // Secondary
      // ... more colors
    }
  }
}
```

### App Navigation

Edit `app/app/layout.tsx` to modify sidebar items:

```typescript
const NAV_ITEMS = [
  { href: "/app", label: "Overview", icon: BarChart3 },
  // Add/remove items here
];
```

### API Endpoints

Modify simulators in `lib/simulators/`:
- `ev.ts` - EV charger data
- `parking.ts` - Parking zones
- `heat.ts` - Temperature data
- `events.ts` - Event information
- `transit.ts` - Bus/metro routes

## Optional: Enable AI Features

### Google Gemini Integration

1. Install package:
```bash
npm install @google/generative-ai
```

2. Add API key to `.env.local`:
```
NEXT_PUBLIC_GEMINI_API_KEY=your_actual_key
```

3. Uncomment Gemini code in `app/api/arya/route.ts` (currently commented out)

### Mapbox Integration

1. Install package:
```bash
npm install mapbox-gl @mapbox/mapbox-gl-draw
npm install -D @types/mapbox-gl
```

2. Add token to `.env.local`:
```
NEXT_PUBLIC_MAPBOX_TOKEN=your_actual_token
```

3. Create `components/map/MapContainer.tsx`:
```typescript
'use client';
import mapboxgl from 'mapbox-gl';

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

export default function MapContainer() {
  // Mapbox implementation
}
```

4. Import into `/app/app/map/page.tsx`

### Builder.io Integration

1. Add API key to `.env.local`:
```
NEXT_PUBLIC_BUILDER_API_KEY=your_key
```

2. Test connection:
```bash
npm run dev
# In console: import { testBuilderConnection } from '@/lib/builder'
# Run: testBuilderConnection().then(console.log)
```

## Building for Production

### Build the App

```bash
npm run build
# Creates optimized production build in .next/
```

### Test Production Build Locally

```bash
npm run build
npm run start
# Server runs at http://localhost:3000 (production mode)
```

### Check Bundle Size

```bash
npm run build
# View .next/static/ for bundle info
```

## Deployment

### Deploy to Vercel

```bash
npm install -g vercel
vercel login
vercel
```

Follow prompts and set environment variables in Vercel dashboard.

### Deploy to Other Platforms

#### Netlify
```bash
npm run build
# Deploy .next and public folder
```

#### AWS Amplify
1. Connect GitHub repo
2. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
3. Add environment variables

#### Docker
Create `Dockerfile`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t arya-mobility-os .
docker run -p 3000:3000 arya-mobility-os
```

## Troubleshooting

### Landing Page Not Loading

**Issue**: "Cannot find module" or images not showing

**Solution**:
```bash
# Verify assets exist
ls public/landing/assets/images/
ls public/landing/assets/videos/

# Clear cache and restart
rm -rf .next
npm run dev
```

### API Errors

**Issue**: "Failed to fetch" on `/app/ev` or other pages

**Solution**:
1. Check browser console for specific error
2. Ensure simulators are being called correctly
3. Check `app/api/mobility/route.ts` exists
4. Restart dev server: `npm run dev`

### Styling Issues

**Issue**: Tailwind classes not applied

**Solution**:
```bash
# Rebuild Tailwind cache
rm -rf .next
npm run dev

# Or just refresh page (F5)
```

### Environment Variables Not Loading

**Issue**: API keys show as "undefined"

**Solution**:
1. Verify `.env.local` file exists (not `.env`)
2. Variables must start with `NEXT_PUBLIC_` to be accessible client-side
3. Restart dev server after editing `.env.local`
4. Check no spaces around `=`: `KEY=value` (not `KEY = value`)

### TypeScript Errors

**Issue**: Red squiggly lines in editor

**Solution**:
```bash
# Rebuild TypeScript
npm run build

# Install missing type definitions
npm install -D @types/node
npm install -D @types/react
```

### Memory/Performance Issues

**Issue**: Dev server sluggish or crashes

**Solution**:
```bash
# Increase Node memory
NODE_OPTIONS="--max-old-space-size=4096" npm run dev

# Or rebuild
rm -rf .next node_modules
npm install
npm run dev
```

## Development Workflow

### Running Tests (Future)

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

### Code Quality

```bash
# Linting
npm run lint

# TypeScript check
npm run type-check

# Build check
npm run build
```

### Updating Dependencies

```bash
# Check for updates
npm outdated

# Update all
npm update

# Or selective update
npm install next@latest
```

## Project Structure Checklist

Ensure you have:

```
✅ app/
  ✅ layout.tsx
  ✅ page.tsx (landing)
  ✅ app/ (folder with subpages)
  ✅ api/

✅ components/
  ✅ landing/ (all 15 components)

✅ lib/
  ✅ landing/media.ts, details.ts
  ✅ simulators/ (all 5 files)
  ✅ builder.ts

✅ types/
  ✅ mobility.ts

✅ public/
  ✅ landing/assets/ (images, videos, fonts)

✅ Configuration Files
  ✅ next.config.ts
  ✅ tailwind.config.ts
  ✅ tsconfig.json
  ✅ package.json
  ✅ .env.example
  ✅ README.md, ARCHITECTURE.md, SETUP.md
```

## Next Steps

1. **Explore the code**: Understand the structure in ARCHITECTURE.md
2. **Customize**: Update colors, text, navigation in config files
3. **Add real APIs**: Replace simulators with actual data sources
4. **Deploy**: Push to production using Vercel or your platform
5. **Monitor**: Set up analytics and error tracking

## Getting Help

- **Documentation**: Read `README.md` and `ARCHITECTURE.md`
- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind Docs**: https://tailwindcss.com/docs
- **React Docs**: https://react.dev
- **Issues**: Check GitHub issues or create new one

---

**You're all set! Start the dev server with `npm run dev` and visit http://localhost:3000**
