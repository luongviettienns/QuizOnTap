import type { Question, ExamResult } from './contracts';

function setEquals(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  for (const item of a) {
    if (!b.has(item)) return false;
  }
  return true;
}

/**
 * Thuật toán chấm điểm bài thi chính thức (Pure Function)
 * Invariant: scoredCount = correct + incorrect + unanswered.
 * accuracyAmongAnswered = correct / (correct + incorrect).
 * Câu unscored (missing/suggested) bị loại khỏi mẫu số tính điểm chính thức.
 */
export function scoreExam(
  sessionId: string,
  questions: Question[],
  answers: Record<string, string[]>
): ExamResult {
  let correct = 0;
  let incorrect = 0;
  let unanswered = 0;
  let unscored = 0;
  const chapterStats: Record<string, { correct: number; scored: number }> = {};

  for (const q of questions) {
    const chapterKey = q.chapterId || (q.tags && q.tags[0]) || 'Chung';
    if (!chapterStats[chapterKey]) {
      chapterStats[chapterKey] = { correct: 0, scored: 0 };
    }

    // Nếu câu hỏi chưa có key verified
    if (q.answerStatus !== 'verified' || !q.correctOptionIds || q.correctOptionIds.length === 0) {
      unscored++;
      continue;
    }

    chapterStats[chapterKey].scored++;
    const chosen = answers[q.id] ?? [];

    if (chosen.length === 0) {
      unanswered++;
      continue;
    }

    const isCorrect = setEquals(new Set(chosen), new Set(q.correctOptionIds));
    if (isCorrect) {
      correct++;
      chapterStats[chapterKey].correct++;
    } else {
      incorrect++;
    }
  }

  const attemptedScoredCount = correct + incorrect;
  const scoredCount = attemptedScoredCount + unanswered;
  const percent = scoredCount > 0 ? (correct / scoredCount) * 100 : null;
  const accuracyAmongAnswered = attemptedScoredCount > 0 ? (correct / attemptedScoredCount) * 100 : null;

  return {
    sessionId,
    correct,
    incorrect,
    unanswered,
    unscored,
    scoredCount,
    attemptedScoredCount,
    accuracyAmongAnswered,
    percent,
    chapterStats,
  };
}
