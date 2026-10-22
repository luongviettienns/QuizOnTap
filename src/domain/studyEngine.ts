import type {
  Question,
  StudyProgress,
  AnswerAttempt,
  StudySessionResult,
  ChapterStudyStat,
  HardestQuestionStat,
} from './contracts';
import { seededShuffle } from './quizEngine';

export const TARGET_TOTAL_QUESTIONS = 178;
export const REMEDIATION_BATCH_SIZE = 5;

/**
 * Initializes a new StudyProgress session with deterministic shuffling.
 */
export function createStudySession(
  sessionId: string,
  setId: string,
  questions: Question[],
  seed: number = Date.now()
): StudyProgress {
  const questionIds = questions.map((q) => q.id);
  const shuffledQuestionIds = seededShuffle(questionIds, seed);

  const optionOrderByQuestion: Record<string, string[]> = {};
  questions.forEach((q, idx) => {
    const optIds = q.options.map((o) => o.id);
    // Seed per question derived deterministically
    optionOrderByQuestion[q.id] = seededShuffle(optIds, seed + idx * 31);
  });

  return {
    sessionId,
    setId,
    contentVersion: 3,
    status: 'in-progress',
    phase: 'MAIN',
    questionOrder: shuffledQuestionIds,
    optionOrderByQuestion,
    mainCursor: 0,
    masteredIds: [],
    pendingWrongIds: [],
    remediationIds: [],
    remediationCursor: 0,
    remediationRound: 1,
    remediationUnresolvedIds: [],
    attemptCount: 0,
    wrongAttemptCount: 0,
    reviewBatchCount: 0,
    startedAt: Date.now(),
    completedAt: null,
    accumulatedActiveMs: 0,
  };
}

/**
 * Applies an answer submission to the current study session state.
 */
