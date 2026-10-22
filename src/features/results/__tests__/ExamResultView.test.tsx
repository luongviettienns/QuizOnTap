import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ExamResultView } from '../ExamResultView';
import type { ExamResult, Question } from '@/domain/contracts';

describe('Exam Result View', () => {
  const mockResult: ExamResult = {
    sessionId: 'ses-1',
    correct: 18,
    incorrect: 2,
    unanswered: 0,
    unscored: 0,
    scoredCount: 20,
    attemptedScoredCount: 20,
    accuracyAmongAnswered: 90,
    percent: 90,
    chapterStats: {
      'Chương 1': { correct: 10, scored: 10 },
      'Chương 2': { correct: 8, scored: 10 },
    },
  };

  const mockQuestions: Question[] = [
    {
      id: 'q1',
      setId: 's1',
      kind: 'single',
      text: 'Câu 1 sai',
      options: [
        { id: 'opt-1', text: 'A' },
        { id: 'opt-2', text: 'B' },
      ],
      correctOptionIds: ['opt-1'],
      answerStatus: 'verified',
      answerOrigin: 'source',
      explanation: 'Giải thích câu 1',
      tags: ['Chương 1'],
      createdAt: 0,
      updatedAt: 0,
    },
  ];

  it('displays accurate score percentage and breakdown', () => {
    render(
      <ExamResultView
        result={mockResult}
        questions={mockQuestions}
        onRetry={() => {}}
        onReviewMistakes={() => {}}
      />
    );

    expect(screen.getByText('18/20')).toBeDefined();
    expect(screen.getAllByText('90%').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Chương 1')).toBeDefined();
    expect(screen.getByText('Chương 2')).toBeDefined();
  });

  it('triggers onReviewMistakes when button is clicked', () => {
    const onReviewMistakes = vi.fn();
    render(
      <ExamResultView
        result={mockResult}
        questions={mockQuestions}
        onRetry={() => {}}
        onReviewMistakes={onReviewMistakes}
      />
    );

    const reviewBtn = screen.getByRole('button', { name: /Ôn lại câu sai/i });
    fireEvent.click(reviewBtn);

    expect(onReviewMistakes).toHaveBeenCalled();
  });
});
