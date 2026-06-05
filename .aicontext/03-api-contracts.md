# 03 — API Contracts

**Project:** WC2026 Internal Betting App
**Base URL:** `/api` (Next.js Route Handlers) + Supabase RPC for DB-level operations
**Auth:** All endpoints require `Authorization: Bearer <supabase-jwt>` unless marked Public.

> **Convention:** HTTP status codes follow REST. All responses are `application/json`.
> RPC calls are invoked via `supabase.rpc('function_name', params)` on the server side.

---

## Auth Hierarchy Summary

| Role | Can call |
|---|---|
| `user` | Place/update own bets, read all matches & bets, read leaderboard |
| `superuser` | All of `user` + create matches, enter scores, trigger sync |
| `admin` | All of `superuser` + manage users, view audit log |

---

## 1. Authentication Endpoints

### POST `/api/auth/login`
Delegates to Supabase Auth. Response includes `must_change_password` flag.

**Request**
```json
{
  "email": "player@wc2026.internal",
  "password": "initial_pass_123"
}
```

**Response 200**
```json
{
  "session": {
    "access_token": "<jwt>",
    "refresh_token": "<token>",
    "expires_in": 3600
  },
  "user": {
    "id": "uuid-...",
    "display_name": "Nguyen Van A",
    "role": "user",
    "must_change_password": true
  }
}
```

**Response 401**
```json
{ "error": "Invalid email or password" }
```

---

### POST `/api/auth/change-password`
**Auth:** Required. Forces password change on first login.

**Request**
```json
{
  "new_password": "MyStr0ngP@ss!",
  "confirm_password": "MyStr0ngP@ss!"
}
```

**Response 200**
```json
{
  "success": true,
  "message": "Password updated. must_change_password flag cleared."
}
```

**Response 400**
```json
{ "error": "Passwords do not match" }
```

**Server Action logic:**
1. Validate `new_password === confirm_password`.
2. Call `supabase.auth.updateUser({ password: new_password })`.
3. Update `profiles SET must_change_password = FALSE WHERE id = auth.uid()`.
4. Redirect to `/matches`.

---

## 2. Match Endpoints

### GET `/api/matches`
**Auth:** Required. Returns matches grouped by round.

**Query params**
| Param | Type | Default | Description |
|---|---|---|---|
| `round` | string | (all) | Filter by `round_id` |
| `status` | string | (all) | Filter by `match_status` |
| `limit` | integer | 20 | Pagination |
| `offset` | integer | 0 | Pagination |

**Response 200**
```json
{
  "data": [
    {
      "id": "uuid-match-1",
      "round": { "id": "group_stage", "name": "Vòng Bảng" },
      "home_team": { "id": 1, "name": "Brazil", "country_code": "BRA", "flag_emoji": "🇧🇷" },
      "away_team": { "id": 2, "name": "Germany", "country_code": "GER", "flag_emoji": "🇩🇪" },
      "match_datetime": "2026-06-12T18:00:00Z",
      "venue": "MetLife Stadium",
      "status": "SCHEDULED",
      "home_score": null,
      "away_score": null,
      "result": null,
      "my_bet": {
        "prediction": "HOME_WIN",
        "placed_at": "2026-06-11T10:32:00Z"
      }
    }
  ],
  "count": 48,
  "limit": 20,
  "offset": 0
}
```

---

### POST `/api/matches`
**Auth:** `superuser` or `admin` only.
Creates a knockout match manually.

**Request**
```json
{
  "home_team_id": 1,
  "away_team_id": 2,
  "round_id": "round_of_32",
  "match_datetime": "2026-07-01T20:00:00Z",
  "venue": "SoFi Stadium"
}
```

**Response 201**
```json
{
  "id": "uuid-new-match",
  "status": "SCHEDULED",
  "round": { "id": "round_of_32", "name": "Vòng 32 Đội" },
  "match_datetime": "2026-07-01T20:00:00Z"
}
```

**Response 403**
```json
{ "error": "Forbidden: superuser or admin role required" }
```

**Response 409**
```json
{ "error": "These two teams already have a match in this round" }
```

---

### POST `/api/matches/sync`
**Auth:** `superuser` or `admin`. Pulls group stage fixtures from The Odds API / Bet365 feed.

**Request**
```json
{
  "source": "odds_api",
  "sport_key": "soccer_fifa_world_cup",
  "overwrite_existing": false
}
```

**Response 200**
```json
{
  "synced": 48,
  "skipped": 0,
  "errors": [],
  "matches_created": ["uuid-1", "uuid-2"]
}
```

