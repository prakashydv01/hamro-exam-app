export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'hamroexam_access_token',
  REFRESH_TOKEN: 'hamroexam_refresh_token',
  IN_PROGRESS_EXAM: 'hamroexam_in_progress_exam', // AsyncStorage key, per-attempt suffix appended
} as const;

export const QUERY_KEYS = {
  categories: ['categories'] as const,
  faculties: (categorySlug: string) => ['faculties', categorySlug] as const,
  subjects: (facultySlug: string) => ['subjects', facultySlug] as const,
  exams: (facultySlug: string, type?: string) => ['exams', facultySlug, type ?? 'all'] as const,
  home: ['home'] as const,
  leaderboard: (examId: string) => ['leaderboard', examId] as const,
  bookmarks: ['bookmarks'] as const,
};
