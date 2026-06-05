# WC2026 — Master Task List for Coding Agents

**Project:** WC2026 Internal Betting App
**Stack:** Next.js 14 · Supabase · Tailwind CSS · TypeScript · Vercel
**Spec files:** `01-architecture-rules.md` · `02-database-schema.md` · `03-api-contracts.md` · `04-design-system.md` · `05-dev-rules-workflow.md` · `08-env-deployment-spec.md`

**Status legend:** `[ ]` not started · `[~]` in progress · `[x]` done · `[!]` blocked

> **Hard rules every agent must follow:**
> - Every `.ts`/`.tsx` file ≤ 150 lines. Split if exceeded.
> - No `console.log`, no `any`, no `@ts-ignore`.
> - Server Components by default. `"use client"` only for forms/realtime/hooks.
> - All mutations via Server Actions or API Route Handlers — never direct Supabase writes from Client Components.
> - No client-side time checks for bet locking — use DB `NOW()` only.
> - All role checks server-side only.
> - No hardcoded hex colours in JSX/TSX — use Tailwind design tokens.

---

## PHASE 0 — Project Scaffolding & Tooling

> **Goal:** Runnable skeleton with all config wired. No features yet.
> **Ref:** `01-architecture-rules.md` RULE 0–7, `04-design-system.md` Part 1–3, `05-dev-rules-workflow.md` Part 4–6, `08-env-deployment-spec.md`

