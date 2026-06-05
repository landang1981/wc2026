import type { BetPrediction, MatchResult } from '@/types'

export function computePenalty(
  prediction: BetPrediction,
  result: MatchResult
): 0 | 50 {
  return prediction === result ? 0 : 50
}