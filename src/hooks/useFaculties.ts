import { useQuery } from '@tanstack/react-query';
import { getFaculties } from '@/api/taxonomy';
import { QUERY_KEYS } from '@/constants/config';

export function useFaculties(categorySlug: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.faculties(categorySlug ?? ''),
    queryFn: () => getFaculties(categorySlug as string),
    enabled: !!categorySlug,
    staleTime: 1000 * 60 * 60 * 24 * 30,
  });
}
