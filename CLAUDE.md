# Themis Credit Union Module

## Overview
Embeddable regulatory intelligence module for Themis that consumes the BankRegPulse Credit Union API.

Monitors NCUA (National Credit Union Administration) regulatory developments.

## Tech Stack
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- React Query (data fetching)
- Lucide React (icons)

## Key Commands
```bash
npm run dev      # Start dev server (http://localhost:5173)
npm run build    # Production build
npm run preview  # Preview production build
```

## API Configuration
Set in `.env`:
```
VITE_BANKREGPULSE_API_KEY=brp_xxx...
VITE_API_BASE_URL=https://bankregpulse-enterprise-api.onrender.com
```

## API Endpoints Used
- `GET /v1/cu/documents` - NCUA regulatory documents feed
- `GET /v1/cu/documents/:id` - Single document detail
- `GET /v1/cu/daily-brief/latest` - CU daily intelligence summary
- `GET /v1/sentiment/current` - Shared regulatory sentiment score

## Project Structure
```
src/
├── main.tsx           # Entry point with QueryClient
├── App.tsx            # Main two-panel layout
├── components/
│   ├── DailyBriefPanel.tsx   # Left panel
│   ├── DashboardTiles.tsx    # Stat cards
│   ├── PriorityQueue.tsx     # Document list
│   ├── DocumentCard.tsx      # Single doc card
│   ├── DocumentModal.tsx     # Expanded doc view
│   └── DocumentBadges.tsx    # Badge components
├── hooks/
│   ├── useDocuments.ts       # Documents query
│   └── useDailyBrief.ts      # Brief query
└── services/
    └── api.ts                # API client (CU endpoints)
```

## Layout
- LEFT: Daily Brief summary (NCUA activity, sentiment)
- RIGHT TOP: Dashboard tiles (total, high priority, new today, sentiment)
- RIGHT BOTTOM: Priority queue (scrollable document list)

## Deployment
Deploy to Vercel or Netlify. Set environment variables in the hosting platform.
