# 01 — Architecture Rules: Next.js 14 App Router

**Project:** WC2026 Internal Betting App
**Stack:** Next.js 14 (App Router) · Tailwind CSS · Supabase · TypeScript · Vercel

---

## RULE 0 — Hard Constraints (Non-Negotiable)

| # | Rule |
|---|------|
| R-01 | Every `.ts` / `.tsx` file **MUST be ≤ 150 lines**. Split if exceeded. |
| R-02 | **No client-side time checks** for bet locking. All time validation lives in DB (`NOW()`) or Server Actions. |
| R-03 | Use **Server Components by default**. Add `"use client"` only when you need interactivity, browser APIs, or hooks. |
| R-04 | All **mutations** (place bet, enter score, create user) go through **Server Actions** or **API Route Handlers** — never direct Supabase calls from the browser for write ops. |
| R-05 | Role checks happen **server-side only** (middleware + server components + RLS). Never trust the client for authorization. |

---

## RULE 1 — Folder & Route Structure

```
d:\PerData\wc2026\
├── app/
│   │
│   ├── (auth)/                         # Unauthenticated routes — no main nav
│   │   ├── login/
│   │   │   └── page.tsx                # Login form (email + password)
│   │   └── change-password/
│   │       └── page.tsx                # Forced first-login password change
│   │
│   ├── (main)/                         # Authenticated player views
│   │   ├── layout.tsx                  # Main shell: header, nav, role badge
│   │   ├── page.tsx                    # Root redirect → /matches
│   │   ├── matches/
│   │   │   ├── page.tsx                # All matches list (filter by round/status)
│   │   │   └── [matchId]/
│   │   │       └── page.tsx            # Match detail + bet card
│   │   ├── leaderboard/
│   │   │   └── page.tsx                # Public live leaderboard
│   │   ├── history/
│   │   │   └── [userId]/
│   │   │       └── page.tsx            # View any user's full bet history
│   │   └── profile/
│   │       └── page.tsx                # Own settings + voluntary password change
│   │
│   ├── (admin)/                        # Superuser + Admin management panel
│   │   ├── layout.tsx                  # Admin shell (role guard: admin | superuser)
│   │   ├── users/
│   │   │   ├── page.tsx                # User list (Admin only)
│   │   │   └── new/
│   │   │       └── page.tsx            # Create user + set initial password
│   │   └── matches/
│   │       ├── page.tsx                # Match management table
│   │       ├── sync/
│   │       │   └── page.tsx            # Trigger Bet365 sync (group stage)
│   │       ├── new/
│   │       │   └── page.tsx            # Create knockout match manually
│   │       └── [matchId]/
│   │           └── settle/
│   │               └── page.tsx        # Enter score → PENDING_SETTLEMENT
│   │
│   └── api/                            # Route Handlers (server-side only)
│       ├── bets/
│       │   └── route.ts                # POST (place) · PATCH (update)
│       ├── matches/
│       │   ├── route.ts                # GET list · POST create
│       │   ├── sync/
│       │   │   └── route.ts            # POST — trigger Bet365 sync
│       │   └── [matchId]/
│       │       ├── settle/
│       │       │   └── route.ts        # POST — request settlement
│       │       └── confirm/
│       │           └── route.ts        # POST — lock settlement after 15 min
│       ├── admin/
│       │   └── users/
│       │       └── route.ts            # POST create user (Admin only)
│       └── leaderboard/
│           └── route.ts                # GET leaderboard snapshot
│
├── components/
│   ├── ui/                             # shadcn/ui primitives (button, badge, card…)
│   ├── auth/
│   │   ├── LoginForm.tsx               # "use client" — controlled form
│   │   └── ChangePasswordForm.tsx      # "use client" — controlled form
│   ├── matches/
│   │   ├── MatchCard.tsx               # Match tile: teams, time, status badge
│   │   ├── MatchList.tsx               # Filtered, grouped list of MatchCard
│   │   ├── BetSelector.tsx             # "use client" — HOME_WIN / DRAW / AWAY_WIN picker
│   │   ├── MatchStatusBadge.tsx        # Color-coded status pill
│   │   ├── CountdownTimer.tsx          # "use client" — countdown to kickoff
│   │   └── ScoreEntryForm.tsx          # "use client" — Superuser score input
│   ├── leaderboard/
│   │   ├── LeaderboardTable.tsx        # Realtime-subscribed ranking table
│   │   └── PlayerRow.tsx               # Single rank row with streak indicator
│   └── layout/
│       ├── Header.tsx                  # Top bar: logo, user menu
│       ├── MainNav.tsx                 # Bottom/side nav links
│       └── RoleGuard.tsx              # Server component — redirects by role
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                   # createBrowserClient() — for Client Components
│   │   ├── server.ts                   # createServerClient() — for Server Components
│   │   └── middleware.ts               # Session refresh helper
│   ├── actions/                        # Server Actions ("use server")
│   │   ├── auth.actions.ts             # login, changePassword, createUser
│   │   ├── bet.actions.ts              # placeBet, updateBet
│   │   └── match.actions.ts            # createMatch, settle, confirmSettle, syncBet365
│   └── utils/
│       ├── roles.ts                    # Role enum + helper: hasRole(role, min)
│       └── scoring.ts                  # computePenalty(prediction, result)
│
├── types/
│   └── index.ts                        # All shared TypeScript interfaces & enums
│
└── middleware.ts                       # Edge middleware: session + role-based redirect
```

