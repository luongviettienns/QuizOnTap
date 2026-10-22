import type { QuestionDraft, ParseResult, ParseIssue, ParserOptions } from './types';
import { validateDraft } from './validator';

export function parseDocument(rawContent: string, options: ParserOptions = {}): ParseResult {
  const lines = rawContent.replace(/\r\n/g, '\n').split('\n');
  const drafts: QuestionDraft[] = [];
  const allIssues: ParseIssue[] = [];

  let currentChapter = options.defaultChapter || '';
  let currentDraft: QuestionDraft | null = null;
  let currentOption: { label: string; text: string } | null = null;
  let state: 'OUTSIDE' | 'IN_QUESTION' | 'IN_OPTIONS' | 'IN_EXPLANATION' = 'OUTSIDE';

  const finalizeDraft = (lineEndNumber: number) => {
    if (!currentDraft) return;

    // Lưu option cuối cùng nếu có
    if (currentOption) {
      currentDraft.options.push({ ...currentOption });
      currentOption = null;
    }

    currentDraft.sourceLineEnd = lineEndNumber;
    currentDraft.questionText = currentDraft.questionText.trim();
    if (currentDraft.explanation) {
      currentDraft.explanation = currentDraft.explanation.trim();
    }

    // Làm sạch text của từng phương án
    currentDraft.options = currentDraft.options.map(opt => ({
      label: opt.label.toUpperCase(),
      text: opt.text.trim(),
    }));

    // Chạy validator
    const issues = validateDraft(currentDraft);
    currentDraft.issues = issues;
    allIssues.push(...issues);

    drafts.push(currentDraft);
    currentDraft = null;
    state = 'OUTSIDE';
  };

  for (let i = 0; i < lines.length; i++) {
    const lineNum = i + 1;
    const rawLine = lines[i];
    const trimmedLine = rawLine.trim();

    // 1. Nhận diện Chương
    const chapterMatch = trimmedLine.match(/^(?:#{1,3}\s+)?(Chương\s+[0-9IVXLCDM]+[:.]?.*)/i);
    if (chapterMatch) {
      if (currentDraft) {
        finalizeDraft(lineNum - 1);
      }
      currentChapter = chapterMatch[1].replace(/^[#\s]+/, '').trim();
      continue;
    }

    // 2. Nhận diện Bắt đầu câu hỏi
    let questionMatch = trimmedLine.match(/^(?:###?\s*)?Câu\s+(\d+)[:.]?\s*(.*)/i);
    if (!questionMatch && !trimmedLine.match(/^[A-Za-z][\.\)]/)) {
      questionMatch = trimmedLine.match(/^(\d+)[\.\)]\s+(.*)/);
    }

    if (questionMatch) {
      if (currentDraft) {
        finalizeDraft(lineNum - 1);
      }

      currentDraft = {
        tempId: `draft_${drafts.length + 1}_${lineNum}`,
        rawText: rawLine,
        questionText: questionMatch[2] ? questionMatch[2].trim() : '',
        options: [],
        detectedKeys: [],
        chapter: currentChapter,
        sourceLineStart: lineNum,
        sourceLineEnd: lineNum,
        issues: [],
      };
      state = 'IN_QUESTION';
      continue;
    }

    // Nếu chưa vào câu hỏi nào thì bỏ qua các dòng trắng/tiêu đề ngoài
    if (!currentDraft) continue;

    // 3. Nhận diện Lựa chọn (A., B., C., D. hoặc - A., - B.)
    const optionMatch = trimmedLine.match(/^(?:-\s*)?([A-Za-z])[\.\)]\s+(.*)/i)
      || trimmedLine.match(/^(?:-\s*\[\s*([A-Za-z])\s*\])\s+(.*)/i);

    if (optionMatch && !trimmedLine.toLowerCase().includes('đáp án') && !trimmedLine.toLowerCase().includes('giải thích')) {
      if (currentOption) {
        currentDraft.options.push({ ...currentOption });
      }
      currentOption = {
        label: optionMatch[1].toUpperCase(),
        text: optionMatch[2] ? optionMatch[2].trim() : '',
      };
      state = 'IN_OPTIONS';
      continue;
    }

    // 4. Nhận diện Đáp án đúng
    const answerMatch = trimmedLine.match(/^(?:[-–—→>]\s*)?(?:\*{1,2})?(?:[-–—→>]\s*)?(?:Đáp án(?:\s+đúng)?|ĐA|Answer|Key)[:.]?\s*(?:\*{1,2})?\s*([A-Za-z,\s]+)(?:\*{1,2})?/i);
    if (answerMatch) {
      if (currentOption) {
        currentDraft.options.push({ ...currentOption });
        currentOption = null;
      }
      const rawKeys = answerMatch[1].replace(/[*_]/g, '').trim();
      // Tách các keys nếu có dấu phẩy hoặc khoảng trắng (cho câu multi)
      const keys = rawKeys.split(/[,;\s]+/).filter(k => /^[A-Za-z]$/.test(k)).map(k => k.toUpperCase());
      currentDraft.detectedKeys = keys.length > 0 ? keys : [rawKeys.substring(0, 1).toUpperCase()];
      state = 'IN_OPTIONS';
      continue;
    }

    // 5. Nhận diện Chưa thể khoanh đáp án / Cảnh báo thiếu hình
    const noAnswerMatch = trimmedLine.match(/^(?:[-–—→>]\s*)?(?:\*{1,2})?(?:Chưa thể khoanh đáp án|Chưa có đáp án|Thiếu hình vẽ)(?:.*)/i);
    if (noAnswerMatch) {
      if (currentOption) {
        currentDraft.options.push({ ...currentOption });
        currentOption = null;
      }
      const note = trimmedLine.replace(/[*_>]/g, '').trim();
      currentDraft.explanation = currentDraft.explanation ? `${currentDraft.explanation}\n${note}` : note;
      state = 'IN_EXPLANATION';
      continue;
    }

    // 6. Nhận diện Lời giải thích / Ghi chú
    const explanationMatch = trimmedLine.match(/^(?:[-–—→>]\s*)?(?:\*{1,2}|_{1,2})?(?:[-–—→>]\s*)?(?:Giải thích(?:\s*\([^)]*\))?|Ghi chú(?:\s*chuyển đổi)?|Cần kiểm tra lại câu hỏi|Lưu ý|Explanation|Note)[:.]?\s*(?:\*{1,2}|_{1,2})?\s*(.*)/i);
    if (explanationMatch) {
      if (currentOption) {
        currentDraft.options.push({ ...currentOption });
        currentOption = null;
      }
      const text = explanationMatch[1].replace(/[*_]+$/g, '').trim();
      currentDraft.explanation = currentDraft.explanation ? `${currentDraft.explanation}\n${text}` : text;
      state = 'IN_EXPLANATION';
      continue;
    }

    // 7. Xử lý dòng nhiều đoạn (Multi-line continuation)
    if (trimmedLine.length > 0) {
      if (state === 'IN_QUESTION') {
        currentDraft.questionText += (currentDraft.questionText ? ' ' : '') + trimmedLine;
      } else if (state === 'IN_OPTIONS' && currentOption) {
        currentOption.text += ' ' + trimmedLine;
      } else if (state === 'IN_EXPLANATION') {
        const cleanLine = trimmedLine.replace(/^[>*\s]+/, '').replace(/[*_]+$/g, '').trim();
        if (cleanLine) {
          currentDraft.explanation = (currentDraft.explanation ? currentDraft.explanation + ' ' : '') + cleanLine;
        }
      }
    }
  }

  // Finalize câu cuối cùng
  if (currentDraft) {
    finalizeDraft(lines.length);
  }

  return {
    drafts,
    issues: allIssues,
    sourceFormat: 'markdown',
  };
}
