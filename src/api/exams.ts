import { apiRequest } from './client';
import type { ExamChapter, ExamConfig, StartExamResponse } from '@/types/api';

export function getExams(facultySlug: string, examType?: 'practice' | 'mock') {
  const typeQuery = examType ? `&type=${examType}` : '';
  return apiRequest<ExamConfig[]>(`/api/exams?faculty=${encodeURIComponent(facultySlug)}${typeQuery}`, {
    auth: false,
  });
}

/** `chapter` is only used by chapter-wise practice exams; omit it for the whole subject. */
export function startExam(examId: string, chapter?: string) {
  return apiRequest<StartExamResponse>('/api/exams/start', {
    method: 'POST',
    body: chapter ? { examId, chapter } : { examId },
  });
}

export function getExamChapters(examId: string) {
  return apiRequest<ExamChapter[]>(`/api/exams/${encodeURIComponent(examId)}/chapters`, { auth: false });
}