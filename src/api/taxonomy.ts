import { apiRequest } from './client';
import type { Category, Faculty, Subject } from '@/types/api';

export function getCategories() {
  return apiRequest<Category[]>('/api/categories', { auth: false });
}

export function getFaculties(categorySlug: string) {
  return apiRequest<Faculty[]>(`/api/faculties?category=${encodeURIComponent(categorySlug)}`, { auth: false });
}

export function getSubjects(facultySlug: string) {
  return apiRequest<Subject[]>(`/api/subjects?faculty=${encodeURIComponent(facultySlug)}`, { auth: false });
}
