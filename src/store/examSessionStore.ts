import { create } from 'zustand';
import type { ExamQuestion, StartExamResponse } from '@/types/api';
import { savePersistedSession, clearPersistedSession, loadPersistedSession } from '@/utils/examPersistence';

interface AnswerState {
  selectedOptionId?: string;
  timeTaken?: number; // seconds spent on this question, analytics only
}

interface ExamSessionState {
  attemptId: string | null;
  examId: string | null;
  title: string;
  durationMinutes: number;
  startedAt: string | null; // client-side copy, for the on-screen countdown only
  questions: ExamQuestion[];
  answers: Record<string, AnswerState>;
  currentIndex: number;
  questionStartedAt: number | null; // epoch ms, resets each time currentIndex changes

  /** Starts a fresh session from a /api/exams/start response and persists it. */
  startSession: (examId: string, res: StartExamResponse) => Promise<void>;
  /** Restores a session that was persisted locally (app was killed mid-exam). */
  restoreSession: (attemptId: string) => Promise<boolean>;
  selectOption: (questionId: string, optionId: string) => void;
  goToQuestion: (index: number) => void;
  next: () => void;
  previous: () => void;
  /** Builds the payload for POST /api/attempts/submit and clears local state. */
  buildSubmitPayload: () => { attemptId: string; answers: { questionId: string; selectedOptionId?: string; timeTaken?: number }[] };
  clearSession: () => Promise<void>;
}

const initialState = {
  attemptId: null,
  examId: null,
  title: '',
  durationMinutes: 0,
  startedAt: null,
  questions: [] as ExamQuestion[],
  answers: {} as Record<string, AnswerState>,
  currentIndex: 0,
  questionStartedAt: null as number | null,
};

export const useExamSessionStore = create<ExamSessionState>((set, get) => ({
  ...initialState,

  startSession: async (examId, res) => {
    // This store is mock-exam-only; practice uses its own local-only flow
    // (see app/exam/[examId]/practice.tsx) and never calls this. Mock
    // exams always get a real attemptId from the backend (see
    // exam.service.ts's startMockExam), so this should never actually fire.
    if (!res.attemptId) {
      throw new Error('startSession called without an attemptId - this should only happen for mock exams');
    }

    set({
      attemptId: res.attemptId,
      examId,
      title: res.title,
      durationMinutes: res.duration,
      startedAt: res.startedAt,
      questions: res.questions,
      answers: {},
      currentIndex: 0,
      questionStartedAt: Date.now(),
    });

    await savePersistedSession({
      attemptId: res.attemptId,
      examId,
      title: res.title,
      durationMinutes: res.duration,
      startedAt: res.startedAt,
      questions: res.questions,
      answers: {},
      currentIndex: 0,
    });
  },

  restoreSession: async (attemptId) => {
    const persisted = await loadPersistedSession(attemptId);
    if (!persisted) return false;

    set({
      attemptId: persisted.attemptId,
      examId: persisted.examId,
      title: persisted.title,
      durationMinutes: persisted.durationMinutes,
      startedAt: persisted.startedAt,
      questions: persisted.questions,
      answers: persisted.answers,
      currentIndex: persisted.currentIndex,
      questionStartedAt: Date.now(),
    });
    return true;
  },

  selectOption: (questionId, optionId) => {
    const { questionStartedAt, answers } = get();
    const elapsed = questionStartedAt ? Math.round((Date.now() - questionStartedAt) / 1000) : undefined;

    const nextAnswers = {
      ...answers,
      [questionId]: { selectedOptionId: optionId, timeTaken: elapsed },
    };
    set({ answers: nextAnswers });
    void persistCurrent(get());
  },

  goToQuestion: (index) => {
    set({ currentIndex: index, questionStartedAt: Date.now() });
    void persistCurrent(get());
  },

  next: () => {
    const { currentIndex, questions } = get();
    if (currentIndex < questions.length - 1) {
      set({ currentIndex: currentIndex + 1, questionStartedAt: Date.now() });
      void persistCurrent(get());
    }
  },

  previous: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1, questionStartedAt: Date.now() });
      void persistCurrent(get());
    }
  },

  buildSubmitPayload: () => {
    const { attemptId, questions, answers } = get();
    return {
      attemptId: attemptId as string,
      answers: questions.map((q) => ({
        questionId: q.questionId,
        selectedOptionId: answers[q.questionId]?.selectedOptionId,
        timeTaken: answers[q.questionId]?.timeTaken,
      })),
    };
  },

  clearSession: async () => {
    const { attemptId } = get();
    if (attemptId) await clearPersistedSession(attemptId);
    set(initialState);
  },
}));

function persistCurrent(state: ExamSessionState) {
  if (!state.attemptId) return Promise.resolve();
  return savePersistedSession({
    attemptId: state.attemptId,
    examId: state.examId as string,
    title: state.title,
    durationMinutes: state.durationMinutes,
    startedAt: state.startedAt as string,
    questions: state.questions,
    answers: state.answers,
    currentIndex: state.currentIndex,
  });
}