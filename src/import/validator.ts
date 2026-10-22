import type { QuestionDraft, ParseIssue } from './types';

export function validateDraft(draft: QuestionDraft): ParseIssue[] {
  const issues: ParseIssue[] = [];

  // 1. Kiểm tra số lượng phương án
  if (draft.options.length < 2) {
    issues.push({
      code: 'INSUFFICIENT_OPTIONS',
      severity: 'error',
      lineStart: draft.sourceLineStart,
      lineEnd: draft.sourceLineEnd,
      questionDraftId: draft.tempId,
      message: `Câu hỏi chỉ có ${draft.options.length} phương án (yêu cầu tối thiểu 2)`,
      fixSuggestion: 'Bổ sung thêm các phương án lựa chọn',
    });
  }

  // 2. Kiểm tra câu thiếu đáp án
  if (draft.detectedKeys.length === 0) {
    issues.push({
      code: 'MISSING_ANSWER',
      severity: 'warning',
      lineStart: draft.sourceLineStart,
      lineEnd: draft.sourceLineEnd,
      questionDraftId: draft.tempId,
      message: 'Tài liệu nguồn không ghi đáp án cho câu hỏi này',
      fixSuggestion: 'Bổ sung đáp án khi ôn tập hoặc qua Visual Editor',
    });
  } else {
    // 3. Kiểm tra đáp án có khớp với phương án nào không
    const labels = new Set(draft.options.map(o => o.label.toUpperCase()));
    for (const key of draft.detectedKeys) {
      if (!labels.has(key.toUpperCase())) {
        issues.push({
          code: 'ANSWER_KEY_MISMATCH',
          severity: 'error',
          lineStart: draft.sourceLineStart,
          lineEnd: draft.sourceLineEnd,
          questionDraftId: draft.tempId,
          message: `Đáp án "${key}" không khớp với phương án nào trong câu`,
          fixSuggestion: 'Kiểm tra lại ký hiệu chữ cái A/B/C/D của đáp án',
        });
      }
    }
  }

  // 4. Cảnh báo nhắc hình vẽ nhưng thiếu hình
  const lowerText = draft.questionText.toLowerCase();
  if (lowerText.includes('hình vẽ') || lowerText.includes('hình dưới') || lowerText.includes('đồ thị') || lowerText.includes('sơ đồ')) {
    issues.push({
      code: 'POSSIBLE_MISSING_IMAGE',
      severity: 'info',
      lineStart: draft.sourceLineStart,
      lineEnd: draft.sourceLineEnd,
      questionDraftId: draft.tempId,
      message: 'Câu hỏi có đề cập đến hình vẽ hoặc đồ thị trong văn bản nguồn',
      fixSuggestion: 'Bổ sung mô tả chi tiết hoặc kiểm tra tài liệu gốc',
    });
  }

  return issues;
}
