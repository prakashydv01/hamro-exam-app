// Mirrors the backend's Mongoose/API shapes. Keep in sync with
// hamro-exam-backend's models when the schema changes.

export interface Category {
  _id: string;
  name: string;
  slug: string;
}

export interface Faculty {
  _id: string;
  name: string;
  slug: string;
  categoryId: string;
}

export interface Subject {
  _id: string;
  name: string;
  slug: string;
  facultyId: string;
}

export interface SubjectDistributionItem {
  subjectId: string;
  count: number;
}

export interface ExamConfig {
  _id: string;
  title: string;
  examType: 'practice' | 'mock';
  duration: number; // minutes
  totalQuestions: number;
  correctMarks: number;
  negativeMarks: number;
  subjectDistribution?: SubjectDistributionItem[];
  // Only present for practice exams (populated server-side) - lets the app
  // list/start practice directly by subject name.
  subjectId?: { _id: string; name: string };
  // Practice exams only - when true, tapping the subject opens a chapter list first.
  chapterWise?: boolean;
}

export interface ExamChapter {
  chapter: string;
  count: number;
}

export interface ExamOption {
  id: string;
  text: string;
  imageUrl?: string;
}

export interface ExamQuestion {
  questionId: string;
  subjectId: string;
  question: string;
  imageUrl?: string;
  options: ExamOption[];
  // Only present when examType === 'practice' - mock exams never send
  // these until after submission (see backend exam.service.ts).
  correctOptionId?: string;
  explanation?: string;
}

export interface StartExamResponse {
  attemptId: string | null; // null for practice - nothing is persisted server-side
  examType: 'practice' | 'mock';
  title: string;
  duration: number; // minutes - unused by the client for practice
  totalQuestions: number;
  startedAt: string; // ISO timestamp
  questions: ExamQuestion[];
}

export interface SubmitAnswerPayload {
  questionId: string;
  selectedOptionId?: string;
  timeTaken?: number; // seconds, analytics only
}

export interface SubmitExamResponse {
  attemptId: string;
  score: number;
  totalQuestions: number;
  correct: number;
  wrong: number;
  unanswered: number;
  actualDuration: number;
  status: 'submitted' | 'expired';
}

export interface AttemptReviewItem {
  questionId: string;
  question: string;
  imageUrl?: string;
  options: ExamOption[];
  correctOptionId: string;
  selectedOptionId?: string;
  isCorrect?: boolean;
  explanation?: string;
}

export interface SubjectBreakdown {
  correct: number;
  wrong: number;
  unanswered: number;
  total: number;
}

export interface AttemptResult {
  attemptId: string;
  examType: 'practice' | 'mock';
  status: 'submitted' | 'expired';
  score: number;
  totalQuestions: number;
  correct: number;
  wrong: number;
  unanswered: number;
  actualDuration: number;
  allowedDuration: number;
  subjectBreakdown: Record<string, SubjectBreakdown>;
  review: AttemptReviewItem[];
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  score: number;
  durationSeconds: number;
}

export interface LeaderboardResponse {
  top: LeaderboardEntry[];
  myRank: { rank: number; score: number } | null;
}

export interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  emailVerified: boolean;
  role: 'user' | 'admin';
}

export interface RecentAttemptSummary {
  _id: string;
  examId: string;
  examType: 'practice' | 'mock';
  score: number;
  totalQuestions: number;
  submittedAt: string;
}

export interface HomeResponse {
  user: UserProfile;
  recentAttempts: RecentAttemptSummary[];
  categories: Category[];
}

export interface Bookmark {
  _id: string;
  questionId: {
    _id: string;
    question: string;
    options: ExamOption[];
    correctOptionId: string;
    explanation?: string;
    subjectId: string;
  };
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Every backend response is wrapped like this - see apiResponse.ts server-side.
export interface ApiSuccess<T> {
  success: true;
  data: T;
}
export interface ApiFailure {
  success: false;
  error: { message: string; code: string | null };
}
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;