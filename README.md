# FinSight AI — AI-Powered Financial Report Analyzer

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript) ![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite) ![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?logo=supabase) ![Gemini](https://img.shields.io/badge/Google-Gemini-4285F4?logo=google)

FinSight AI lets users upload financial report PDFs (10-K, 10-Q, annual reports) and instantly generates an AI-powered analysis — including an executive summary, KPI extraction, risk factor highlights, and an overall financial health score — all saved to a personal dashboard.

---

## Table of Contents

- [Key Features](#key-features)
- [Pages](#pages)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Data Model](#data-model)
- [Edge Function / AI Pipeline](#edge-function--ai-pipeline)
- [Getting Started](#getting-started)
- [Security Notes](#security-notes)
- [Known Limitations](#known-limitations)
- [Project Structure](#project-structure)

---

## Key Features

- **PDF upload** — financial reports up to 10 MB (PDF only)
- **AI analysis** via Google Gemini (server-side, through Supabase Edge Function):
  - Executive summary
  - KPI extraction (revenue, net income, EBITDA, EPS, total debt, cash flow)
  - Risk factors list
  - Financial health score (0–100)
- **Personal dashboard** — recent analyses, usage counters, health score gauge
- **Analysis history** — saved results per user, viewable at any time
- **User authentication** — email/password sign up, sign in, persistent sessions
- **Subscription tracking** — free plan (2 analyses/month), pro plan support
- **Secure storage** — PDFs stored in a private Supabase Storage bucket scoped per user

---

## Pages

| Route | Description |
|---|---|
| `/` | Landing page |
| `/login` | Sign in |
| `/signup` | Create account |
| `/upload` | Upload a financial report PDF |
| `/dashboard` | Overview — recent analyses + usage stats |
| `/analysis/:id` | Detailed analysis — KPIs, risk factors, summary |
| `/history` | Full analysis history |
| `/settings` | Account settings |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| UI | Tailwind CSS, shadcn/ui (Radix UI), Framer Motion, Recharts |
| Routing | React Router v6 |
| Data fetching | TanStack React Query |
| Backend | Supabase (Auth + Postgres + Storage + Edge Functions) |
| AI Model | Google Gemini (`google/gemini-3-flash-preview`) via Lovable AI Gateway |
| Testing | Vitest + Testing Library |

---

## Architecture

```
┌─────────────────────────────────┐
│           React SPA             │
│  React Router + React Query     │
│  shadcn/ui + Tailwind CSS       │
└───────────────┬─────────────────┘
                │ HTTPS
┌───────────────▼─────────────────┐
│            Supabase             │
│  ┌─────────────────────────┐    │
│  │  Auth (email/password)  │    │
│  ├─────────────────────────┤    │
│  │  Storage                │    │
│  │  bucket: reports        │    │
│  │  (private, per-user)    │    │
│  ├─────────────────────────┤    │
│  │  Postgres + RLS         │    │
│  │  uploads                │    │
│  │  analysis_results       │    │
│  │  subscriptions          │    │
│  ├─────────────────────────┤    │
│  │  Edge Function          │    │
│  │  analyze-report         │    │
│  │  ↓                      │    │
│  │  Lovable AI Gateway     │    │
│  │  Google Gemini          │    │
│  └─────────────────────────┘    │
└─────────────────────────────────┘
```

**Upload & analysis flow:**

1. User uploads PDF → stored in Supabase Storage (`reports/{userId}/...`)
2. Frontend invokes `analyze-report` Edge Function with PDF as base64
3. Edge Function extracts text from PDF, sends to Gemini with structured prompt
4. Gemini returns JSON: summary + KPIs + risk factors + health score
5. Results saved to `analysis_results` table
6. Frontend displays results in dashboard and analysis detail page

---

## Data Model

| Table | Description |
|---|---|
| `uploads` | Uploaded PDF metadata — filename, storage path, status (`pending` → `processing` → `completed` / `failed`) |
| `analysis_results` | AI output — summary, `kpis_json`, `risk_factors`, `health_score` (0–100), linked to upload |
| `subscriptions` | Plan (`free` / `pro`), monthly usage counter, Stripe customer ID |

All tables have RLS policies — users can only access their own rows.
A database trigger auto-creates a `subscriptions` row on signup.

---

## Edge Function / AI Pipeline

The frontend invokes:

```
supabase.functions.invoke("analyze-report")
```

Inside the function:

- PDF bytes decoded from base64
- Text extracted (heuristic string parsing)
- Text sent to **Google Gemini** (`google/gemini-3-flash-preview`) via Lovable AI Gateway
- Structured JSON response parsed and returned to frontend

> The `LOVABLE_API_KEY` is stored **server-side** in Supabase Edge Function secrets — never exposed to the client.

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase project with migrations applied and Edge Function deployed

### Environment Variables

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<your-supabase-anon-key>
VITE_SUPABASE_PROJECT_ID=<your-project-ref>
```

The Edge Function requires these secrets (set in Supabase, not in frontend):

```bash
supabase secrets set LOVABLE_API_KEY="..."
supabase secrets set SUPABASE_URL="..."
supabase secrets set SUPABASE_ANON_KEY="..."
```

### Install & Run

```bash
npm install
npm run dev
```

### Supabase Setup

**Apply database migrations:**

```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

**Deploy Edge Function:**

```bash
supabase functions deploy analyze-report
```

---

## Security Notes

- `.env` is **not committed** — use `.env.local` for local development (see `.env.example`)
- `LOVABLE_API_KEY` (Gemini access) lives **only** in Supabase Edge Function secrets
- All database tables are protected by **Row Level Security** policies
- PDF files are stored in a **private** Supabase Storage bucket with per-user path policies

---

## Known Limitations

- PDF text extraction uses heuristic string parsing — **scanned or image-based PDFs** will not extract well (no OCR support)
- Accepts **PDF only** (no DOCX, images, or spreadsheets)
- Free plan limited to **2 analyses per month**
- "Export PDF" button in the analysis page UI is not yet implemented

---

## Project Structure

```
analyze-gem/
├── index.html
├── vite.config.ts
├── package.json
├── .env.example                    # Variable names only — copy to .env.local
├── src/
│   ├── App.tsx                     # Routes + providers
│   ├── main.tsx                    # App bootstrap
│   ├── pages/                      # Landing, Login, Signup, Upload,
│   │                               # Dashboard, Analysis, History, Settings
│   ├── components/
│   │   ├── DashboardLayout.tsx     # App shell with sidebar navigation
│   │   ├── HealthScoreGauge.tsx    # Circular gauge for financial health score
│   │   ├── KPICard.tsx             # KPI metric display card
│   │   ├── NavLink.tsx
│   │   └── ui/                     # shadcn/ui components
│   ├── hooks/
│   │   ├── useAuth.tsx             # Supabase auth state
│   │   └── use-mobile.tsx
│   ├── integrations/supabase/      # Supabase client + generated DB types
│   └── lib/utils.ts
└── supabase/
    ├── migrations/                 # Postgres schema + RLS + storage policies
    └── functions/
        └── analyze-report/         # AI analysis Edge Function (Gemini)
            └── index.ts
```

---

> **Portfolio note (PFA / internship):** FinSight AI demonstrates end-to-end product thinking — file upload pipeline, secure server-side AI integration (Google Gemini via Edge Functions), structured data extraction from unstructured documents, and a multi-table Supabase backend with RLS and subscription management.
