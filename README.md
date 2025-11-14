# ARYA Mobility OS - Next.js 15 Application

A professional, production-grade mobility platform for Dubai built with Next.js 15, TypeScript, and Tailwind CSS. Combines a preserved landing page with a sophisticated AI-powered multi-modal transportation app.

## Project Overview

**ARYA Mobility OS** is an integrated platform featuring:

- **Landing Page**: Preserved exact design from original React + Vite app (SPYLT beverage brand)
- **Mobility App**: AI-powered assistant for Dubai transportation with:
  - EV charger finder and predictions
  - Parking availability and pricing
  - Heat index and health recommendations
  - Multi-modal route planning
  - Event impact analysis
  - Real-time transit information
  - User preference management

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + CSS Modules
- **Icons**: Lucide React
- **State Management**: React Hooks + Context (Zustand ready)
- **Mapping**: Mapbox GL JS (optional integration)
- **AI**: Google Gemini (optional integration)
- **CMS**: Builder.io (optional integration)
- **Content**: Simulated data layer (plug real APIs later)

## Project Structure

```
.
├── app/
│   ├── api/                  # API routes
│   │   ├── arya/            # ARYA AI assistant
│   │   └── mobility/        # General mobility data
│   ├── app/                 # ARYA Mobility OS app
│   │   ├── layout.tsx       # Sidebar + top bar
│   │   ├── page.tsx         # Overview dashboard
│   │   ├── map/page.tsx     # Multi-layer map
│   │   ├── ev/page.tsx      # EV charger suite
│   │   ├── routes/page.tsx  # Route planner
│   │   ├── health/page.tsx  # Heat & safety
│   │   ├── events/page.tsx  # Event impacts
│   │   └── settings/page.tsx # User preferences
│   ├── globals.css          # Global styles (preserved landing + new)
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home (landing page)
├── components/
│   └── landing/             # Landing page components
│       ├── LandingPage.tsx  # Main wrapper
│       ├── HeroSection.tsx
│       ├── MessageSection.tsx
│       ├── FlavorSection.tsx
│       ├── NutritionSection.tsx
│       ├── BenefitSection.tsx
│       ├── TestimonialSection.tsx
│       ├── BottomBanner.tsx
│       ├── FooterSection.tsx
│       ├── Navbar.tsx
│       ├── NavMenu.tsx
│       ├── PreLoader.tsx
│       ├── VideoPin.tsx
│       ├── FlavorTitle.tsx
│       ├── FlavorSlider.tsx
│       └── ClipPathTitle.tsx
├── lib/
│   ├── landing/
│   │   ├── media.ts         # Image/video asset helpers
│   │   └── details.ts       # Landing page constants
│   └── simulators/
│       ├── ev.ts            # EV charger simulator
│       ├── parking.ts       # Parking simulator
│       ├── heat.ts          # Heat index simulator
│       ├── events.ts        # Events simulator
│       └── transit.ts       # Transit (bus/metro) simulator
├── types/
│   └── mobility.ts          # TypeScript types for all data
├── public/
│   └── landing/
│       ├── assets/
│       │   ├── images/      # Landing page images
│       │   ├── videos/      # Landing page videos
│       │   └── fonts/       # Custom fonts
│       └── favicon.ico
├── .env.example             # Environment variables template
├── next.config.ts           # Next.js configuration
├── tailwind.config.ts       # Tailwind CSS config
├── tsconfig.json            # TypeScript config
└── package.json
```

## Getting Started

### 1. Installation

```bash
# Clone and install dependencies
npm install
# or
pnpm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Then fill in your keys:

```env
# Optional: Gemini AI for natural language understanding
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

# Optional: Mapbox for interactive maps
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token

# Optional: Builder.io for content management
NEXT_PUBLIC_BUILDER_API_KEY=your_builder_api_key
NEXT_PUBLIC_BUILDER_API_URL=https://cdn.builder.io/api/v3

# App configuration
NEXT_PUBLIC_APP_NAME=ARYA Mobility OS
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Add Landing Page Assets

The landing page requires images and videos from the original Vite app. Create the directory structure:

```bash
mkdir -p public/landing/assets/{images,videos,fonts}
```

Copy from original `src/assets/`:
- Images → `public/landing/assets/images/`
- Videos → `public/landing/assets/videos/`
- Fonts → `public/landing/assets/fonts/`

### 4. Run Development Server

```bash
npm run dev
# Server runs at http://localhost:3000
```

Visit:
- Landing page: `http://localhost:3000`
- App dashboard: `http://localhost:3000/app`

### 5. Build for Production

```bash
npm run build
npm run start
```

## API Endpoints

### ARYA Assistant

```
POST /api/arya
Body: {
  message: string,
  conversationHistory?: ChatMessage[],
  userLocation?: { latitude: number, longitude: number }
}
Response: AssistantResponse
```

### Mobility Data

```
GET /api/mobility?type=<chargers|parking|transit|events>
Response: APIResponse<MobilityData>
```

