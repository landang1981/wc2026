# 08 — Environment Variables & Deployment Specification

**Project:** WC2026 Internal Betting App
**Hosting:** Vercel (Production + Preview) · Supabase (managed PostgreSQL)
**Environments:** `local` · `staging` (Vercel Preview) · `production` (Vercel Production)

> **Secret** = value must never be committed to git, logged, or exposed to the browser.
> **Public** = safe to expose; prefixed with `NEXT_PUBLIC_` in Next.js.

---

## Part 1 — Complete Variable Registry

### 1.1 Supabase

| Variable | Local | Staging | Production | Secret | Notes |
|---|:---:|:---:|:---:|:---:|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✓ | ✓ | ✓ | No | Project API URL from Supabase dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✓ | ✓ | ✓ | No | Public anon key — scoped by RLS policies |
| `SUPABASE_SERVICE_ROLE_KEY` | ✓ | ✓ | ✓ | **YES** | Bypasses RLS. Server-side only. Admin user creation. |
| `SUPABASE_JWT_SECRET` | ✓ | ✓ | ✓ | **YES** | Verify JWT signatures server-side. From Supabase Settings → API |

### 1.2 External Data API (The Odds API / Bet365 Feed)

| Variable | Local | Staging | Production | Secret | Notes |
|---|:---:|:---:|:---:|:---:|---|
| `ODDS_API_KEY` | ✓ | ✓ | ✓ | **YES** | API key for The Odds API (`the-odds-api.com`). Used only in `/api/matches/sync` route. |
| `ODDS_API_BASE_URL` | ✓ | ✓ | ✓ | No | `https://api.the-odds-api.com/v4` — override for mock server in local dev |
| `ODDS_API_SPORT_KEY` | ✓ | ✓ | ✓ | No | `soccer_fifa_world_cup` — sport identifier constant |

### 1.3 Settlement Cron Security

| Variable | Local | Staging | Production | Secret | Notes |
|---|:---:|:---:|:---:|:---:|---|
| `SETTLEMENT_CRON_SECRET` | ✓ | ✓ | ✓ | **YES** | Bearer token checked by `/api/cron/*` routes. Generate with `openssl rand -hex 32`. |

### 1.4 Application Configuration

| Variable | Local | Staging | Production | Secret | Notes |
|---|:---:|:---:|:---:|:---:|---|
| `NEXT_PUBLIC_APP_URL` | ✓ | ✓ | ✓ | No | Full origin URL. Local: `http://localhost:3000`. Production: `https://wc2026.yourdomain.com` |
| `NEXT_PUBLIC_APP_NAME` | ✓ | ✓ | ✓ | No | `WC2026 Bets` — used in `<title>` and OG meta |
| `NEXT_PUBLIC_TOURNAMENT_YEAR` | ✓ | ✓ | ✓ | No | `2026` |
| `SETTLEMENT_WINDOW_MINUTES` | ✓ | ✓ | ✓ | No | `15` — correction window before bets are locked. Must match DB interval in `confirm_match_settlement()`. |

### 1.5 Feature Flags (Optional)

| Variable | Local | Staging | Production | Secret | Notes |
|---|:---:|:---:|:---:|:---:|---|
| `NEXT_PUBLIC_ENABLE_REALTIME` | ✓ | ✓ | ✓ | No | `true` / `false` — disable Supabase Realtime subscription for debugging |
| `NEXT_PUBLIC_SHOW_DEBUG_BANNER` | ✓ | — | — | No | `true` in local only — shows env badge in header |

---

## Part 2 — Local Development Setup

### Step 1: Copy the template

```bash
cp .env.example .env.local
```

### Step 2: `.env.local` (gitignored — never commit)

```dotenv
# ─── Supabase (local Supabase CLI or cloud dev project) ────────────
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<paste from: supabase status>
SUPABASE_SERVICE_ROLE_KEY=<paste from: supabase status>
SUPABASE_JWT_SECRET=<paste from: supabase status>

# ─── Odds API (use mock URL locally to avoid burning quota) ────────
ODDS_API_KEY=your_odds_api_key_here
ODDS_API_BASE_URL=http://localhost:4000/v4
ODDS_API_SPORT_KEY=soccer_fifa_world_cup

# ─── Cron secret (any random string works locally) ─────────────────
SETTLEMENT_CRON_SECRET=dev-local-secret-not-for-prod

# ─── App config ────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=WC2026 Bets
NEXT_PUBLIC_TOURNAMENT_YEAR=2026
SETTLEMENT_WINDOW_MINUTES=15

# ─── Feature flags ─────────────────────────────────────────────────
NEXT_PUBLIC_ENABLE_REALTIME=true
NEXT_PUBLIC_SHOW_DEBUG_BANNER=true
```

