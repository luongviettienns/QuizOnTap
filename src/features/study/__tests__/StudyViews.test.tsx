import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StudyLanding } from '../StudyLanding';
import { ReleaseNotesView } from '../../releases/ReleaseNotesView';

describe('V3 Focused UI Components', () => {
  it('StudyLanding renders single subject and default locked preview', () => {
    const handleStartNew = vi.fn();
    const handleResume = vi.fn();

    render(
      <StudyLanding
        currentSession={null}
        onStartNew={handleStartNew}
        onResume={handleResume}
        onViewStats={() => {}}
      />
    );

    // Hero details
    expect(screen.getAllByText(/Kinh tế học và Môi trường/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/178/i).length).toBeGreaterThanOrEqual(1);

    // Locked state initially
    expect(screen.getByText(/Nội dung câu hỏi và đáp án đang được khóa/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Xem nội dung bộ đề/i })).toBeDefined();

    // Toggle reveal
    const revealBtn = screen.getByRole('button', { name: /Xem nội dung bộ đề/i });
    fireEvent.click(revealBtn);

    // After reveal, button changes to 'Ẩn lại nội dung' and questions appear
    expect(screen.getByRole('button', { name: /Ẩn lại nội dung/i })).toBeDefined();
  });

  it('ReleaseNotesView displays v3.0.0 as current release', () => {
    render(<ReleaseNotesView />);

    expect(screen.getAllByText(/v3.0.0/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Đang sử dụng/i)).toBeDefined();
    expect(screen.getByText(/Focused Studio V3/i)).toBeDefined();
  });
});
