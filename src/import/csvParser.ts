import type { QuestionDraft, ParseResult, ParseIssue } from './types';
import { validateDraft } from './validator';

/**
 * Split CSV line handling quotes and commas inside quotes
 */
function parseCsvLine(text: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}

export function parseCsv(csvContent: string): ParseResult {
  const lines = csvContent.replace(/\r\n/g, '\n').split('\n').filter(l => l.trim().length > 0);
  if (lines.length === 0) {
    return { drafts: [], issues: [], sourceFormat: 'csv' };
  }

  // Parse header
  const headers = parseCsvLine(lines[0]).map(h => h.toLowerCase());
  
  // Find column indices
  const questionIdx = headers.findIndex(h => h.includes('câu hỏi') || h.includes('question'));
  const optAIdx = headers.findIndex(h => h === 'a' || h.includes('lựa chọn a') || h.includes('option a'));
  const optBIdx = headers.findIndex(h => h === 'b' || h.includes('lựa chọn b') || h.includes('option b'));
  const optCIdx = headers.findIndex(h => h === 'c' || h.includes('lựa chọn c') || h.includes('option c'));
  const optDIdx = headers.findIndex(h => h === 'd' || h.includes('lựa chọn d') || h.includes('option d'));
  const answerIdx = headers.findIndex(h => h.includes('đáp án') || h.includes('answer') || h.includes('key'));
  const explIdx = headers.findIndex(h => h.includes('giải thích') || h.includes('explanation'));
  const chapterIdx = headers.findIndex(h => h.includes('chương') || h.includes('chủ đề') || h.includes('category') || h.includes('chapter'));

  const drafts: QuestionDraft[] = [];
  const allIssues: ParseIssue[] = [];

  for (let i = 1; i < lines.length; i++) {
    const lineNum = i + 1;
    const cols = parseCsvLine(lines[i]);
    if (cols.length === 0 || cols.every(c => c.length === 0)) continue;

    const questionText = questionIdx >= 0 && cols[questionIdx] ? cols[questionIdx] : cols[0] || '';
    if (!questionText) continue;

    const options: { label: string; text: string }[] = [];
    if (optAIdx >= 0 && cols[optAIdx]) options.push({ label: 'A', text: cols[optAIdx] });
    if (optBIdx >= 0 && cols[optBIdx]) options.push({ label: 'B', text: cols[optBIdx] });
    if (optCIdx >= 0 && cols[optCIdx]) options.push({ label: 'C', text: cols[optCIdx] });
    if (optDIdx >= 0 && cols[optDIdx]) options.push({ label: 'D', text: cols[optDIdx] });

    // Fallback nếu không có header A/B/C/D cụ thể
    if (options.length === 0 && cols.length >= 3) {
      const labels = ['A', 'B', 'C', 'D'];
      for (let j = 1; j <= Math.min(4, cols.length - 1); j++) {
        if (cols[j] && j !== answerIdx && j !== explIdx && j !== chapterIdx) {
          options.push({ label: labels[options.length], text: cols[j] });
        }
      }
    }

    const rawKey = answerIdx >= 0 && cols[answerIdx] ? cols[answerIdx].trim() : '';
    const detectedKeys = rawKey ? rawKey.split(/[,;\s]+/).map(k => k.toUpperCase()) : [];
    const explanation = explIdx >= 0 && cols[explIdx] ? cols[explIdx].trim() : undefined;
    const chapter = chapterIdx >= 0 && cols[chapterIdx] ? cols[chapterIdx].trim() : undefined;

    const draft: QuestionDraft = {
      tempId: `csv_draft_${drafts.length + 1}_${lineNum}`,
      rawText: lines[i],
      questionText,
      options,
      detectedKeys,
      explanation,
      chapter,
      sourceLineStart: lineNum,
      sourceLineEnd: lineNum,
      issues: [],
    };

    const issues = validateDraft(draft);
    draft.issues = issues;
    allIssues.push(...issues);
    drafts.push(draft);
  }

  return {
    drafts,
    issues: allIssues,
    sourceFormat: 'csv',
  };
}

/**
 * Xuất QuizSet sang file CSV tương thích Excel tiếng Việt (UTF-8 có BOM)
 */
export function exportQuestionsToCsv(questions: { text: string; options: { label: string; text: string }[]; detectedKeys?: string[]; explanation?: string; chapter?: string }[]): string {
  const BOM = '\uFEFF';
  const headers = ['Câu hỏi', 'Lựa chọn A', 'Lựa chọn B', 'Lựa chọn C', 'Lựa chọn D', 'Đáp án', 'Giải thích', 'Chương'];
  
  const escapeCell = (val?: string) => {
    if (!val) return '""';
    // Phòng chống CSV Formula Injection (=, +, -, @)
    let safe = val;
    if (/^[=+\-@]/.test(safe)) {
      safe = `'` + safe;
    }
    return `"${safe.replace(/"/g, '""')}"`;
  };

  const rows = [headers.join(',')];
  for (const q of questions) {
    const optMap: Record<string, string> = {};
    for (const opt of q.options) {
      optMap[opt.label.toUpperCase()] = opt.text;
    }

    const row = [
      escapeCell(q.text),
      escapeCell(optMap['A'] || ''),
      escapeCell(optMap['B'] || ''),
      escapeCell(optMap['C'] || ''),
      escapeCell(optMap['D'] || ''),
      escapeCell(q.detectedKeys ? q.detectedKeys.join(', ') : ''),
      escapeCell(q.explanation || ''),
      escapeCell(q.chapter || ''),
    ];
    rows.push(row.join(','));
  }

  return BOM + rows.join('\r\n');
}
