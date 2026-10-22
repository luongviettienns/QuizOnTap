import { describe, it, expect, beforeEach } from 'vitest';
import { seedDefaultQuizSet, DEFAULT_SET_ID } from '../seedDefaultData';
import { quizSetRepo, questionRepo } from '@/db/repositories';
import { quizDb } from '@/db/quizDb';

describe('Default Quiz Data Seeding', () => {
  beforeEach(async () => {
    await quizDb.quizSets.clear();
    await quizDb.questions.clear();
  });

  it('correctly seeds the 179 questions from Tai_lieu_on_tap_Kinh_te_hoc_va_Moi_truong_AI.md', async () => {
    const setId = await seedDefaultQuizSet();
    expect(setId).toBe(DEFAULT_SET_ID);

    const set = await quizSetRepo.getById(DEFAULT_SET_ID);
    expect(set).toBeDefined();
    expect(set?.title).toBe('Tài liệu ôn tập Kinh tế học và Môi trường');

    const questions = await questionRepo.listBySet(DEFAULT_SET_ID);
    expect(questions.length).toBe(179);

    const uniqueChapters = new Set(questions.map((q) => q.chapterId).filter(Boolean));
    expect(uniqueChapters.size).toBe(6);

    const verified = questions.filter((q) => q.answerStatus === 'verified');
    const suggested = questions.filter((q) => q.answerStatus === 'suggested');
    const missing = questions.filter((q) => q.answerStatus === 'missing');

    expect(verified.length).toBe(104);
    expect(suggested.length).toBe(74);
    expect(missing.length).toBe(1);

    // Kiểm tra câu duy nhất bị thiếu đáp án là Chương 2 Câu 17 (do thiếu hình vẽ)
    expect(missing[0].chapterId).toContain('Chương 2');
    expect(missing[0].explanation).toContain('thiếu hình vẽ');
  });

  it('is idempotent and does not duplicate data when called multiple times', async () => {
    await seedDefaultQuizSet();
    await seedDefaultQuizSet();

    const sets = await quizSetRepo.listAll();
    expect(sets.length).toBe(1);

    const questions = await questionRepo.listBySet(DEFAULT_SET_ID);
    expect(questions.length).toBe(179);
  });
});
