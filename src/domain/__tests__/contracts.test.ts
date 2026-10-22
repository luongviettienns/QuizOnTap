import { describe, it, expect } from 'vitest';
import { validateQuestion } from '../schemas';
import type { Question } from '../contracts';

describe('Question Contract Invariants', () => {
  it('should fail when a verified question has null correctOptionIds', () => {
    const invalidQuestion: Question = {
      id: 'q-1',
      setId: 'set-1',
      kind: 'single',
      text: 'Thị trường cạnh tranh hoàn hảo là gì?',
      options: [
        { id: 'opt-1', text: 'Nhiều người mua và người bán' },
        { id: 'opt-2', text: 'Chỉ có một người bán duy nhất' }
      ],
      correctOptionIds: null,
      answerStatus: 'verified', // Vi phạm: verified không được có correctOptionIds null
      answerOrigin: 'source',
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    expect(() => validateQuestion(invalidQuestion)).toThrow();
  });

  it('should pass when question is missing key and correctOptionIds is null', () => {
    const missingKeyQuestion: Question = {
      id: 'q-2',
      setId: 'set-1',
      kind: 'single',
      text: 'Quy luật cung cầu thể hiện điều gì?',
      options: [
        { id: 'opt-1', text: 'Giá tăng khi cầu vượt cung' },
        { id: 'opt-2', text: 'Giá giảm khi cầu vượt cung' }
      ],
      correctOptionIds: null,
      answerStatus: 'missing',
      answerOrigin: null,
      tags: ['Chương 1'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    expect(() => validateQuestion(missingKeyQuestion)).not.toThrow();
  });
});
