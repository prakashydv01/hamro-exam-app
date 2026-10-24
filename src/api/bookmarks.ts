import { apiRequest } from './client';
import type { Bookmark } from '@/types/api';

export function getBookmarks() {
  return apiRequest<Bookmark[]>('/api/bookmarks');
}

export function addBookmark(questionId: string) {
  return apiRequest<Bookmark>('/api/bookmarks', { method: 'POST', body: { questionId } });
}

export function removeBookmark(questionId: string) {
  return apiRequest<{ message: string }>(`/api/bookmarks/${questionId}`, { method: 'DELETE' });
}
