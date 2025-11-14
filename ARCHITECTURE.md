# ARYA Mobility OS - Architecture & Design

## System Architecture

```
┌─────────────────────────────────────────────────┐
│              Browser / Client                    │
├─────────────────────────────────────────────────┤
│  Landing Page (SPYLT)    │    ARYA Mobility App │
│  ├─ HeroSection          │    ├─ Dashboard      │
│  ├─ FlavorSection        │    ├─ Map View       │
│  ├─ TesimonialSection    │    ├─ EV Network     │
│  └─ FooterSection        │    ├─ Routes         │
│                          │    ├─ Health/Safety  │
│                          │    └─ Settings       │
├─────────────────────────────────────────────────┤
│         Next.js 15 App Router (Runtime)         │
├─────────────────────────────────────────────────┤
│              API Routes (Server)                 │
│  ├─ /api/arya          (ARYA Assistant)        │
│  └─ /api/mobility      (Mobility Data)         │
├─────────────────────────────────────────────────┤
│         Simulation Layer (Memory)               │
│  ├─ EV Charger Simulator                       │
│  ├─ Parking Simulator                          │
│  ├─ Heat Index Simulator                       │
│  ├─ Events Simulator                           │
│  └─ Transit Simulator                          │
├─────────────────────────────────────────────────┤
│        External Services (Optional)              │
���  ├─ Google Gemini (AI)                         │
│  ├─ Mapbox (Mapping)                           │
│  ├─ Builder.io (CMS)                           │
│  └─ Dubai RTA APIs (Future)                    │
└─────────────────────────────────────────────────┘
```

## Data Flow Architecture

### Landing Page Flow
```
User -> Landing Page (SSR) -> GSAP Animations -> User Interaction
                                                 ↓
                                          Navbar Interaction
                                          NavMenu Toggle
```

### Mobility App Flow
```
User Input (Dashboard/Search)
        ↓
React State / Form Submission
        ↓
Fetch /api/arya or /api/mobility
        ↓
Server-side Simulator Processing
        ↓
Return JSON Response
        ↓
Update UI Components
        ↓
Display Results / Map / Data
```

### ARYA Assistant Flow
```
User Message (Chat Input)
        ↓
Identify Intent (Keyword Analysis)
        ↓
Route to Handler:
  ├─ EV Handler → getEVChargers()
  ├─ Parking Handler → getParkingZones()
  ├─ Heat Handler → getHeatIndex()
  ├─ Route Handler → Route Planning
  └─ Transit Handler → getTransitStops()
        ↓
Call Simulator Functions
        ↓
Format Response
        ↓
Return AssistantResponse JSON
        ↓
Display in Chat UI
```

## Component Hierarchy

### Landing Page
```
LandingPage (wrapper)
├─ PreLoader
├─ Navbar
│  ├─ NavMenu
├─ HeroSection
├─ MessageSection
├─ FlavorSection
│  ├─ FlavorTitle
│  └─ FlavorSlider
├─ NutritionSection
├─ BenefitSection
│  └─ VideoPin
├─ TestimonialSection
├─ BottomBanner
└─ FooterSection
```

### App Pages
```
AppLayout (root)
├─ Sidebar Navigation
├─ Header (with metrics)
└─ [Route Page]
   ├─ Overview Dashboard
   │  ├─ MetricCards
   │  ├─ QuickActions
   │  ├─ NearbyChargers
   │  └─ AIAssistant
   ├─ Map Page
   ├─ EV Page
   ├─ Routes Page
   ├─ Health Page
   ├─ Events Page
   └─ Settings Page
```

## Type System

All data structures are defined in `types/mobility.ts` with strict TypeScript interfaces:

```typescript
// Geography
Location
├─ id: string
├─ latitude: number
├─ longitude: number
├─ address: string
└─ district: string

// Mobility
EVCharger extends Location
ParkingZone extends Location
TransitRoute
TransitStop extends Location
MobilitySharing

// Health
HeatIndex
HealthRisk

// Events
Event

// Routing
RouteOption
RouteStep

// User
UserPreferences

// AI
ChatMessage
AssistantResponse
```

## State Management Strategy

### Local State (React Hooks)
Used for:
- UI toggles (sidebar open/closed)
- Form inputs
- Temporary data loading states
- Single-page component state

### Server State (Simulators)
Used for:
- EV charger data
- Parking availability
- Heat index
- Events
- Transit routes

### Future: Global State (Zustand)
For:
- User preferences cache
- Conversation history
- Selected filters/modes
- User location

```typescript
// Example store structure (future)
import create from 'zustand';

interface MobilityStore {
  userLocation: Location | null;
  preferences: UserPreferences;
  selectedMode: string;
  cachedData: Map<string, unknown>;
  
  setLocation: (loc: Location) => void;
  setPreferences: (prefs: UserPreferences) => void;
}

export const useMobilityStore = create<MobilityStore>(...)
```

## API Design

### Request/Response Patterns

```typescript
// ARYA Assistant
POST /api/arya
Request: {
  message: string
  conversationHistory?: ChatMessage[]
  userLocation?: { latitude, longitude }
}
Response: {
  message: string
  actions?: AssistantAction[]
  data?: unknown
  suggestedRoutes?: RouteOption[]
}

// Mobility Data
GET /api/mobility?type=chargers|parking|transit|events
Response: {
  success: boolean
  data: T[]
  timestamp: string
  error?: string
}
```

