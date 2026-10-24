import { apiRequest } from './client';
import type { LeaderboardResponse } from '@/types/api';

export function getLeaderboard(examId: string) {
  return apiRequest<LeaderboardResponse>(`/api/leaderboard?examId=${encodeURIComponent(examId)}`);
}
