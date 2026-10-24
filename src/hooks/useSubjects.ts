import { useQuery } from '@tanstack/react-query';
import { getSubjects } from '@/api/taxonomy';
import { QUERY_KEYS } from '@/constants/config';

export function useSubjects(facultySlug: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.subjects(facultySlug ?? ''),
    queryFn: () => getSubjects(facultySlug as string),
    enabled: !!facultySlug,
    staleTime: 1000 * 60 * 60 * 24 * 30,
  });
}
