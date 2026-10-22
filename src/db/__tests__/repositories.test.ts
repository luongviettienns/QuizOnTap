import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { quizDb } from '../quizDb';
import { quizSetRepo, questionRepo, sessionRepo, resultRepo } from '../repositories';

describe('IndexedDB Repositories', () => {
  beforeEach(async () => {
    await quizDb.delete();
    await quizDb.open();
  });

  it('creates quiz set and atomically imports questions', async () => {
    const set = await quizSetRepo.create({
      title: 'Kinh tế học & Môi trường',
      description: 'Bộ đề 179 câu',
    });
    expect(set.id).toBeDefined();

    await questionRepo.batchCreate([
      {
        id: 'q-1',
        setId: set.id,
        kind: 'single',
        text: 'Kinh tế học nghiên cứu điều gì?',
        options: [{ id: 'opt-a', text: 'Sự khan hiếm nguồn lực' }],
        correctOptionIds: null,
        answerStatus: 'missing',
        answerOrigin: null,
        tags: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
    ]);

    const count = await questionRepo.countBySet(set.id);
    expect(count).toBe(1);

    const questions = await questionRepo.listBySet(set.id);
    expect(questions[0].text).toContain('Kinh tế học nghiên cứu điều gì?');
  });

  it('manages sessions and results lifecycle', async () => {
    const set = await quizSetRepo.create({ title: 'Set 1' });
    const session = await sessionRepo.create({
      id: 'ses-1',
      setId: set.id,
      mode: 'exam',
      status: 'in-progress',
      questionIds: ['q-1'],
      optionOrderByQuestion: { 'q-1': ['opt-a'] },
      answersByQuestion: {},
      flaggedQuestionIds: [],
      startedAt: Date.now(),
      deadlineAt: Date.now() + 600000,
      submittedAt: null,
      questionSnapshotVersion: 1,
    });
    expect(session.id).toBe('ses-1');

    await sessionRepo.updateAnswer('ses-1', 'q-1', ['opt-a']);
    const updated = await sessionRepo.getById('ses-1');
    expect(updated?.answersByQuestion['q-1']).toEqual(['opt-a']);

    const result = await resultRepo.save({
      sessionId: 'ses-1',
      correct: 1,
      incorrect: 0,
      unanswered: 0,
      unscored: 0,
      scoredCount: 1,
      attemptedScoredCount: 1,
      accuracyAmongAnswered: 100,
      percent: 100,
      chapterStats: {},
    });
    expect(result.sessionId).toBe('ses-1');
  });
});
