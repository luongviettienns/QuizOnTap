import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ExamView } from '../ExamView';
import type { Question } from '@/domain/contracts';

describe('Exam Mode View', () => {
  const sampleQuestions: Question[] = [
    {
      id: 'q1',
      setId: 's1',
      kind: 'single' as const,
      text: 'Câu 1 thi thử',
      options: [
        { id: 'opt-1', text: 'Lựa chọn thứ nhất' },
        { id: 'opt-2', text: 'Lựa chọn thứ hai' },
      ],
      correctOptionIds: ['opt-1'],
      answerStatus: 'verified' as const,
      answerOrigin: 'source' as const,
      tags: [],
      createdAt: 0,
      updatedAt: 0,
    },
    {
      id: 'q2',
      setId: 's1',
      kind: 'single' as const,
      text: 'Câu 2 thi thử',
      options: [
        { id: 'opt-3', text: 'C' },
        { id: 'opt-4', text: 'D' },
      ],
      correctOptionIds: ['opt-4'],
      answerStatus: 'verified' as const,
      answerOrigin: 'source' as const,
      tags: [],
      createdAt: 0,
      updatedAt: 0,
    },
  ];

  it('allows flagging a difficult question and toggles flagged state in matrix', () => {
    render(
      <ExamView
        questions={sampleQuestions}
        durationMinutes={15}
        onSubmit={() => {}}
      />
    );

    const flagBtn = screen.getByRole('button', { name: /Gắn cờ/i });
    fireEvent.click(flagBtn);

    expect(screen.getByTestId('matrix-item-0')).toHaveAttribute('data-flagged', 'true');
  });

  it('allows selecting an option and marks question as answered in matrix', () => {
    render(
      <ExamView
        questions={sampleQuestions}
        durationMinutes={15}
        onSubmit={() => {}}
      />
    );

    const optionA = screen.getByText('Lựa chọn thứ nhất');
    fireEvent.click(optionA);

    expect(screen.getByTestId('matrix-item-0')).toHaveAttribute('data-answered', 'true');
  });

  it('shows submit modal with answered and unanswered stats when Nộp bài is clicked', () => {
    const onSubmit = vi.fn();
    render(
      <ExamView
        questions={sampleQuestions}
        durationMinutes={15}
        onSubmit={onSubmit}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /Nộp bài/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Xác nhận nộp bài thi/i)).toBeDefined();
    expect(screen.getByText(/Chưa làm: 2/i)).toBeDefined();
  });
});
