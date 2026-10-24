import { useQuery } from '@tanstack/react-query';
import { getCategories } from '@/api/taxonomy';
import { QUERY_KEYS } from '@/constants/config';

export function useCategories() {
  return useQuery({
    queryKey: QUERY_KEYS.categories,
    queryFn: getCategories,
    staleTime: 1000 * 60 * 60 * 24 * 30, // 30 days - matches the backend's long HTTP cache
  });
}