## Feature Documentation

### Simulation Layer

All data is simulated for development. The simulator functions are deterministic and can be:
- **Replaced** with real API calls
- **Cached** for better performance
- **Validated** against real-world data

Key simulators:
- `lib/simulators/ev.ts` - EV charger data
- `lib/simulators/parking.ts` - Parking availability
- `lib/simulators/heat.ts` - Temperature and health
- `lib/simulators/events.ts` - Dubai events
- `lib/simulators/transit.ts` - Bus/metro routes

### Styling System

Uses Tailwind CSS with custom theme:

**Color Palette:**
- Primary: `accent-warm` (#c97c3f)
- Secondary: `accent-teal` (#4a7c7e)
- Surface: `surface` / `surface-dark`
- Text: `text-primary` / `text-secondary`

**Components:**
- `.card-base` - Standard card styling
- `.button-primary` / `.button-secondary` - Buttons
- `.flex-center` - Flex centering
- `.container-app` - Max-width container

### Landing Page Integration

The landing page is completely isolated from the app section:
- All components in `/components/landing/`
- Assets from `/public/landing/assets/`
- Styles preserved from original design
- Uses GSAP for animations (ScrollSmoother, ScrollTrigger)

## Optional Integrations

### 1. Google Gemini AI

To enable natural language understanding for ARYA:

```bash
npm install @google/generative-ai
```

Update `app/api/arya/route.ts` and uncomment Gemini integration code.

### 2. Mapbox

For interactive multi-layer maps:

```bash
npm install mapbox-gl @mapbox/mapbox-gl-draw
npm install -D @types/mapbox-gl
```

Create map component in `components/map/MapContainer.tsx` and integrate into `/app/app/map/page.tsx`.

### 3. Builder.io

For headless CMS content:

```bash
npm install @builder.io/react
```

Create `lib/builder.ts` integration and content components.

### 4. Zustand (State Management)

For complex app state:

```bash
npm install zustand
```

Create stores in `lib/store/` for user preferences, cache, etc.

## Data Types

All TypeScript types are defined in `types/mobility.ts`:

- `Location` - Geographic point
- `EVCharger` - EV charging station
- `ParkingZone` - Parking area
- `TransitRoute` / `TransitStop` - Public transport
- `HeatIndex` - Temperature data
- `Event` - Dubai events
- `RouteOption` - Multi-modal route
- `UserPreferences` - User settings
- `ChatMessage` / `AssistantResponse` - ARYA assistant

## Best Practices

### Code Style

- Use TypeScript strictly
- Keep components small and focused
- Use React hooks for state
- Prefer functional components
- Add JSDoc comments for complex logic

### Performance

- Code split at route boundaries (Next.js automatic)
- Lazy load heavy components if needed
- Cache simulator data when possible
- Use `next/image` for images
- Monitor bundle size: `npm run build`

### Accessibility

- Use semantic HTML
- Add ARIA labels
- Ensure keyboard navigation
- Test with screen readers

## Customization

### Change App Theme

Edit `tailwind.config.ts`:

```ts
theme: {
  extend: {
    colors: {
      'accent-warm': '#your-color',
      // ...
    }
  }
}
```

### Modify Navigation

Edit `app/app/layout.tsx` and add/remove items from `NAV_ITEMS`.

### Add New Pages

Create new route in `app/app/[feature]/page.tsx` and add to navigation.

## Troubleshooting

### Landing Page Assets Missing

Make sure you've copied images and videos to `public/landing/assets/`:

```bash
ls public/landing/assets/images/
ls public/landing/assets/videos/
```

### Styling Not Applied

Clear Next.js cache:

```bash
rm -rf .next
npm run dev
```

### API Errors

Check browser console and `npm run dev` logs. Ensure environment variables are set correctly.

### Mapbox Not Rendering

Verify `NEXT_PUBLIC_MAPBOX_TOKEN` is set and valid.

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel login
vercel
```

Set environment variables in Vercel dashboard.

### Other Platforms

- Netlify: Ensure Node.js 18+ with build command `npm run build`
- AWS Amplify: Standard Next.js setup
- Docker: Create Dockerfile for containerization

## Future Enhancements

- Real API integration (Dubai RTA data)
- User authentication (NextAuth.js)
- WebSocket for real-time updates
- Progressive Web App (PWA)
- Mobile app via React Native
- Advanced analytics dashboard
- Machine learning for route optimization
- Integration with payment systems

## Security Considerations

- Never commit `.env.local`
- Validate all API inputs
- Use HTTPS in production
- Implement rate limiting on APIs
- Add authentication before production
- Sanitize user inputs

## Support & Documentation

- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com
- **Mapbox GL**: https://docs.mapbox.com/mapbox-gl-js
- **Builder.io**: https://www.builder.io/c/docs
- **Google Gemini**: https://ai.google.dev

## License

[Your License Here]

## Contributing

Contributions welcome! Please ensure code follows style guidelines and includes tests.
