import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { ImportWizard } from '../ImportWizard';
import { quizDb } from '@/db/quizDb';
import { questionRepo } from '@/db/repositories';

describe('Import Wizard Component', () => {
  beforeEach(async () => {
    await quizDb.delete();
    await quizDb.open();
  });

  it('renders upload dropzone and bulk text area tab', () => {
    render(<ImportWizard onCompleted={() => {}} onCancel={() => {}} />);
    expect(screen.getByText(/Kéo thả file hoặc dán văn bản/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Dán văn bản/i })).toBeDefined();
  });

  it('allows pasting raw markdown, previews parsed questions, and commits to db', async () => {
    const onCompleted = vi.fn();
    render(<ImportWizard onCompleted={onCompleted} onCancel={() => {}} />);

    // Chuyển sang tab dán văn bản
    const pasteTab = screen.getByRole('button', { name: /Dán văn bản/i });
    fireEvent.click(pasteTab);

    // Dán câu hỏi
    const textarea = screen.getByPlaceholderText(/Dán nội dung câu hỏi/i);
    fireEvent.change(textarea, {
      target: {
        value: `
### Câu 1: Kinh tế học vi mô nghiên cứu gì?
- A. Hành vi của các chủ thể đơn lẻ trong nền kinh tế
- B. Toàn bộ nền kinh tế quốc gia
**Đáp án:** A
**Giải thích:** Căn cứ định nghĩa cơ bản.
        `,
      },
    });

    // Bấm Phân tích
    const parseBtn = screen.getByRole('button', { name: /Phân tích tài liệu/i });
    fireEvent.click(parseBtn);

    // Kiểm tra bước Preview hiển thị 1 câu hợp lệ
    await waitFor(() => {
      expect(screen.getByText(/1 câu phát hiện/i)).toBeDefined();
      expect(screen.getByText(/1 có đáp án/i)).toBeDefined();
    });

    // Bấm Hoàn tất nhập đề
    const commitBtn = screen.getByRole('button', { name: /Lưu vào thư viện/i });
    fireEvent.click(commitBtn);

    await waitFor(() => {
      expect(onCompleted).toHaveBeenCalledTimes(1);
    });

    // Xác nhận đã lưu vào DB
    const allQuestions = await questionRepo.listBySet(onCompleted.mock.calls[0][0]);
    expect(allQuestions.length).toBe(1);
    expect(allQuestions[0].text).toContain('Kinh tế học vi mô nghiên cứu gì?');
    expect(allQuestions[0].answerStatus).toBe('verified');
  });
});
