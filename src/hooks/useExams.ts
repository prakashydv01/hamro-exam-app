import { useQuery } from '@tanstack/react-query';
import { getExams } from '@/api/exams';
import { QUERY_KEYS } from '@/constants/config';

export function useExams(facultySlug: string | undefined, examType?: 'practice' | 'mock') {
  return useQuery({
    queryKey: QUERY_KEYS.exams(facultySlug ?? '', examType),
    queryFn: () => getExams(facultySlug as string, examType),
    enabled: !!facultySlug,
    staleTime: 1000 * 60 * 60 * 24, // 24h, matches backend cache
  });
}
