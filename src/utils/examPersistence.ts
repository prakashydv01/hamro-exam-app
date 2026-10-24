import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants/config';
import type { ExamQuestion } from '@/types/api';

/**
 * Client-side-only crash recovery for an in-progress exam - matches the
 * backend design decision to NOT have a server-side resume endpoint.
 * If the app crashes or is backgrounded and killed mid-exam, this is what
 * lets the exam-taking screen restore exactly where the user left off.
 */
export interface PersistedExamSession {
  attemptId: string;
  examId: string;
  title: string;
  durationMinutes: number;
  startedAt: string; // ISO - client-side copy for the countdown timer only;
  // the server's own startedAt is the one actually enforced at submit time.
  questions: ExamQuestion[];
  answers: Record<string, { selectedOptionId?: string; timeTaken?: number }>;
  currentIndex: number;
}

function keyFor(attemptId: string) {
  return `${STORAGE_KEYS.IN_PROGRESS_EXAM}_${attemptId}`;
}

export async function savePersistedSession(session: PersistedExamSession) {
  await AsyncStorage.setItem(keyFor(session.attemptId), JSON.stringify(session));
}

export async function loadPersistedSession(attemptId: string): Promise<PersistedExamSession | null> {
  const raw = await AsyncStorage.getItem(keyFor(attemptId));
  return raw ? JSON.parse(raw) : null;
}

export async function clearPersistedSession(attemptId: string) {
  await AsyncStorage.removeItem(keyFor(attemptId));
}

/** Finds any exam left in-progress (e.g. app was killed) so Home can offer
 * to resume it. Scans keys with our prefix since there's only ever one
 * active exam at a time in this app's UX. */
export async function findAnyInProgressSession(): Promise<PersistedExamSession | null> {
  const keys = await AsyncStorage.getAllKeys();
  const examKey = keys.find((k) => k.startsWith(STORAGE_KEYS.IN_PROGRESS_EXAM));
  if (!examKey) return null;
  const raw = await AsyncStorage.getItem(examKey);
  return raw ? JSON.parse(raw) : null;
}
