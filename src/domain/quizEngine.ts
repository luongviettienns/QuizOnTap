import type { Question, QuizSession, SessionMode } from './contracts';
import { scoreExam } from './scoring';

export { scoreExam };

export interface SessionOptions {
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  seed?: number;
  durationMinutes?: number;
}

/**
 * Thuật toán sinh số ngẫu nhiên có seed (Mulberry32 PRNG)
 * Đảm bảo tính lặp lại (reproducibility) 100% trong kiểm thử và xáo trộn
 */
export function createPrng(seed: number) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Xáo trộn mảng độc lập với seed có thể tái lập
 */
export function seededShuffle<T>(array: T[], seed?: number): T[] {
  const result = [...array];
  const random = seed !== undefined ? createPrng(seed) : Math.random;

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function generateSessionId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'ses_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
}

/**
 * Tạo snapshot phiên làm bài (QuizSession) với thứ tự câu hỏi và thứ tự phương án cố định
 */
export function createSessionSnapshot(
  setId: string,
  mode: SessionMode,
  questions: Question[],
  options: SessionOptions = {}
): QuizSession {
  const seed = options.seed ?? Math.floor(Math.random() * 1000000);
  
  // 1. Xáo trộn câu hỏi nếu được chọn
  let orderedQuestions = [...questions];
  if (options.shuffleQuestions) {
    orderedQuestions = seededShuffle(orderedQuestions, seed);
  }

  const questionIds = orderedQuestions.map(q => q.id);
  const optionOrderByQuestion: Record<string, string[]> = {};

  // 2. Xáo trộn phương án lựa chọn độc lập cho từng câu hỏi
  for (let i = 0; i < orderedQuestions.length; i++) {
    const q = orderedQuestions[i];
    const optIds = q.options.map(o => o.id);
    if (options.shuffleOptions) {
      // Dùng seed biến thiên theo chỉ mục câu hỏi
      optionOrderByQuestion[q.id] = seededShuffle(optIds, seed + (i + 1) * 31);
    } else {
      optionOrderByQuestion[q.id] = optIds;
    }
  }

  const now = Date.now();
  let deadlineAt: number | null = null;
  if (mode === 'exam' && options.durationMinutes && options.durationMinutes > 0) {
    deadlineAt = now + options.durationMinutes * 60 * 1000;
  }

  return {
    id: generateSessionId(),
    setId,
    mode,
    status: 'in-progress',
    questionIds,
    optionOrderByQuestion,
    answersByQuestion: {},
    flaggedQuestionIds: [],
    startedAt: now,
    deadlineAt,
    submittedAt: null,
    questionSnapshotVersion: 1,
  };
}
