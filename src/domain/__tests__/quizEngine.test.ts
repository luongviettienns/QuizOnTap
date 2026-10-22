import { describe, it, expect } from 'vitest';
import { scoreExam, createSessionSnapshot, seededShuffle } from '../quizEngine';
import type { Question } from '../contracts';

describe('Quiz Engine & Scoring Invariants', () => {
  const sampleQuestions: Question[] = [
    {
      id: 'q1',
      setId: 's1',
      kind: 'single',
      text: 'Q1',
      options: [{ id: 'opt-a', text: 'A' }, { id: 'opt-b', text: 'B' }],
      correctOptionIds: ['opt-a'],
      answerStatus: 'verified',
      answerOrigin: 'source',
      tags: [],
      createdAt: 0,
      updatedAt: 0,
    },
    {
      id: 'q2',
      setId: 's1',
      kind: 'single',
      text: 'Q2',
      options: [{ id: 'opt-c', text: 'C' }, { id: 'opt-d', text: 'D' }],
      correctOptionIds: ['opt-c'],
      answerStatus: 'verified',
      answerOrigin: 'source',
      tags: [],
      createdAt: 0,
      updatedAt: 0,
    },
    {
      id: 'q3',
      setId: 's1',
      kind: 'single',
      text: 'Q3 (Missing Key)',
      options: [{ id: 'opt-e', text: 'E' }, { id: 'opt-f', text: 'F' }],
      correctOptionIds: null,
      answerStatus: 'missing',
      answerOrigin: null,
      tags: [],
      createdAt: 0,
      updatedAt: 0,
    }
  ];

  it('scores exam accurately: 1 correct, 1 blank, 1 missing-key unscored -> 50% score', () => {
    // q1 trả lời đúng ('opt-a'), q2 bỏ trống, q3 chọn bừa nhưng không có key
    const answers = {
      q1: ['opt-a'],
      q3: ['opt-e']
    };
    const result = scoreExam('ses-1', sampleQuestions, answers);

    expect(result.correct).toBe(1);
    expect(result.incorrect).toBe(0);
    expect(result.unanswered).toBe(1);
    expect(result.unscored).toBe(1);
    expect(result.scoredCount).toBe(2); // q1 và q2 đủ điều kiện chấm
    expect(result.percent).toBe(50);    // 1 / 2 * 100%
    expect(result.accuracyAmongAnswered).toBe(100); // 1 / (1 + 0)
  });

  it('supports deterministic dual shuffle with seed', () => {
    const list = ['A', 'B', 'C', 'D', 'E'];
    const shuffled1 = seededShuffle(list, 12345);
    const shuffled2 = seededShuffle(list, 12345);
    const shuffled3 = seededShuffle(list, 99999);

    expect(shuffled1).toEqual(shuffled2);
    expect(shuffled1).not.toEqual(shuffled3);
  });

  it('creates session snapshot preserving question and option presentation orders', () => {
    const session = createSessionSnapshot('s1', 'exam', sampleQuestions, {
      shuffleQuestions: true,
      shuffleOptions: true,
      seed: 42,
      durationMinutes: 30,
    });

    expect(session.questionIds.length).toBe(3);
    expect(session.optionOrderByQuestion['q1'].length).toBe(2);
    expect(session.deadlineAt).toBeGreaterThan(session.startedAt);
  });
});