### Step 3: `.env.example` (committed — safe placeholder file)

```dotenv
# Copy this file to .env.local and fill in real values.
# Never put real secrets in this file.

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=

ODDS_API_KEY=
ODDS_API_BASE_URL=https://api.the-odds-api.com/v4
ODDS_API_SPORT_KEY=soccer_fifa_world_cup

SETTLEMENT_CRON_SECRET=

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=WC2026 Bets
NEXT_PUBLIC_TOURNAMENT_YEAR=2026
SETTLEMENT_WINDOW_MINUTES=15

NEXT_PUBLIC_ENABLE_REALTIME=true
NEXT_PUBLIC_SHOW_DEBUG_BANNER=false
```

---

## Part 3 — Vercel Environment Configuration

### Environment mapping

| Vercel Environment | Git target | Supabase project |
|---|---|---|
| Production | `main` branch | `wc2026-prod` (dedicated project) |
| Preview | `staging` branch | `wc2026-staging` (separate project) |
| Development | `develop` + PRs | Dev team's local Supabase CLI |

### Setting variables in Vercel Dashboard

Path: **Project → Settings → Environment Variables**

For each secret variable, set:
- Environment: `Production` and `Preview` separately (different Supabase URLs!)
- Sensitive toggle: **ON** (hides value after save, excludes from build logs)

### Staging-specific overrides (Preview environment)

```dotenv
# Set separately in Vercel Preview environment
NEXT_PUBLIC_SUPABASE_URL=https://<staging-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<staging anon key>
SUPABASE_SERVICE_ROLE_KEY=<staging service role key>
SUPABASE_JWT_SECRET=<staging jwt secret>
NEXT_PUBLIC_APP_URL=https://wc2026-staging.vercel.app
NEXT_PUBLIC_SHOW_DEBUG_BANNER=false
```

---

## Part 4 — Vercel Project Configuration

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/confirm-settlements",
      "schedule": "*/5 * * * *"
    },
    {
      "path": "/api/cron/void-postponed",
      "schedule": "0 6 * * *"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" }
      ]
    }
  ]
}
```

### Cron route authentication pattern

```typescript
// app/api/cron/confirm-settlements/route.ts
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest): Promise<Response> {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.SETTLEMENT_CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // ... run settlement logic
}
```

---

## Part 5 — `.gitignore` Entries (secrets-related)

```gitignore
# Environment files — NEVER commit
.env
.env.local
.env.*.local
.env.production
.env.staging

# Allow only the safe example file
!.env.example
```

---

## Part 6 — Secret Rotation Checklist

If any secret is suspected to be compromised:

| Secret | Rotation steps |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → Regenerate. Update in Vercel immediately. |
| `SUPABASE_JWT_SECRET` | Requires Supabase support (managed). Rotating invalidates all active sessions. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Dashboard → Regenerate. All browser clients reconnect on next page load. |
| `ODDS_API_KEY` | The Odds API dashboard → revoke + issue new key. |
| `SETTLEMENT_CRON_SECRET` | Generate new: `openssl rand -hex 32`. Update Vercel + `vercel.json` Authorization header simultaneously. |

After any rotation: **redeploy** Vercel production to apply new env vars.

---

## Part 7 — Environment Variable Access Rules

```typescript
// ✅ CORRECT — server-only secret, accessed in Server Action / API route
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!   // never in client.ts
)

// ✅ CORRECT — public var in Client Component
const url = process.env.NEXT_PUBLIC_SUPABASE_URL  // safe, prefixed

// ❌ FORBIDDEN — secret accessed in client-side code
// components/SomeClientComponent.tsx
const key = process.env.SUPABASE_SERVICE_ROLE_KEY  // Next.js strips this → undefined
// But the INTENT is the violation — never reference server secrets in "use client" files

// ❌ FORBIDDEN — logging secrets at any level
console.log('API Key:', process.env.ODDS_API_KEY)
```

**Enforcement:** ESLint rule `no-console: error` catches logging. Code review checklist explicitly verifies no secrets are passed as props, stored in state, or logged.
