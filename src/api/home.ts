import { apiRequest } from './client';
import type { HomeResponse } from '@/types/api';

export function getHome() {
  return apiRequest<HomeResponse>('/api/home');
}
