import { useAuthStore } from '@/store/authStore';

// Thin re-export so screens import from src/hooks consistently, same as
// the React-Query-backed hooks below - keeps the import pattern uniform
// even though this one isn't React Query (auth is app-wide session state,
// not a cacheable server query).
export function useAuth() {
  return useAuthStore();
}
