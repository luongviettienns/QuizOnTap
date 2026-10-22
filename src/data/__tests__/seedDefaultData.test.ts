import { describe, it, expect, beforeEach } from 'vitest';
import {
  seedDefaultQuizSet,
  ensureCanonicalDefaultSet,
  DEFAULT_SET_ID,
  CANONICAL_CONTENT_VERSION,
  EXCLUDED_LEGACY_QUESTION_IDS,
} from '../seedDefaultData';
import { quizSetRepo, questionRepo } from '@/db/repositories';
import { quizDb } from '@/db/quizDb';
import type { Question } from '@/domain/contracts';

describe('Default Quiz Data Seeding & Migration (V3 178 Questions)', () => {
  beforeEach(async () => {
    await quizDb.quizSets.clear();
    await quizDb.questions.clear();
    await quizDb.appMetadata.clear();
  });

  it('correctly seeds exactly 178 canonical questions (104 verified, 74 suggested, 0 missing)', async () => {
    const setId = await ensureCanonicalDefaultSet();
    expect(setId).toBe(DEFAULT_SET_ID);

    const set = await quizSetRepo.getById(DEFAULT_SET_ID);
    expect(set).toBeDefined();
    expect(set?.title).toContain('Kinh tế học và Môi trường');
    expect(set?.schemaVersion).toBe(CANONICAL_CONTENT_VERSION);

    const questions = await questionRepo.listBySet(DEFAULT_SET_ID);
    expect(questions.length).toBe(178);

    const uniqueChapters = new Set(questions.map((q) => q.chapterId).filter(Boolean));
    expect(uniqueChapters.size).toBe(6);

    const verified = questions.filter((q) => q.answerStatus === 'verified');
    const suggested = questions.filter((q) => q.answerStatus === 'suggested');
    const missing = questions.filter((q) => q.answerStatus === 'missing');

    expect(verified.length).toBe(104);
    expect(suggested.length).toBe(74);
    expect(missing.length).toBe(0);

    // Assert that erroneous question #27 is absent
    const legacyFound = await quizDb.questions.get(EXCLUDED_LEGACY_QUESTION_IDS[0]);
    expect(legacyFound).toBeUndefined();
  });

  it('is idempotent and does not duplicate data when called multiple times', async () => {
    await ensureCanonicalDefaultSet();
    await ensureCanonicalDefaultSet();
    await seedDefaultQuizSet();

    const sets = await quizSetRepo.listAll();
    expect(sets.length).toBe(1);

    const questions = await questionRepo.listBySet(DEFAULT_SET_ID);
    expect(questions.length).toBe(178);
  });

  it('safely migrates from legacy 179-question database by pruning question #27', async () => {
    // Simulate legacy DB state with question #27
    const mockLegacyQuestion: Question = {
      id: EXCLUDED_LEGACY_QUESTION_IDS[0],
      setId: DEFAULT_SET_ID,
      kind: 'single',
      text: 'Cho hình vẽ sau... (câu lỗi thiếu hình)',
      options: [{ id: 'opt_1', text: 'A' }],
      correctOptionIds: null,
      answerStatus: 'missing',
      answerOrigin: null,
      tags: ['Chương 2'],
      createdAt: 1000,
      updatedAt: 1000,
    };

    await quizDb.quizSets.put({
      id: DEFAULT_SET_ID,
      title: 'Tài liệu cũ',
      schemaVersion: 2,
      createdAt: 1000,
      updatedAt: 1000,
    });
    await quizDb.questions.put(mockLegacyQuestion);

    // Verify it is present before migration
    const before = await quizDb.questions.get(EXCLUDED_LEGACY_QUESTION_IDS[0]);
    expect(before).toBeDefined();

    // Trigger migration
    await ensureCanonicalDefaultSet();

    // Verify it is purged and total count is 178
    const after = await quizDb.questions.get(EXCLUDED_LEGACY_QUESTION_IDS[0]);
    expect(after).toBeUndefined();

    const all = await questionRepo.listBySet(DEFAULT_SET_ID);
    expect(all.length).toBe(178);
  });
});
