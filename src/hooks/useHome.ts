import { useQuery } from '@tanstack/react-query';
import { getHome } from '@/api/home';
import { QUERY_KEYS } from '@/constants/config';

export function useHome() {
  return useQuery({
    queryKey: QUERY_KEYS.home,
    queryFn: getHome,
    staleTime: 1000 * 60, // 1 min - recent attempts change often enough to keep this short
  });
}