export function applyStudyAnswer(
  session: StudyProgress,
  questionId: string,
  selectedOptionIds: string[],
  questions: Question[]
): { updatedSession: StudyProgress; attempt: AnswerAttempt; isCorrect: boolean } {
  const question = questions.find((q) => q.id === questionId);
  const correctOptionIds = question?.correctOptionIds ?? [];

  const isCorrect =
    correctOptionIds.length > 0 &&
    correctOptionIds.length === selectedOptionIds.length &&
    correctOptionIds.every((id) => selectedOptionIds.includes(id));

  const attemptId = `att_${session.sessionId}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const attempt: AnswerAttempt = {
    id: attemptId,
    sessionId: session.sessionId,
    questionId,
    selectedOptionIds,
    correct: isCorrect,
    phase: session.phase === 'REMEDIATION' ? 'REMEDIATION' : 'MAIN',
    batchNo: session.phase === 'REMEDIATION' ? session.reviewBatchCount : null,
    createdAt: Date.now(),
  };

  const updated: StudyProgress = {
    ...session,
    attemptCount: session.attemptCount + 1,
    wrongAttemptCount: isCorrect ? session.wrongAttemptCount : session.wrongAttemptCount + 1,
  };

  if (isCorrect) {
    if (!updated.masteredIds.includes(questionId)) {
      updated.masteredIds = [...updated.masteredIds, questionId];
    }
  } else {
    if (session.phase === 'MAIN') {
      if (!updated.pendingWrongIds.includes(questionId)) {
        updated.pendingWrongIds = [...updated.pendingWrongIds, questionId];
      }
    } else if (session.phase === 'REMEDIATION') {
      if (!updated.remediationUnresolvedIds.includes(questionId)) {
        updated.remediationUnresolvedIds = [...updated.remediationUnresolvedIds, questionId];
      }
    }
  }

  return { updatedSession: updated, attempt, isCorrect };
}

/**
 * Transitions the session forward after feedback has been acknowledged by the user.
 */
export function advanceStudyNext(session: StudyProgress): StudyProgress {
  if (session.phase === 'MAIN') {
    const nextCursor = session.mainCursor + 1;

    // Check if 5 wrong questions accumulated
    if (session.pendingWrongIds.length >= REMEDIATION_BATCH_SIZE) {
      const batchIds = session.pendingWrongIds.slice(0, REMEDIATION_BATCH_SIZE);
      const remainingPending = session.pendingWrongIds.slice(REMEDIATION_BATCH_SIZE);
      return {
        ...session,
        phase: 'REMEDIATION',
        mainCursor: nextCursor,
        remediationIds: batchIds,
        pendingWrongIds: remainingPending,
        remediationCursor: 0,
        remediationRound: 1,
        remediationUnresolvedIds: [],
        reviewBatchCount: session.reviewBatchCount + 1,
      };
    }

    if (nextCursor < session.questionOrder.length) {
      return {
        ...session,
        mainCursor: nextCursor,
      };
    }

    // Reached end of 178 questions!
    // Check if there are leftover wrong questions (tail batch 1..4)
    if (session.pendingWrongIds.length > 0) {
      return {
        ...session,
        phase: 'REMEDIATION',
        mainCursor: session.questionOrder.length,
        remediationIds: [...session.pendingWrongIds],
        pendingWrongIds: [],
        remediationCursor: 0,
        remediationRound: 1,
        remediationUnresolvedIds: [],
        reviewBatchCount: session.reviewBatchCount + 1,
      };
    }

    // No leftover wrong questions, check mastery
    if (session.masteredIds.length >= session.questionOrder.length) {
      return {
        ...session,
        mainCursor: session.questionOrder.length,
        phase: 'COMPLETED',
        status: 'completed',
        completedAt: Date.now(),
      };
    }

    return {
      ...session,
      mainCursor: nextCursor,
    };
  }

  if (session.phase === 'REMEDIATION') {
    const nextCursor = session.remediationCursor + 1;

    if (nextCursor < session.remediationIds.length) {
      return {
        ...session,
        remediationCursor: nextCursor,
      };
    }

    // Reached end of this round in the current remediation batch
    if (session.remediationUnresolvedIds.length > 0) {
      // Must do another round for unresolved questions
      return {
        ...session,
        remediationIds: [...session.remediationUnresolvedIds],
        remediationUnresolvedIds: [],
        remediationCursor: 0,
        remediationRound: session.remediationRound + 1,
      };
    }

    // Entire remediation batch mastered!
    // If there are still pending wrong questions from earlier, or back to MAIN
    if (session.mainCursor < session.questionOrder.length) {
      return {
        ...session,
        phase: 'MAIN',
        remediationIds: [],
        remediationUnresolvedIds: [],
        remediationCursor: 0,
        remediationRound: 1,
      };
    }

    // We were at the end of MAIN and just finished tail batch
    if (session.pendingWrongIds.length > 0) {
      return {
        ...session,
        phase: 'REMEDIATION',
        remediationIds: [...session.pendingWrongIds],
        pendingWrongIds: [],
        remediationCursor: 0,
        remediationRound: 1,
        remediationUnresolvedIds: [],
        reviewBatchCount: session.reviewBatchCount + 1,
      };
    }

    if (session.masteredIds.length >= session.questionOrder.length) {
      return {
        ...session,
        phase: 'COMPLETED',
        status: 'completed',
        completedAt: Date.now(),
      };
    }

    return {
      ...session,
      phase: 'MAIN',
      remediationIds: [],
      remediationUnresolvedIds: [],
      remediationCursor: 0,
    };
  }

  return session;
}

/**
 * Calculates auditable, verifiable statistics from the session and attempt history.
 */
export function calculateStudyResult(
  session: StudyProgress,
  attempts: AnswerAttempt[],
  questions: Question[]
): StudySessionResult {
  const totalEligible = session.questionOrder.length;
  const masteredCount = session.masteredIds.length;

  // First-pass assessment: analyze first attempt for each question
  const firstAttemptsByQuestion = new Map<string, AnswerAttempt>();
  attempts.forEach((att) => {
    if (!firstAttemptsByQuestion.has(att.questionId)) {
      firstAttemptsByQuestion.set(att.questionId, att);
    }
  });

  let firstPassCorrectCount = 0;
  let firstPassWrongCount = 0;
  firstAttemptsByQuestion.forEach((att) => {
    if (att.correct) {
      firstPassCorrectCount++;
    } else {
      firstPassWrongCount++;
    }
  });

  const firstPassAccuracyPercent =
    totalEligible > 0 ? Math.round((firstPassCorrectCount / totalEligible) * 100) : 0;

  const totalAttempts = attempts.length;
  const correctAttempts = attempts.filter((a) => a.correct).length;
  const wrongAttempts = attempts.filter((a) => !a.correct).length;

  const uniqueEverWrong = new Set(attempts.filter((a) => !a.correct).map((a) => a.questionId));

  // Chapter statistics breakdown
  const chapterMap = new Map<string, { total: number; firstCorrect: number; firstWrong: number; attempts: number; mastered: number }>();

  questions.forEach((q) => {
    const ch = q.chapterId || 'Khác';
    if (!chapterMap.has(ch)) {
      chapterMap.set(ch, { total: 0, firstCorrect: 0, firstWrong: 0, attempts: 0, mastered: 0 });
    }
    const stat = chapterMap.get(ch)!;
    stat.total++;
    if (session.masteredIds.includes(q.id)) {
      stat.mastered++;
    }
    const firstAtt = firstAttemptsByQuestion.get(q.id);
    if (firstAtt) {
      if (firstAtt.correct) stat.firstCorrect++;
      else stat.firstWrong++;
    }
  });

  attempts.forEach((att) => {
    const q = questions.find((item) => item.id === att.questionId);
    const ch = q?.chapterId || 'Khác';
    const stat = chapterMap.get(ch);
    if (stat) {
      stat.attempts++;
    }
  });

  const chapterStats: ChapterStudyStat[] = Array.from(chapterMap.entries()).map(([chapterId, data]) => ({
    chapterId,
    totalQuestions: data.total,
    firstPassCorrect: data.firstCorrect,
    firstPassWrong: data.firstWrong,
    totalAttempts: data.attempts,
    mastered: data.mastered,
  }));

  // Hardest questions: ranked by number of wrong attempts
  const wrongCountsByQuestion = new Map<string, number>();
  attempts.forEach((att) => {
    if (!att.correct) {
      wrongCountsByQuestion.set(att.questionId, (wrongCountsByQuestion.get(att.questionId) || 0) + 1);
    }
  });

  const hardestQuestions: HardestQuestionStat[] = Array.from(wrongCountsByQuestion.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([qId, wrongCount]) => {
      const q = questions.find((item) => item.id === qId);
      const firstWrong = attempts.find((a) => a.questionId === qId && !a.correct);
      const wrongOptId = firstWrong?.selectedOptionIds[0];
      const wrongOpt = q?.options.find((o) => o.id === wrongOptId);

      return {
        questionId: qId,
        questionText: q?.text || '',
        wrongCount,
        firstWrongOptionText: wrongOpt?.text,
        explanation: q?.explanation,
        isSuggested: q?.answerStatus === 'suggested',
        chapterId: q?.chapterId,
      };
    });

  const durationMs = session.completedAt && session.startedAt
    ? Math.max(1000, session.completedAt - session.startedAt)
    : Math.max(1000, Date.now() - session.startedAt);

  return {
    sessionId: session.sessionId,
    totalEligible,
    masteredCount,
    firstPassCorrectCount,
    firstPassWrongCount,
    firstPassAccuracyPercent,
    totalAttempts,
    correctAttempts,
    wrongAttempts,
    uniqueEverWrongCount: uniqueEverWrong.size,
    remediationBatchCount: session.reviewBatchCount,
    startedAt: session.startedAt,
    completedAt: session.completedAt || Date.now(),
    durationMs,
    chapterStats,
    hardestQuestions,
  };
}
