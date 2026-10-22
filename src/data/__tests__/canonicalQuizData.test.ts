import { describe, it, expect } from 'vitest';
import {
  getCanonicalQuestions,
  DEFAULT_SET_ID,
  CANONICAL_CONTENT_VERSION,
  EXCLUDED_LEGACY_QUESTION_IDS,
  CANONICAL_QUIZ_SET,
} from '../canonicalQuizData';

describe('Canonical 178 Questions Dataset (V3 Spec)', () => {
  const questions = getCanonicalQuestions();

  it('contains exactly 178 eligible questions', () => {
    expect(questions.length).toBe(178);
  });

  it('has exactly 104 verified and 74 suggested questions, and 0 missing keys', () => {
    const verified = questions.filter((q) => q.answerStatus === 'verified');
    const suggested = questions.filter((q) => q.answerStatus === 'suggested');
    const missing = questions.filter((q) => q.answerStatus === 'missing');

    expect(verified.length).toBe(104);
    expect(suggested.length).toBe(74);
    expect(missing.length).toBe(0);
  });

  it('excludes legacy question 27 (Chương 2 Câu 17 missing diagram)', () => {
    const excludedFound = questions.find((q) =>
      EXCLUDED_LEGACY_QUESTION_IDS.includes(q.id)
    );
    expect(excludedFound).toBeUndefined();
    expect(questions.some((q) => q.id === 'q_set_kinh_te_va_moi_truong_27')).toBe(false);
  });

  it('preserves legacy question IDs without re-indexing', () => {
    expect(questions[0].id).toBe('q_set_kinh_te_va_moi_truong_1');
    expect(questions[25].id).toBe('q_set_kinh_te_va_moi_truong_26');
    // Index 26 corresponds to original question 28
    expect(questions[26].id).toBe('q_set_kinh_te_va_moi_truong_28');
    expect(questions[177].id).toBe('q_set_kinh_te_va_moi_truong_179');
  });

  it('guarantees unique IDs for all 178 questions', () => {
    const ids = questions.map((q) => q.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(178);
  });

  it('ensures each question has unique option IDs and valid correctOptionIds', () => {
    questions.forEach((q) => {
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      const optIds = q.options.map((o) => o.id);
      expect(new Set(optIds).size).toBe(q.options.length);

      expect(q.correctOptionIds).not.toBeNull();
      expect(q.correctOptionIds!.length).toBeGreaterThan(0);
      q.correctOptionIds!.forEach((corrId) => {
        expect(optIds).toContain(corrId);
      });
    });
  });

  it('covers all 6 chapters', () => {
    const chapters = new Set(questions.map((q) => q.chapterId).filter(Boolean));
    expect(chapters.size).toBe(6);
    expect(Array.from(chapters).some((c) => c?.includes('Chương 1'))).toBe(true);
    expect(Array.from(chapters).some((c) => c?.includes('Chương 6'))).toBe(true);
  });

  it('provides matching CANONICAL_QUIZ_SET metadata', () => {
    expect(CANONICAL_QUIZ_SET.id).toBe(DEFAULT_SET_ID);
    expect(CANONICAL_QUIZ_SET.schemaVersion).toBe(CANONICAL_CONTENT_VERSION);
    expect(CANONICAL_QUIZ_SET.title).toContain('Kinh tế học và Môi trường');
  });
});
