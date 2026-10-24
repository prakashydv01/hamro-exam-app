import { useQuery } from '@tanstack/react-query';
import { getLeaderboard } from '@/api/leaderboard';
import { QUERY_KEYS } from '@/constants/config';

export function useLeaderboard(examId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.leaderboard(examId ?? ''),
    queryFn: () => getLeaderboard(examId as string),
    enabled: !!examId,
    staleTime: 1000 * 60 * 5, // 5 min, matches backend Redis cache TTL
  });
}
