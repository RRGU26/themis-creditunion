# Themis Regulatory Intelligence Module

A white-label regulatory intelligence dashboard powered by the BankRegPulse API.

---

## BankRegPulse API Endpoints Used

This module consumes the following endpoints from the BankRegPulse Enterprise API:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v1/documents` | GET | Fetch regulatory documents with pagination and filtering |
| `/v1/documents/:id` | GET | Fetch single document with full AI analysis |
| `/v1/daily-brief/latest` | GET | Today's intelligence briefing with embedded email content |
| `/v1/daily-brief/history` | GET | Previous daily briefings (last 7 days) |

### Authentication

All requests require the `X-API-Key` header:

```
X-API-Key: brp_xxxxxxxxxxxx
```

### Endpoint Details

#### GET /v1/documents

Query parameters:
- `limit` - Number of documents (default: 50)
- `offset` - Pagination offset
- `priority` - Filter by priority (high, medium, low)
- `agency` - Filter by agency code
- `since` - Filter by date (ISO format)

Response includes:
- Document metadata (title, agency, date, priority)
- AI-generated summary
- Impact score
- Development type and domain classification

#### GET /v1/daily-brief/latest

Returns today's intelligence briefing with:
- Summary statistics (total docs, high priority count, tweets, news)
- Breakdown by agency, type, and domain
- Sentiment score and trend analysis
- **Embedded email content** (HTML + AI summary) - no regeneration needed
- High priority items list

#### GET /v1/daily-brief/history

Query parameters:
- `limit` - Number of briefs to return (default: 10)

Returns previous daily briefings with metrics for trend analysis.

---

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your BankRegPulse API key

# Start development server
npm run dev
```

Open http://localhost:5173

---

## Layout

```
+-----------------------------------+----------------------------------------+
|  LEFT PANEL (35%)                 |  RIGHT PANEL (65%)                     |
|                                   |                                        |
|  [Daily Intelligence Brief]       |  [New in Last 24 Hours]                |
|  Saturday, January 10, 2026       |  8 regulatory developments   [1 High]  |
|                                   |                                        |
|  +--------+ +--------+            +----------------------------------------+
|  |Total   | |High    |            |                                        |
|  |Docs: 8 | |Pri: 1  |            |  [Regulatory Developments Queue]       |
|  +--------+ +--------+            |                                        |
|  +--------+ +--------+            |  [Filter: Agency | Type | Domain]      |
|  |Twitter | |News    |            |                                        |
|  |15      | |12      |            |  +----------------------------------+  |
|  +--------+ +--------+            |  | OCC | Jan 9 | Final Rule         |  |
|                                   |  | Charter modernization...         |  |
|  [Email Content]                  |  +----------------------------------+  |
|  AI Executive Summary...          |  | FED | Jan 9 | Speech             |  |
|  Daily Activity Overview...       |  | Supervision priorities...        |  |
|  Key Regulatory Signals...        |  +----------------------------------+  |
|                                   |  | FDIC | Jan 8 | Notice            |  |
|  [Sentiment: 67 - Stable]         |  | Call report guidance...          |  |
|                                   |  +----------------------------------+  |
|  [Previous Briefs]                |                                        |
|  - Jan 9: 12 docs                 |  [Prev] Page 1/57 [Next]               |
|  - Jan 8: 8 docs                  |                                        |
+-----------------------------------+----------------------------------------+
```

---

## Environment Variables

Create a `.env` file:

```env
VITE_BANKREGPULSE_API_KEY=brp_xxxxxxxxxxxx
VITE_API_BASE_URL=https://bankregpulse-enterprise-api.onrender.com
```

---

## Tech Stack

- **React 18** + TypeScript
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Query** - Data fetching & caching
- **Lucide React** - Icons

---

## Deployment

Deploy to Vercel, Netlify, or any static hosting:

```bash
npm run build
# Deploy dist/ folder
```

Set environment variables in your hosting platform's dashboard.

---

## Repository

https://github.com/RRGU26/themis-bankregpulse