**Response 502**
```json
{
  "error": "External API unreachable",
  "upstream_status": 503
}
```

---

### POST `/api/matches/[matchId]/settle`
**Auth:** `superuser` only.
Enters the score → moves match to `PENDING_SETTLEMENT` (15-min correction window, Gap #3).

**Request**
```json
{
  "home_score": 2,
  "away_score": 1
}
```

**Response 200**
```json
{
  "success": true,
  "match_id": "uuid-match-1",
  "status": "PENDING_SETTLEMENT",
  "home_score": 2,
  "away_score": 1,
  "computed_result": "HOME_WIN",
  "settles_at": "2026-06-12T20:47:00Z",
  "correction_window_seconds": 900
}
```

**Response 409**
```json
{
  "error": "Match is already SETTLED and cannot be modified"
}
```

---

### POST `/api/matches/[matchId]/confirm-settle`
**Auth:** `superuser` or called by Vercel Cron (with `SETTLEMENT_CRON_SECRET` header).
Locks settlement after the 15-min window and triggers bet scoring.

**Request** *(empty body or cron call)*
```json
{}
```

**Response 200**
```json
{
  "success": true,
  "match_id": "uuid-match-1",
  "status": "SETTLED",
  "bets_settled": 12,
  "correct_predictions": 7,
  "wrong_predictions": 5
}
```

**Response 400** *(called too early)*
```json
{
  "error": "Correction window still open",
  "seconds_remaining": 432
}
```

---

### PATCH `/api/matches/[matchId]`
**Auth:** `superuser` or `admin`. Update operational status (postpone, abandon).

**Request**
```json
{
  "status": "POSTPONED",
  "notes": "Severe weather warning at venue",
  "new_datetime": "2026-06-15T18:00:00Z"
}
```

**Response 200**
```json
{
  "id": "uuid-match-1",
  "status": "POSTPONED",
  "match_datetime": "2026-06-15T18:00:00Z",
  "notes": "Severe weather warning at venue"
}
```

**Transition rules (enforced server-side):**

| From | Allowed → To |
|---|---|
| `SCHEDULED` | `LIVE`, `POSTPONED`, `ABANDONED`, `VOID` |
| `LIVE` | `PENDING_SETTLEMENT`, `ABANDONED`, `VOID` |
| `PENDING_SETTLEMENT` | `SETTLED` (cron only), `SCHEDULED` (correction) |
| `SETTLED` | *(immutable — no transitions)* |
| `POSTPONED` | `SCHEDULED`, `VOID` |
| `ABANDONED` | `VOID` |

---

## 3. Bet Endpoints

### POST `/api/bets`
**Auth:** `user`, `superuser`, or `admin`.
Place a bet. Bet is rejected if the match `match_datetime ≤ NOW()` (server time — Gap #2).

**Request**
```json
{
  "match_id": "uuid-match-1",
  "prediction": "HOME_WIN"
}
```

**prediction** values: `"HOME_WIN"` | `"DRAW"` | `"AWAY_WIN"`

**Response 201**
```json
{
  "id": "uuid-bet-1",
  "match_id": "uuid-match-1",
  "user_id": "uuid-user-1",
  "prediction": "HOME_WIN",
  "placed_at": "2026-06-11T14:20:00Z",
  "is_correct": null,
  "penalty_points": 0
}
```

**Response 409** *(already have a bet — must use PATCH)*
```json
{ "error": "Bet already exists for this match. Use PATCH to update." }
```

**Response 423** *(match locked)*
```json
{
  "error": "Betting is locked. Match starts in the past or is already in progress.",
  "server_time": "2026-06-12T17:59:58Z",
  "match_datetime": "2026-06-12T18:00:00Z"
}
```

---

### PATCH `/api/bets`
**Auth:** Own bet only. Change prediction before kickoff (same time lock as POST).

**Request**
```json
{
  "match_id": "uuid-match-1",
  "prediction": "DRAW"
}
```

**Response 200**
```json
{
  "id": "uuid-bet-1",
  "match_id": "uuid-match-1",
  "prediction": "DRAW",
  "placed_at": "2026-06-11T15:05:00Z",
  "is_correct": null,
  "penalty_points": 0
}
```

**Response 404**
```json
{ "error": "No existing bet found for this match" }
```

---

### GET `/api/bets`
**Auth:** Required. Returns the authenticated user's own bets.

**Query params**
| Param | Type | Default |
|---|---|---|
| `match_id` | uuid | (all matches) |
| `settled` | boolean | (all) |

**Response 200**
```json
{
  "data": [
    {
      "id": "uuid-bet-1",
      "match": {
        "id": "uuid-match-1",
        "home_team": "Brazil",
        "away_team": "Germany",
        "match_datetime": "2026-06-12T18:00:00Z",
        "status": "SETTLED",
        "result": "HOME_WIN"
      },
      "prediction": "HOME_WIN",
      "placed_at": "2026-06-11T14:20:00Z",
      "is_correct": true,
      "penalty_points": 0
    }
  ]
}
```

---

### GET `/api/bets/user/[userId]`
**Auth:** Required. Returns any user's full bet history (transparency rule from PRD).
**Note:** RLS allows reads; this endpoint is intentionally public within the authenticated app.

**Response 200** *(same shape as GET `/api/bets` above)*

---

## 4. Leaderboard Endpoint

### GET `/api/leaderboard`
**Auth:** Required. Public within the app. Sourced from the `leaderboard` view.

**Response 200**
```json
{
  "updated_at": "2026-06-12T20:01:00Z",
  "data": [
    {
      "rank": 1,
      "user_id": "uuid-user-3",
      "display_name": "Tran Thi B",
      "total_penalty_points": 0,
      "current_streak": 5,
      "correct_count": 5,
      "wrong_count": 0,
      "earliest_bet_at": "2026-06-11T08:00:00Z"
    },
    {
      "rank": 2,
      "user_id": "uuid-user-1",
      "display_name": "Nguyen Van A",
      "total_penalty_points": 50,
      "current_streak": 3,
      "correct_count": 4,
      "wrong_count": 1,
      "earliest_bet_at": "2026-06-11T09:15:00Z"
    }
  ]
}
```

**Tie-breaking order (Gap #4):**
1. `total_penalty_points ASC` — fewer is better
2. `current_streak DESC` — longer current correct run wins
3. `earliest_bet_at ASC` — bet earlier if still tied

---

## 5. Admin Endpoints

### POST `/api/admin/users`
**Auth:** `admin` only. Creates a player account with an initial password.
Uses Supabase service role key server-side (never exposed to client).

**Request**
```json
{
  "email": "newplayer@wc2026.internal",
  "initial_password": "Temp@2026",
  "display_name": "Le Van C",
  "role": "user"
}
```

**Response 201**
```json
{
  "user_id": "uuid-new-user",
  "email": "newplayer@wc2026.internal",
  "display_name": "Le Van C",
  "role": "user",
  "must_change_password": true,
  "created_at": "2026-06-10T12:00:00Z"
}
```

**Response 409**
```json
{ "error": "Email already registered" }
```

---

### GET `/api/admin/users`
**Auth:** `admin` only.

**Response 200**
```json
{
  "data": [
    {
      "id": "uuid-user-1",
      "email": "player@wc2026.internal",
      "display_name": "Nguyen Van A",
      "role": "user",
      "must_change_password": false,
      "created_at": "2026-06-01T00:00:00Z"
    }
  ],
  "count": 15
}
```

---

## 6. Supabase RPC Calls (Server-side only)

Used via `supabase.rpc()` in Server Actions / API Route Handlers.

| Function | Caller | Purpose |
|---|---|---|
| `settle_match(p_match_id, p_home_score, p_away_score)` | `/api/matches/[id]/settle` | Enter score → PENDING_SETTLEMENT |
| `confirm_match_settlement(p_match_id)` | `/api/matches/[id]/confirm-settle` | Lock after 15 min → SETTLED |
| `void_postponed_matches()` | Vercel Cron (daily) | Auto-VOID matches postponed > 48 h |

---

## 7. Error Response Envelope

All errors follow this shape:

```json
{
  "error": "Human-readable message",
  "code": "MACHINE_READABLE_CODE",
  "details": {}
}
```

| HTTP Code | Meaning |
|---|---|
| 400 | Validation error (bad input) |
| 401 | Not authenticated |
| 403 | Authenticated but insufficient role |
| 404 | Resource not found |
| 409 | Conflict (duplicate bet, illegal state transition) |
| 423 | Locked (betting window closed) |
| 500 | Internal server error |
| 502 | Upstream API (Bet365) failure |

---

## 8. Vercel Cron Jobs

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
  ]
}
```

- `/api/cron/confirm-settlements` — runs every 5 min; calls `confirm_match_settlement` for all `PENDING_SETTLEMENT` matches whose 15-min window has elapsed.
- `/api/cron/void-postponed` — runs daily at 06:00 UTC; calls `void_postponed_matches()` to auto-VOID matches postponed > 48 h (Gap #5).
- Both routes validate `Authorization: Bearer ${SETTLEMENT_CRON_SECRET}` before executing.