### Error Handling

```typescript
try {
  // Fetch data
} catch (error) {
  console.error('API Error:', error)
  return {
    success: false,
    error: 'User-friendly message',
    timestamp: new Date().toISOString()
  }
}
```

## Performance Considerations

### Optimizations

1. **Code Splitting**: Automatic via Next.js App Router
2. **Image Optimization**: Use `next/image` (already imported in landing)
3. **Static Generation**: Use `generateStaticParams` for predictable routes
4. **ISR (Incremental Static Regeneration)**: Cache simulator data
5. **Lazy Loading**: Components load on demand

### Caching Strategy

```typescript
// API Response Caching
const response = await fetch(url, {
  next: { revalidate: 3600 } // Cache for 1 hour
})

// Simulator Data Caching (future)
const cachedChargers = useMobilityStore(s => s.cachedChargers)
if (!cachedChargers) {
  const fresh = getEVChargers()
  useMobilityStore.setState({ cachedChargers: fresh })
}
```

### Bundle Size

Current estimated bundle:
- Landing Page: ~150KB (GSAP, animations)
- App Bundle: ~200KB (Tailwind, Lucide icons)
- Total: ~350KB (gzipped: ~100KB)

Monitor with:
```bash
npm run build
# Check `.next/static/` directory
```

## Security Considerations

### Environment Variables

```
✅ Safe to expose:
- NEXT_PUBLIC_* variables
- Mapbox token (has usage limits)
- Builder.io API key (public CMS)

❌ Never expose:
- Database credentials
- Admin API keys
- Webhooks
- Internal IPs
```

### Input Validation

```typescript
// Example: Validate coordinates
if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
  throw new Error('Invalid coordinates')
}

// Example: Sanitize user input for ARYA
const sanitizedMessage = message.trim().substring(0, 500)
```

### API Rate Limiting (Future)

```typescript
// Using middleware
export async function middleware(request: NextRequest) {
  const ip = request.ip || 'unknown'
  const limit = await checkRateLimit(ip)
  
  if (limit.exceeded) {
    return new NextResponse('Too many requests', { status: 429 })
  }
}
```

## Testing Strategy

### Unit Tests (Jest)
```bash
npm test
# Test individual functions, simulators, utilities
```

### Integration Tests
```bash
npm run test:integration
# Test API routes, data flow
```

### E2E Tests (Cypress)
```bash
npm run test:e2e
# Test user flows, navigation, interactions
```

## Deployment Considerations

### Build Process
```bash
npm run build
# Creates optimized production build
# Checks for TypeScript errors
# Optimizes images
```

### Environment Setup (Vercel)
```
Dashboard → Project Settings → Environment Variables
- NEXT_PUBLIC_GEMINI_API_KEY
- NEXT_PUBLIC_MAPBOX_TOKEN
- NEXT_PUBLIC_BUILDER_API_KEY
```

### Monitoring
- Use Sentry for error tracking
- Enable Vercel Analytics
- Monitor API response times
- Track Core Web Vitals

## Future Architecture Improvements

### Phase 1: Current
- Simulated data
- Single-user experience
- Static asset serving

### Phase 2: Authentication
- NextAuth.js integration
- User profiles
- Persistent preferences
- Conversation history

### Phase 3: Real APIs
- RTA Dubai APIs
- Real EV charger networks
- Live transit data
- Weather services

### Phase 4: Advanced Features
- ML-based route optimization
- Real-time traffic data
- Crowd sensing
- Payment integration

### Phase 5: Scaling
- Database (PostgreSQL via Prisma)
- Redis caching
- Message queues (Bull/RabbitMQ)
- CDN optimization
- Edge functions

## Code Organization Principles

### Keep It Simple
- One responsibility per file
- Clear, descriptive names
- Minimal nesting

### Reusability
- Extract common patterns
- Create utilities for repeated logic
- Share types across modules

### Maintainability
- Add JSDoc comments for complex functions
- Log important events
- Use TypeScript strictly
- Test edge cases

### Performance
- Avoid unnecessary re-renders
- Memoize expensive computations
- Lazy load components
- Cache API responses

## Documentation Standards

### Code Comments
```typescript
/**
 * Fetch EV chargers within a radius
 * @param location - Starting location
 * @param radiusKm - Search radius in kilometers
 * @returns Array of available EV chargers
 */
function getChargersNearLocation(
  location: Location,
  radiusKm: number
): EVCharger[] {
  // Implementation
}
```

### README.md
- Setup instructions
- Feature overview
- Project structure
- Deployment guide

### ARCHITECTURE.md (this file)
- System design
- Data flow
- Component hierarchy
- Performance considerations

### API Documentation
- Endpoint specs
- Request/response examples
- Error codes
- Authentication (if needed)

## Summary

ARYA Mobility OS is architected as:
1. **Presentation Layer**: Next.js pages + React components
2. **Business Logic**: Simulator functions + API routes
3. **Data Layer**: Simulated data (upgradeable to real APIs)
4. **External Services**: Optional Gemini, Mapbox, Builder.io

This design is scalable, maintainable, and production-ready while remaining flexible for future integrations.
