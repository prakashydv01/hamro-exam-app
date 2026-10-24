import { apiRequest } from './client';
import type { SubmitAnswerPayload, SubmitExamResponse, AttemptResult } from '@/types/api';

export function submitAttempt(attemptId: string, answers: SubmitAnswerPayload[]) {
  return apiRequest<SubmitExamResponse>('/api/attempts/submit', {
    method: 'POST',
    body: { attemptId, answers },
  });
}

export function getAttemptResult(attemptId: string) {
  return apiRequest<AttemptResult>(`/api/attempts/${attemptId}`);
}
