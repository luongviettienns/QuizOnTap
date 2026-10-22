import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LibraryView } from '../LibraryView';
import type { QuizSet } from '@/domain/contracts';

describe('Library View Component', () => {
  it('displays empty state with CTA when no quiz sets exist', () => {
    render(<LibraryView quizSets={[]} onSelectSet={() => {}} onOpenImport={() => {}} onRefresh={() => {}} />);
    expect(screen.getByText(/Chưa có bộ đề nào/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Nhập bộ đề ngay/i })).toBeDefined();
  });

  it('renders quiz set card and triggers selection', () => {
    const mockSet: QuizSet = {
      id: 'set-1',
      title: 'Đề Kinh Tế Học Vi Mô',
      description: '30 câu ôn tập',
      schemaVersion: 2,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const onSelectSet = vi.fn();
    render(<LibraryView quizSets={[mockSet]} onSelectSet={onSelectSet} onOpenImport={() => {}} onRefresh={() => {}} />);

    expect(screen.getByText('Đề Kinh Tế Học Vi Mô')).toBeDefined();
    expect(screen.getByText('30 câu ôn tập')).toBeDefined();

    const startBtn = screen.getByRole('button', { name: /Mở bộ đề/i });
    fireEvent.click(startBtn);

    expect(onSelectSet).toHaveBeenCalledWith('set-1');
  });
});