---

## RULE 2 — Routing & Access Control Matrix

| Route prefix | Allowed roles | Guard mechanism |
|---|---|---|
| `/login`, `/change-password` | Public (unauthenticated) | Middleware redirects if already logged in |
| `/(main)/*` | `user`, `superuser`, `admin` | Middleware: redirect to `/login` if no session |
| `/(main)/matches/[id]` — bet form | `user` only (read for all) | RLS blocks write for non-users |
| `/(admin)/*` | `admin`, `superuser` | Layout RoleGuard + middleware |
| `/(admin)/users/*` | `admin` only | RoleGuard throws 403 for superuser |
| `/(admin)/matches/[id]/settle` | `superuser` only | RoleGuard checks role === 'superuser' |

**Middleware logic (middleware.ts):**
1. Refresh Supabase session cookie.
2. If accessing `/(main)` or `/(admin)` without session → redirect `/login`.
3. If `must_change_password === true` and not on `/change-password` → redirect `/change-password`.
4. If accessing `/(admin)` and role is `user` → redirect `/matches`.

---

## RULE 3 — Component Authoring Rules

```
Server Component (default)
  └── Async function, fetches data directly via supabase/server.ts
  └── Never import hooks (useState, useEffect)
  └── Can import Client Components as children

Client Component ("use client")
  └── Only for: forms, real-time subscriptions, countdown timers, interactive UI state
  └── Receives data as props from Server Component parent
  └── Never calls supabase write methods directly — uses Server Actions
```

**File size enforcement:**
- Each component handles ONE responsibility.
- If a page file exceeds ~100 lines of JSX, extract a sub-component.
- Data-fetching logic extracted to `lib/actions/` or inline async functions in the Server Component.

---

## RULE 4 — Data Fetching Patterns

```typescript
// ✅ CORRECT — Server Component fetching
// app/(main)/leaderboard/page.tsx
export default async function LeaderboardPage() {
  const supabase = createServerClient()
  const { data } = await supabase.from('leaderboard').select('*')
  return <LeaderboardTable rows={data} />
}

// ✅ CORRECT — Realtime in Client Component
// components/leaderboard/LeaderboardTable.tsx
"use client"
// Subscribe to changes via supabase.channel() in useEffect

// ❌ FORBIDDEN — Client-side write without Server Action
// Never: supabase.from('bets').insert({...}) in a Client Component
```

---

## RULE 5 — Naming Conventions

| Type | Convention | Example |
|---|---|---|
| Pages | `page.tsx` (Next.js convention) | `app/(main)/matches/page.tsx` |
| Layouts | `layout.tsx` | `app/(admin)/layout.tsx` |
| Components | PascalCase | `BetSelector.tsx` |
| Server Actions | camelCase + `.actions.ts` suffix | `bet.actions.ts` → `export async function placeBet()` |
| API routes | `route.ts` (Next.js convention) | `app/api/bets/route.ts` |
| Types/Interfaces | PascalCase, prefixed by domain | `MatchStatus`, `BetPrediction`, `UserProfile` |
| DB columns | `snake_case` (mirrors Supabase) | `match_datetime`, `penalty_points` |

---

## RULE 6 — Environment Variables

```
# .env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # Server-side only — NEVER expose to client
ODDS_API_KEY=                      # Bet365 / The Odds API — server-side only
SETTLEMENT_CRON_SECRET=            # Vercel Cron auth header
```

- `NEXT_PUBLIC_*` → safe to expose, used in `client.ts`.
- All others → server-side only, used in `server.ts`, API routes, Server Actions.

---

## RULE 7 — World Cup 2026 Specific Round Constants

```typescript
// types/index.ts
export const MATCH_ROUNDS = [
  { id: 'group_stage',  name: 'Vòng Bảng',         order: 1 },
  { id: 'round_of_32', name: 'Vòng 32 Đội',        order: 2 }, // ← WC2026 new round
  { id: 'round_of_16', name: 'Vòng 16 Đội (1/8)',  order: 3 },
  { id: 'quarterfinal',name: 'Tứ Kết',             order: 4 },
  { id: 'semifinal',   name: 'Bán Kết',            order: 5 },
  { id: 'third_place', name: 'Tranh Hạng 3',       order: 6 },
  { id: 'final',       name: 'Chung Kết',          order: 7 },
] as const
```

> **WHY:** WC2026 expands to 48 teams. The first knockout round is Round of 32 (not Round of 16), adding one full layer compared to previous World Cups. Hard-coding 4 knockout rounds would silently drop the Round of 32.
