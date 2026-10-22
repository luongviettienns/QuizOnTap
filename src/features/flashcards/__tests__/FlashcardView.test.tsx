import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FlashcardView } from '../FlashcardView';
import type { Question } from '@/domain/contracts';

describe('Flashcard 3D View', () => {
  const sampleQuestion: Question = {
    id: 'q1',
    setId: 's1',
    kind: 'single' as const,
    text: 'Thế nào là ô nhiễm môi trường?',
    options: [{ id: 'opt-1', text: 'Biến đổi tính chất môi trường' }],
    correctOptionIds: ['opt-1'],
    answerStatus: 'verified' as const,
    answerOrigin: 'source' as const,
    explanation: 'Theo luật BVMT 2020',
    tags: ['Môi trường'],
    createdAt: 0,
    updatedAt: 0,
  };

  it('flips card upon click to reveal answer and explanation', () => {
    render(<FlashcardView questions={[sampleQuestion]} onFinish={() => {}} />);
    const card = screen.getByTestId('flashcard-card');
    fireEvent.click(card);

    expect(screen.getByText(/Theo luật BVMT 2020/i)).toBeDefined();
    expect(screen.getByText(/Biến đổi tính chất môi trường/i)).toBeDefined();
  });

  it('allows rating card as mastered or needing review', () => {
    render(<FlashcardView questions={[sampleQuestion]} onFinish={() => {}} />);
    const card = screen.getByTestId('flashcard-card');
    fireEvent.click(card);

    const masteredBtn = screen.getByRole('button', { name: /Đã thuộc/i });
    expect(masteredBtn).toBeDefined();
  });
});
