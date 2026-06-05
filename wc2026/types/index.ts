export type UserRole = 'admin' | 'superuser' | 'user'
export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'PENDING_SETTLEMENT' | 'CONFIRMED' | 'SETTLED' | 'POSTPONED' | 'ABANDONED' | 'VOID'
export type MatchResult = 'HOME_WIN' | 'DRAW' | 'AWAY_WIN'
export type BetPrediction = 'HOME_WIN' | 'DRAW' | 'AWAY_WIN' | 'NOT_BET'

export interface Profile {
  id: string
  username: string
  display_name: string
  role: UserRole
  must_change_password: boolean
  created_at: string
  updated_at: string
}

export interface Team {
  id: number
  name: string
  country_code: string
  group_name: string | null
  flag_emoji: string | null
}

export interface MatchRound {
  id: string
  name: string
  display_order: number
}

export interface Match {
  id: string
  home_team_id: number
  away_team_id: number
  round_id: string
  match_datetime: string
  venue: string | null
  status: MatchStatus
  home_score: number | null
  away_score: number | null
  result: MatchResult | null
  settlement_requested_at: string | null
  external_match_id: string | null
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  home_team?: Team
  away_team?: Team
  round?: MatchRound
  my_bet?: Bet | null
}

export interface Bet {
  id: string
  user_id: string
  match_id: string
  prediction: BetPrediction
  placed_at: string
  is_correct: boolean | null
  penalty_points: number
}

export interface LeaderboardEntry {
  user_id: string
  display_name: string
  total_penalty_points: number
  current_streak: number
  correct_count: number
  wrong_count: number
  earliest_bet_at: string | null
  rank: number
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  code?: string
  details?: Record<string, unknown>
}

export interface PaginatedResponse<T> {
  data: T[]
  count: number
  limit: number
  offset: number
}

export const MATCH_ROUNDS = [
  { id: 'group_stage', name: 'Vòng Bảng', order: 1 },
  { id: 'round_of_32', name: 'Vòng 32 Đội', order: 2 },
  { id: 'round_of_16', name: 'Vòng 16 Đội (1/8)', order: 3 },
  { id: 'quarterfinal', name: 'Tứ Kết', order: 4 },
  { id: 'semifinal', name: 'Bán Kết', order: 5 },
  { id: 'third_place', name: 'Tranh Hạng 3', order: 6 },
  { id: 'final', name: 'Chung Kết', order: 7 },
] as const

export type MatchRoundId = typeof MATCH_ROUNDS[number]['id']

export const USER_ROLES = ['user', 'superuser', 'admin'] as const
export type UserRoleType = typeof USER_ROLES[number]