- [ ] **WC-001** — Init Next.js 14 project with App Router + TypeScript
  ```
  npx create-next-app@latest wc2026 --typescript --tailwind --app --src-dir=no --import-alias="@/*"
  ```
  Output: bare Next.js project in `d:\PerData\wc2026\`

- [ ] **WC-002** — Install all required dependencies
  ```
  npm install @supabase/supabase-js @supabase/ssr
  npm install clsx tailwind-merge class-variance-authority
  npm install date-fns
  npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser
  npm install -D eslint-config-next prettier prettier-plugin-tailwindcss
  npm install -D husky lint-staged
  ```

- [ ] **WC-003** — Write `tailwind.config.ts`
  - Full color palette: `neon`, `gold`, `pitch`, `result`, `status` tokens
  - Custom font families: `display`, `body`, `mono`
  - Custom font sizes: `score`, `hero`, `section`
  - Custom border radius: `card`, `pill`, `chip`
  - Custom box shadows: `neon`, `neon-sm`, `gold`, `card`, `card-hover`
  - Keyframes + animations: `pulse-live`, `neon-flicker`, `slide-up`, `rank-change`
  - Background images: `stadium-gradient`, `card-gradient`, `neon-gradient`, `gold-gradient`
  - **Ref:** `04-design-system.md` Part 1 (copy exact config)

- [ ] **WC-004** — Write `app/globals.css`
  - `@tailwind base/components/utilities`
  - Scrollbar styles, `::selection` with neon
  - `.text-neon-glow` and `.text-gold-glow` custom classes
  - **Ref:** `04-design-system.md` Part 3

- [ ] **WC-005** — Configure `tsconfig.json` with strict settings
  - `strict: true`, `noUncheckedIndexedAccess`, `noImplicitReturns`
  - `noFallthroughCasesInSwitch`, `exactOptionalPropertyTypes`
  - `forceConsistentCasingInFileNames`
  - **Ref:** `05-dev-rules-workflow.md` Part 4.1

- [ ] **WC-006** — Write `.eslintrc.json`
  - Extends: `next/core-web-vitals`, `@typescript-eslint/strict-type-checked`, `stylistic-type-checked`
  - Rules: `no-console: error`, `no-explicit-any: error`, `consistent-type-imports: error`
  - **Ref:** `05-dev-rules-workflow.md` Part 4.2

- [ ] **WC-007** — Write `.prettierrc`
  - `semi: false`, `singleQuote: true`, `tabWidth: 2`, `trailingComma: es5`, `printWidth: 100`
  - Plugin: `prettier-plugin-tailwindcss`
  - **Ref:** `05-dev-rules-workflow.md` Part 4.3

- [ ] **WC-008** — Setup Husky + lint-staged
  - `npm run prepare` → `husky`
  - `.husky/pre-commit` → `npx lint-staged`
  - `.lintstagedrc.json` → ESLint fix + Prettier write on `*.{ts,tsx}`
  - **Ref:** `05-dev-rules-workflow.md` Part 5

- [ ] **WC-009** — Write `.github/workflows/ci.yml`
  - Jobs: `type-check` (tsc --noEmit), `lint` (next lint), `format` (prettier --check)
  - Triggers on PR to `develop`, `staging`, `main`
  - **Ref:** `05-dev-rules-workflow.md` Part 6

- [ ] **WC-010** — Write `.github/pull_request_template.md`
  - Sections: Summary, Testing, Code Quality, DB/API, Design checklists
  - **Ref:** `05-dev-rules-workflow.md` Part 3

- [ ] **WC-011** — Create `.env.example` (committed, no secrets)
  - All 12 variables with empty values
  - Comments explaining each group
  - **Ref:** `08-env-deployment-spec.md` Part 2 Step 3

- [ ] **WC-012** — Update `.gitignore`
  - Add: `.env`, `.env.local`, `.env.*.local`, `.env.production`, `.env.staging`
  - Add `!.env.example` exception
  - **Ref:** `08-env-deployment-spec.md` Part 5

- [ ] **WC-013** — Write `vercel.json`
  - Two cron jobs: `/api/cron/confirm-settlements` (*/5 * * * *), `/api/cron/void-postponed` (0 6 * * *)
  - Security headers for `/api/*` routes
  - **Ref:** `08-env-deployment-spec.md` Part 4

---

## PHASE 1 — Database Setup (Run in Supabase SQL Editor)

> **Goal:** Full DB schema deployed to Supabase dev project. Run scripts in order.
> **Ref:** `02-database-schema.md` (entire file — run each block in sequence)
> **Note:** These are SQL scripts to execute in Supabase, not code files to write.

- [ ] **WC-014** — Create all ENUM types
  - `user_role`, `match_status` (7 values), `match_result`, `bet_prediction`
  - **Ref:** `02-database-schema.md` Part 1

- [ ] **WC-015** — Create `profiles` table + `handle_new_user` trigger
  - FK to `auth.users`, `must_change_password DEFAULT TRUE`
  - Trigger auto-creates profile on Supabase Auth insert
  - **Ref:** `02-database-schema.md` Part 2.1

- [ ] **WC-016** — Create `teams` table
  - `id SERIAL`, `country_code CHAR(3) UNIQUE`, `group_name CHAR(1)`
  - **Ref:** `02-database-schema.md` Part 2.2

- [ ] **WC-017** — Create `match_rounds` table + seed data (7 rows)
  - Includes `round_of_32` (WC2026-specific — do NOT omit)
  - Order: group_stage(1) → round_of_32(2) → round_of_16(3) → quarterfinal(4) → semifinal(5) → third_place(6) → final(7)
  - **Ref:** `02-database-schema.md` Part 2.3

- [ ] **WC-018** — Create `matches` table + indexes + `trg_compute_result` trigger
  - All 5 CHECK constraints must be present
  - Trigger auto-computes `result` from scores and sets `updated_at`
  - Indexes on: `match_datetime`, `status`, `round_id`
  - **Ref:** `02-database-schema.md` Part 2.4

- [ ] **WC-019** — Create `bets` table + indexes + `trg_settle_bets` trigger
  - `penalty_points CHECK (IN (0, 50))`
  - `UNIQUE (user_id, match_id)`
  - Trigger settles bets on match → SETTLED; resets on → VOID
  - **Ref:** `02-database-schema.md` Part 2.5

- [ ] **WC-020** — Create `audit_log` table + `trg_audit_matches` trigger
  - `BIGSERIAL` PK, JSONB old/new data
  - Trigger fires AFTER UPDATE on `matches`
  - **Ref:** `02-database-schema.md` Part 2.6

- [ ] **WC-021** — Create `leaderboard` VIEW
  - 4-CTE query: `settled_bets` → `player_totals` → `streak_breaks` → `current_streaks`
  - `RANK() OVER` with 3-tier sort: penalty ASC, streak DESC, earliest_bet ASC
  - Only includes profiles WHERE role = 'user'
  - **Ref:** `02-database-schema.md` Part 3

- [ ] **WC-022** — Create RPC function `settle_match()`
  - Auth check: role must be superuser or admin
  - Transition: SCHEDULED/LIVE → PENDING_SETTLEMENT
  - Sets `settlement_requested_at = NOW()`
  - Returns JSONB with `settles_at` timestamp
  - **Ref:** `02-database-schema.md` Part 4.1

- [ ] **WC-023** — Create RPC function `confirm_match_settlement()`
  - Checks: status = PENDING_SETTLEMENT AND window elapsed (> 15 min)
  - Transition: PENDING_SETTLEMENT → SETTLED
  - `trg_settle_bets` fires automatically after this update
  - **Ref:** `02-database-schema.md` Part 4.2

- [ ] **WC-024** — Create RPC function `void_postponed_matches()`
  - Updates POSTPONED matches where `match_datetime < NOW() - 48h` → VOID
  - Returns INTEGER count of affected rows
  - **Ref:** `02-database-schema.md` Part 4.3

- [ ] **WC-025** — Enable RLS on all tables + create helper `my_role()` function
  - Enable RLS: `profiles`, `teams`, `match_rounds`, `matches`, `bets`, `audit_log`
  - `my_role()` → SECURITY DEFINER, STABLE
  - **Ref:** `02-database-schema.md` Part 5 (top section)

- [ ] **WC-026** — Apply RLS policies: `profiles`
  - `profiles_read_all` (SELECT, authenticated, USING true)
  - `profiles_insert_admin` (INSERT, WITH CHECK my_role()='admin')
  - `profiles_update_self` (UPDATE, no role self-promotion)
  - `profiles_update_admin` (UPDATE, USING my_role()='admin')
  - **Ref:** `02-database-schema.md` Part 5 — profiles section

- [ ] **WC-027** — Apply RLS policies: `matches`
  - `matches_read_all`, `matches_insert_op`, `matches_update_op`
  - UPDATE policy must enforce: SETTLED rows are immutable (score/result cannot change)
  - **Ref:** `02-database-schema.md` Part 5 — matches section

- [ ] **WC-028** — Apply RLS policies: `bets` (CRITICAL — Gap #2)
  - `bets_read_all` (everyone reads — transparency rule)
  - `bets_insert_own_before_kickoff` → WITH CHECK uses `match_datetime > NOW()` (server clock)
  - `bets_update_own_before_kickoff` → same server-time condition
  - `bets_no_delete` → USING false
  - **Ref:** `02-database-schema.md` Part 5 — bets section

- [ ] **WC-029** — Apply RLS policies: `teams`, `match_rounds`, `audit_log`
  - teams/rounds: read-only for all authenticated
  - audit_log: SELECT only for admin/superuser
  - **Ref:** `02-database-schema.md` Part 5 — final section

---

## PHASE 2 — Foundation Code

> **Goal:** Shared types, Supabase clients, utilities, middleware. Zero UI, zero pages.
> **Ref:** `01-architecture-rules.md` RULE 4–5, `03-api-contracts.md`

- [ ] **WC-030** — Write `types/index.ts`
  - TypeScript types mirroring all DB enums and tables:
    `UserRole`, `MatchStatus`, `MatchResult`, `BetPrediction`
    `Profile`, `Team`, `MatchRound`, `Match`, `Bet`, `LeaderboardEntry`
  - `MATCH_ROUNDS` constant (7 rounds including `round_of_32`)
  - API response types: `ApiResponse<T>`, `PaginatedResponse<T>`
  - **Ref:** `01-architecture-rules.md` RULE 7, `03-api-contracts.md` response shapes

- [ ] **WC-031** — Write `lib/utils/cn.ts`
  - `clsx` + `twMerge` helper
  - **Ref:** `04-design-system.md` Part 6

- [ ] **WC-032** — Write `lib/utils/roles.ts`
  - `USER_ROLES` ordered array: `['user', 'superuser', 'admin']`
  - `hasRole(userRole, requiredRole)` → boolean (hierarchy check)
  - `isAdmin(role)`, `isSuperuser(role)` helpers
  - **Ref:** `01-architecture-rules.md` RULE 2

- [ ] **WC-033** — Write `lib/utils/scoring.ts`
  - `computePenalty(prediction: BetPrediction, result: MatchResult): 0 | 50`
  - Pure function, no side effects
  - **Ref:** `00-prd.md` Section 3 — scoring rules

- [ ] **WC-034** — Write `lib/supabase/client.ts`
  - `createBrowserClient()` using `@supabase/ssr`
  - Uses only `NEXT_PUBLIC_*` vars
  - For use in `"use client"` components
  - **Ref:** `01-architecture-rules.md` RULE 4

- [ ] **WC-035** — Write `lib/supabase/server.ts`
  - `createServerClient()` using `@supabase/ssr` with cookie store
  - For use in Server Components, Server Actions, Route Handlers
  - **Ref:** `01-architecture-rules.md` RULE 4

- [ ] **WC-036** — Write `lib/supabase/middleware.ts`
  - Session refresh helper called by `middleware.ts`
  - Returns updated response with refreshed cookies
  - **Ref:** `01-architecture-rules.md` RULE 2

- [ ] **WC-037** — Write `middleware.ts` (Edge middleware)
  - Logic order:
    1. Refresh session via `lib/supabase/middleware.ts`
    2. No session on protected route → redirect `/login`
    3. `must_change_password = true` + not on `/change-password` → redirect `/change-password`
    4. Role `user` accessing `/(admin)/*` → redirect `/matches`
  - Matcher config: exclude `_next`, static files, favicon
  - **Ref:** `01-architecture-rules.md` RULE 2

- [ ] **WC-038** — Write `app/layout.tsx` (root layout)
  - Load fonts: `Bebas_Neue` (`--font-bebas`), `Inter` (`--font-inter`), `JetBrains_Mono` (`--font-jetbrains`)
  - Body: `bg-pitch-900 font-body text-white antialiased bg-stadium-gradient`
  - Import `globals.css`
  - **Ref:** `04-design-system.md` Part 2

---

## PHASE 3 — UI Component Library

> **Goal:** All design-system components ready for use by page agents.
> **Ref:** `04-design-system.md` Part 4

- [ ] **WC-039** — Write `components/ui/Button.tsx`
  - CVA variants: `primary`, `secondary`, `ghost`, `danger`, `gold`
  - Sizes: `sm`, `md`, `lg`, `icon`
  - `isLoading` prop with spinner
  - **Ref:** `04-design-system.md` Part 4.1

- [ ] **WC-040** — Write `components/ui/Card.tsx`
  - `Card` with `glow?: 'neon' | 'gold' | 'none'` prop
  - `CardHeader`, `CardBody` sub-components
  - **Ref:** `04-design-system.md` Part 4.2

- [ ] **WC-041** — Write `components/ui/Input.tsx`
  - `label?`, `error?` props
  - Neon focus ring, red error state
  - **Ref:** `04-design-system.md` Part 4.3

- [ ] **WC-042** — Write `components/ui/Badge.tsx` (`StatusBadge`)
  - `STATUS_CONFIG` record covering all 7 `MatchStatus` values
  - LIVE badge has `animate-pulse-live`
  - VOID badge has `line-through`
  - **Ref:** `04-design-system.md` Part 4.4

- [ ] **WC-043** — Write `components/layout/Header.tsx`
  - Logo + app name (`WC2026 Bets`)
  - User display name + role badge
  - Sign out button (Server Action)
  - **Ref:** `01-architecture-rules.md` RULE 1

- [ ] **WC-044** — Write `components/layout/MainNav.tsx`
  - Links: Matches, Leaderboard, My History, Profile
  - Admin-only links: Users, Manage Matches (shown based on role prop)
  - Active link highlighted with neon

- [ ] **WC-045** — Write `components/layout/RoleGuard.tsx`
  - Server Component
  - Receives `allowedRoles: UserRole[]` prop
  - Reads current user role from Supabase server client
  - Renders `notFound()` or `redirect()` if role not allowed
  - **Ref:** `01-architecture-rules.md` RULE 2

---

## PHASE 4 — Authentication Flow

> **Goal:** Login page, forced password change, session handling.
> **Ref:** `03-api-contracts.md` Section 1

- [ ] **WC-046** — Write `lib/actions/auth.actions.ts`
  - `login(email, password)` → calls Supabase Auth signInWithPassword
  - `changePassword(newPassword, confirmPassword)` → validates, calls updateUser, clears flag
  - `signOut()` → supabase.auth.signOut + redirect
  - `createUser(email, password, displayName, role)` → service role client, Admin only
  - **Ref:** `03-api-contracts.md` Section 1

- [ ] **WC-047** — Write `components/auth/LoginForm.tsx`
  - `"use client"` — controlled email + password inputs
  - Uses `Input` from design system
  - Calls `login` Server Action on submit
  - Shows error state on invalid credentials
  - **Ref:** `03-api-contracts.md` POST /api/auth/login

- [ ] **WC-048** — Write `app/(auth)/login/page.tsx`
  - Server Component wrapper
  - Renders `LoginForm`
  - Background: stadium gradient, centered card layout
  - If already logged in → redirect to `/matches`

- [ ] **WC-049** — Write `components/auth/ChangePasswordForm.tsx`
  - `"use client"` — new password + confirm password inputs
  - Password strength indicator (min 8 chars, has upper/lower/number)
  - Calls `changePassword` Server Action
  - **Ref:** `03-api-contracts.md` POST /api/auth/change-password

- [ ] **WC-050** — Write `app/(auth)/change-password/page.tsx`
  - Server Component wrapper
  - Middleware ensures only `must_change_password = true` users land here
  - Renders `ChangePasswordForm`

---

## PHASE 5 — Main Layout & Match Listing (Player View)

> **Ref:** `01-architecture-rules.md` RULE 1, `03-api-contracts.md` Section 2

- [ ] **WC-051** — Write `app/(main)/layout.tsx`
  - Server Component
  - Fetches current user profile
  - Renders `Header` + `MainNav` + `{children}`
  - Passes role to MainNav for conditional links

- [ ] **WC-052** — Write `app/(main)/page.tsx`
  - Redirects to `/matches`

- [ ] **WC-053** — Write `app/api/matches/route.ts` (GET handler)
  - Query params: `round`, `status`, `limit` (default 20), `offset` (default 0)
  - Joins: home_team, away_team, round info
  - Includes `my_bet` field for the authenticated user
  - Auth: required (any role)
  - **Ref:** `03-api-contracts.md` GET /api/matches

- [ ] **WC-054** — Write `components/matches/MatchStatusBadge.tsx`
  - Re-exports `StatusBadge` from `components/ui/Badge.tsx` or wraps it
  - (May be same file as Badge — keep ≤ 150 lines)

- [ ] **WC-055** — Write `components/matches/CountdownTimer.tsx`
  - `"use client"` — `useEffect` interval
  - Props: `targetDate: string` (ISO UTC)
  - Displays: `Xh Ym Zs` until kickoff
  - Shows "LIVE" when past kickoff and not yet settled
  - **Ref:** UI/UX Direction from PRD

- [ ] **WC-056** — Write `components/matches/MatchCard.tsx`
  - Server Component (receives `Match` + `myBet?` as props)
  - Layout: round label + StatusBadge top row
  - Center: teams flags + names + VS or score (neon glow when settled)
  - Bottom: venue + my bet indicator
  - **Ref:** `04-design-system.md` Part 4.6

- [ ] **WC-057** — Write `components/matches/MatchList.tsx`
  - Server Component
  - Groups matches by round (`MATCH_ROUNDS` order)
  - Renders section header per round + `MatchCard` grid
  - Handles empty state

- [ ] **WC-058** — Write `app/(main)/matches/page.tsx`
  - Server Component
  - Fetches matches via Supabase server client (not the API route — direct DB call)
  - Renders `MatchList`
  - Tab/filter bar: All / Upcoming / Settled / by Round

---

## PHASE 6 — Match Detail & Betting Engine

> **Goal:** Per-match page with bet placement. Critical: time lock via server.
> **Ref:** `03-api-contracts.md` Section 3, `02-database-schema.md` RLS bets section

- [ ] **WC-059** — Write `lib/actions/bet.actions.ts`
  - `placeBet(matchId, prediction)` → Server Action
    - Uses server Supabase client (server time = DB time)
    - Does NOT check `new Date()` — lets RLS enforce via `NOW()`
    - Returns typed result or error
  - `updateBet(matchId, prediction)` → same time-lock approach
  - **CRITICAL:** No `new Date()` comparison — rely on RLS `match_datetime > NOW()`
  - **Ref:** `03-api-contracts.md` Section 3, `02-database-schema.md` Gap #2

- [ ] **WC-060** — Write `app/api/bets/route.ts`
  - `POST`: place bet → calls `placeBet` logic, returns 201 or 423 (locked)
  - `PATCH`: update bet → calls `updateBet` logic
  - Auth header validation on both methods
  - **Ref:** `03-api-contracts.md` POST/PATCH /api/bets

- [ ] **WC-061** — Write `components/matches/BetSelector.tsx`
  - `"use client"` — 3-button grid (1 / X / 2)
  - Selected state: neon glow + scale
  - Disabled state: `opacity-40 cursor-not-allowed`
  - Props: `value`, `onChange`, `disabled`, `homeTeam`, `awayTeam`
  - Calls `placeBet` or `updateBet` Server Action on confirm button
  - **Ref:** `04-design-system.md` Part 4.5

- [ ] **WC-062** — Write `app/(main)/matches/[matchId]/page.tsx`
  - Server Component
  - Fetches match detail + current user's bet
  - `isBettingOpen = match.status === 'SCHEDULED'` (display only — server enforces)
  - Renders `MatchCard` (large/detail variant) + `BetSelector` + `CountdownTimer`
  - Shows result outcome (correct ✓ / wrong ✗) if settled

- [ ] **WC-063** — Write `app/api/bets/route.ts` GET handler
  - Returns authenticated user's own bets with match info
  - Query params: `match_id?`, `settled?`
  - **Ref:** `03-api-contracts.md` GET /api/bets

- [ ] **WC-064** — Write `app/api/bets/user/[userId]/route.ts`
  - Returns any user's bets (public within app — transparency rule)
  - RLS allows reads for all authenticated users
  - **Ref:** `03-api-contracts.md` GET /api/bets/user/[userId]

- [ ] **WC-065** — Write `app/(main)/history/[userId]/page.tsx`
  - Server Component
  - Fetches profile (display_name) + bet history for `userId`
  - Shows list of bets grouped by round with outcome indicators
  - Works for own profile and other players

- [ ] **WC-066** — Write `app/(main)/profile/page.tsx`
  - Server Component
  - Shows own profile info + optional voluntary password change form
  - Link to own history: `/history/{userId}`

---

## PHASE 7 — Leaderboard

> **Goal:** Realtime-updating ranking table with gold/silver/bronze styling.
> **Ref:** `03-api-contracts.md` Section 4, `04-design-system.md` Part 4.7

- [ ] **WC-067** — Write `app/api/leaderboard/route.ts`
  - `GET`: queries `leaderboard` view from Supabase
  - Returns ranked list with `updated_at` timestamp
  - Auth: required
  - **Ref:** `03-api-contracts.md` GET /api/leaderboard

- [ ] **WC-068** — Write `components/leaderboard/PlayerRow.tsx`
  - Server or Client Component (no interactivity needed)
  - Props: `entry: LeaderboardEntry`, `isCurrentUser: boolean`
  - Rank 1/2/3: gold/silver/bronze medal emoji + glow
  - Shows: rank, display_name (+ "Bạn" if current user), W/L count, streak, penalty points
  - **Ref:** `04-design-system.md` Part 4.7

- [ ] **WC-069** — Write `components/leaderboard/LeaderboardTable.tsx`
  - `"use client"` — subscribes to Supabase Realtime on `bets` table changes
  - On change: refetches leaderboard from `/api/leaderboard`
  - Renders list of `PlayerRow` components
  - Highlights current user's row with neon glow
  - Feature flag: check `NEXT_PUBLIC_ENABLE_REALTIME` before subscribing
  - **Ref:** `01-architecture-rules.md` RULE 4

- [ ] **WC-070** — Write `app/(main)/leaderboard/page.tsx`
  - Server Component
  - Initial data fetch from leaderboard view
  - Passes data to `LeaderboardTable` as prop (hydration)
  - Page title: styled with gold gradient + Bebas Neue

---

## PHASE 8 — Admin Panel

> **Goal:** User management (Admin) + Match management + Score settlement (Superuser).
> **Ref:** `03-api-contracts.md` Sections 2 & 5, `01-architecture-rules.md` RULE 2

- [ ] **WC-071** — Write `app/(admin)/layout.tsx`
  - Server Component
  - Renders `RoleGuard` with `allowedRoles: ['admin', 'superuser']`
  - Admin sidebar/nav with management links

- [ ] **WC-072** — Write `app/api/admin/users/route.ts`
  - `GET`: list all profiles (Admin only)
  - `POST`: create user via service role client — `admin.createUser()`, then set metadata
  - Role guard: `my_role() = 'admin'` check server-side
  - **Ref:** `03-api-contracts.md` Section 5

- [ ] **WC-073** — Write `app/(admin)/users/page.tsx`
  - Server Component (Admin only — RoleGuard)
  - Table: display_name, email, role, must_change_password, created_at
  - "Create User" button → `/admin/users/new`

- [ ] **WC-074** — Write `app/(admin)/users/new/page.tsx`
  - Server Component shell + Client Form
  - Form: email, display_name, initial_password, role (select: user/superuser)
  - Calls `createUser` Server Action from `auth.actions.ts`

- [ ] **WC-075** — Write `app/api/matches/route.ts` (POST handler — add to existing GET)
  - `POST`: create match (Superuser/Admin)
  - Validates: different teams, valid round_id, future datetime
  - Returns 201 or 403/409
  - **Ref:** `03-api-contracts.md` POST /api/matches

- [ ] **WC-076** — Write `app/api/matches/sync/route.ts`
  - `POST`: calls The Odds API with `ODDS_API_KEY`
  - Maps API response to `matches` table schema
  - Upserts by `external_match_id` (skip if exists and `overwrite_existing=false`)
  - Returns sync summary
  - **Ref:** `03-api-contracts.md` POST /api/matches/sync

- [ ] **WC-077** — Write `lib/actions/match.actions.ts`
  - `createMatch(data)` → Server Action (Superuser/Admin)
  - `updateMatchStatus(matchId, status, notes?, newDatetime?)` → Server Action
  - `requestSettlement(matchId, homeScore, awayScore)` → calls `settle_match` RPC
  - `triggerSync(options)` → calls sync API route
  - **Ref:** `03-api-contracts.md` Sections 2

- [ ] **WC-078** — Write `app/(admin)/matches/page.tsx`
  - Server Component (Admin + Superuser)
  - Table of all matches: teams, datetime, round, status, actions
  - Actions per row: Edit status, Enter score (Superuser only), View

- [ ] **WC-079** — Write `app/(admin)/matches/sync/page.tsx`
  - Server Component shell + Client trigger button
  - Shows last sync time + match count
  - "Sync from Bet365" → calls `triggerSync` action
  - Displays result summary (created/skipped/errors)

- [ ] **WC-080** — Write `app/(admin)/matches/new/page.tsx`
  - Client form: home team (select), away team (select), round (select from MATCH_ROUNDS), datetime, venue
  - Calls `createMatch` Server Action
  - Superuser + Admin access

- [ ] **WC-081** — Write `components/matches/ScoreEntryForm.tsx`
  - `"use client"` — home score + away score number inputs
  - Shows computed result preview (HOME_WIN / DRAW / AWAY_WIN) before submit
  - Warning: "Result will be locked after 15 minutes"
  - Confirm button calls `requestSettlement` Server Action
  - **Ref:** `03-api-contracts.md` POST /api/matches/[matchId]/settle

- [ ] **WC-082** — Write `app/(admin)/matches/[matchId]/settle/page.tsx`
  - Server Component (Superuser only — RoleGuard)
  - Shows match info + current status
  - If status = PENDING_SETTLEMENT: shows countdown to lock + "Correct Score" button
  - If status = SCHEDULED/LIVE: renders `ScoreEntryForm`
  - **Ref:** `03-api-contracts.md` Gap #3 two-step settlement

- [ ] **WC-083** — Write `app/api/matches/[matchId]/settle/route.ts`
  - `POST`: calls `settle_match` Supabase RPC
  - Auth: Superuser only
  - Returns settlement window info
  - **Ref:** `03-api-contracts.md` POST /api/matches/[matchId]/settle

- [ ] **WC-084** — Write `app/api/matches/[matchId]/confirm/route.ts`
  - `POST`: calls `confirm_match_settlement` RPC
  - Auth: Superuser OR valid `SETTLEMENT_CRON_SECRET` header
  - Returns 400 if window still open (with seconds_remaining)
  - **Ref:** `03-api-contracts.md` POST /api/matches/[matchId]/confirm-settle

- [ ] **WC-085** — Write `app/api/matches/[matchId]/route.ts` (PATCH)
  - `PATCH`: update match status (POSTPONED, ABANDONED, VOID, SCHEDULED)
  - Enforce transition rules table from `03-api-contracts.md`
  - Auth: Superuser + Admin
  - **Ref:** `03-api-contracts.md` PATCH /api/matches/[matchId]

---

## PHASE 9 — Cron Jobs

> **Goal:** Automated settlement locking and void logic.
> **Ref:** `03-api-contracts.md` Section 8, `08-env-deployment-spec.md` Part 4

- [ ] **WC-086** — Write `app/api/cron/confirm-settlements/route.ts`
  - `GET` handler
  - Validate `Authorization: Bearer ${SETTLEMENT_CRON_SECRET}`
  - Query all matches WHERE `status = 'PENDING_SETTLEMENT'`
  - For each: call `confirm_match_settlement` RPC
  - Skip if window still open (accumulate skipped list)
  - Return summary: `{ settled: n, skipped: n, errors: [] }`
  - **Ref:** `03-api-contracts.md` Section 8

- [ ] **WC-087** — Write `app/api/cron/void-postponed/route.ts`
  - `GET` handler
  - Validate `SETTLEMENT_CRON_SECRET`
  - Call `void_postponed_matches()` RPC
  - Return `{ voided: n }`
  - **Ref:** `03-api-contracts.md` Section 8

---

## PHASE 10 — Seed Data & Testing

> **Goal:** Local dev usable with realistic data.

- [ ] **WC-088** — Write SQL seed script for 48 WC2026 teams
  - All 48 qualified teams with `country_code`, `group_name` (A–L), `flag_emoji`
  - Save as `supabase/seeds/01_teams.sql`

- [ ] **WC-089** — Write SQL seed script for group stage matches (sample)
  - 5–10 sample matches across different rounds and statuses
  - Include: 1 SETTLED (with scores), 1 PENDING_SETTLEMENT, 1 LIVE, rest SCHEDULED
  - Save as `supabase/seeds/02_matches.sql`

- [ ] **WC-090** — Write SQL seed script for test users
  - 1 admin, 1 superuser, 3 users with `must_change_password = false`
  - Note: requires Supabase Auth admin API or manual creation
  - Save as `supabase/seeds/03_users.sql` with instructions

---

## PHASE 11 — QA Checklist (manual verification before staging deploy)

> **Goal:** Verify all 5 technical gaps from PRD are resolved.

- [ ] **WC-091** — Verify Gap #1: Round of 32 exists in DB and UI
  - `match_rounds` table has 7 rows including `round_of_32`
  - Admin "Create Match" form shows Round of 32 in dropdown

- [ ] **WC-092** — Verify Gap #2: Timezone drift protection
  - Set system clock back 1 hour, try to place a bet on a started match
  - Bet must be rejected (RLS uses DB `NOW()`, not client clock)

- [ ] **WC-093** — Verify Gap #3: Two-step settlement
  - Enter score → status becomes PENDING_SETTLEMENT
  - Try to place bet on that match → rejected (status not SCHEDULED)
  - Wait 15 min (or manually call confirm endpoint) → status becomes SETTLED
  - Bets auto-scored by trigger

- [ ] **WC-094** — Verify Gap #4: Leaderboard tie-breaking
  - Create 2 users with identical penalty points
  - User A has longer streak → should rank higher
  - If streak also equal → user who bet earliest ranks higher

- [ ] **WC-095** — Verify Gap #5: Postponed match auto-void
  - Create a POSTPONED match with datetime > 48h ago
  - Trigger `void_postponed_matches()` RPC manually
  - Match status becomes VOID, all bets reset to penalty_points = 0

---

## TASK SUMMARY

| Phase | Tasks | Files / Scripts |
|---|---|---|
| 0 — Scaffolding & Tooling | WC-001 → WC-013 | 13 config files |
| 1 — Database (SQL) | WC-014 → WC-029 | 16 SQL scripts |
| 2 — Foundation Code | WC-030 → WC-038 | 9 TypeScript files |
| 3 — UI Components | WC-039 → WC-045 | 7 component files |
| 4 — Auth Flow | WC-046 → WC-050 | 5 files |
| 5 — Match Listing | WC-051 → WC-058 | 8 files |
| 6 — Betting Engine | WC-059 → WC-066 | 8 files |
| 7 — Leaderboard | WC-067 → WC-070 | 4 files |
| 8 — Admin Panel | WC-071 → WC-085 | 15 files |
| 9 — Cron Jobs | WC-086 → WC-087 | 2 files |
| 10 — Seed Data | WC-088 → WC-090 | 3 SQL files |
| 11 — QA Verification | WC-091 → WC-095 | 5 manual checks |
| **TOTAL** | **95 tasks** | **~79 code files + 19 SQL scripts** |

---

## DEPENDENCY GRAPH (agent execution order)

```
PHASE 0 (config) ──────────────────────────────────────────► all other phases
PHASE 1 (DB/SQL) ──────────────────────────────────────────► PHASE 2+
PHASE 2 (foundation) ──────────────────────────────────────► PHASE 3+
PHASE 3 (UI components) ───────────────────────────────────► PHASE 4+
PHASE 4 (auth) ────────────────────────────────────────────► PHASE 5+
PHASE 5 (match listing) ───────────────────────────────────┐
PHASE 6 (betting) ─────────────────────────────────────────┤► can be parallel
PHASE 7 (leaderboard) ─────────────────────────────────────┤
PHASE 8 (admin) ───────────────────────────────────────────┘
PHASE 9 (cron) ────────────────────────────────────────────► depends on PHASE 8
PHASE 10 (seed) ───────────────────────────────────────────► depends on PHASE 1
PHASE 11 (QA) ─────────────────────────────────────────────► depends on ALL
```

**Phases 5, 6, 7, 8 can be assigned to 4 developers in parallel** (one phase per dev) after Phase 4 is complete.
