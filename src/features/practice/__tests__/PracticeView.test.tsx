import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PracticeView } from '../PracticeView';

describe('Practice View Component', () => {
  const sampleQuestion = {
    id: 'q1',
    setId: 's1',
    kind: 'single' as const,
    text: 'Quy luật cung cầu là gì?',
    options: [
      { id: 'opt-a', text: 'Giá tăng khi cầu tăng' },
      { id: 'opt-b', text: 'Không liên quan' }
    ],
    correctOptionIds: ['opt-a'],
    answerStatus: 'verified' as const,
    answerOrigin: 'source' as const,
    explanation: 'Đây là nguyên lý cơ bản',
    tags: ['Chương 1'],
    createdAt: 0,
    updatedAt: 0,
  };

  it('displays options and provides immediate feedback upon selection', () => {
    const onFinish = vi.fn();
    render(<PracticeView questions={[sampleQuestion]} onFinish={onFinish} onExit={() => {}} />);

    expect(screen.getByText('Quy luật cung cầu là gì?')).toBeDefined();
    const optionA = screen.getByText('Giá tăng khi cầu tăng');
    fireEvent.click(optionA);

    expect(screen.getByText(/Chính xác!/i)).toBeDefined();
    expect(screen.getByText(/Đây là nguyên lý cơ bản/i)).toBeDefined();
  });

  it('displays friendly message for question missing verified key', () => {
    const missingQuestion = {
      ...sampleQuestion,
      id: 'q2',
      correctOptionIds: null,
      answerStatus: 'missing' as const,
    };

    render(<PracticeView questions={[missingQuestion]} onFinish={() => {}} onExit={() => {}} />);
    const optionA = screen.getByText('Giá tăng khi cầu tăng');
    fireEvent.click(optionA);

    expect(screen.getByText(/Câu hỏi tự ôn tập/i)).toBeDefined();
  });
});
