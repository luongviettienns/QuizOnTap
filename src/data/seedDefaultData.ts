import { quizDb } from '../db/quizDb';
import {
  DEFAULT_SET_ID,
  CANONICAL_CONTENT_VERSION,
  EXCLUDED_LEGACY_QUESTION_IDS,
  CANONICAL_QUIZ_SET,
  getCanonicalQuestions,
} from './canonicalQuizData';

export { DEFAULT_SET_ID, CANONICAL_CONTENT_VERSION, EXCLUDED_LEGACY_QUESTION_IDS, CANONICAL_QUIZ_SET };

/**
 * Ensures canonical 178-question default set is up to date in IndexedDB.
 * Safely removes legacy erroneous question #27 (Chương 2 Câu 17 missing image),
 * preserves existing user sets and study progress, and updates contentVersion.
 */
export async function ensureCanonicalDefaultSet(): Promise<string> {
  const existingSet = await quizDb.quizSets.get(DEFAULT_SET_ID);
  const existingCount = await quizDb.questions.where('setId').equals(DEFAULT_SET_ID).count();
  const legacyErroneous = await quizDb.questions.get(EXCLUDED_LEGACY_QUESTION_IDS[0]);

  // If already at canonical version with exactly 178 questions and no legacy error question
  if (
    existingSet &&
    existingSet.schemaVersion >= CANONICAL_CONTENT_VERSION &&
    existingCount === 178 &&
    !legacyErroneous
  ) {
    return DEFAULT_SET_ID;
  }

  const canonicalQuestions = getCanonicalQuestions();

  // Atomic transaction to ensure integrity
  await quizDb.transaction('rw', [quizDb.quizSets, quizDb.questions, quizDb.appMetadata], async () => {
    // 1. Delete legacy erroneous question(s)
    await quizDb.questions.bulkDelete(EXCLUDED_LEGACY_QUESTION_IDS);

    // 2. Upsert canonical 178 questions (preserving original IDs)
    await quizDb.questions.bulkPut(canonicalQuestions);

    // 3. Upsert canonical set metadata with schemaVersion 3
    await quizDb.quizSets.put({
      ...CANONICAL_QUIZ_SET,
      updatedAt: Date.now(),
    });

    // 4. Record migration metadata
    await quizDb.appMetadata.put({
      key: 'canonical_content_version',
      value: CANONICAL_CONTENT_VERSION,
      updatedAt: Date.now(),
    });
  });

  return DEFAULT_SET_ID;
}

// Backward compatibility alias
export const seedDefaultQuizSet = ensureCanonicalDefaultSet;

