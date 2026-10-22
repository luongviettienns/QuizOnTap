import defaultQuizContent from './defaultQuiz.md?raw';
import { parseDocument } from '../import/markdownParser';
import type { Question, Option, QuizSet } from '../domain/contracts';

export const DEFAULT_SET_ID = 'set_kinh_te_va_moi_truong';
export const CANONICAL_CONTENT_VERSION = 3;
export const EXCLUDED_LEGACY_QUESTION_IDS = ['q_set_kinh_te_va_moi_truong_27'];

let cachedQuestions: Question[] | null = null;

export function getCanonicalQuestions(): Question[] {
  if (cachedQuestions) {
    return cachedQuestions;
  }

  const parseResult = parseDocument(defaultQuizContent);
  const now = Date.now();

  const allParsed: Question[] = parseResult.drafts.map((draft, idx) => {
    // Preserve 1-based index IDs: 1..26, 27 (excluded), 28..179
    const qId = `q_${DEFAULT_SET_ID}_${idx + 1}`;

    const options: Option[] = draft.options.map((opt) => ({
      id: `opt_${qId}_${opt.label.toLowerCase()}`,
      text: opt.text,
    }));

    const correctOptionIds: string[] = [];
    draft.detectedKeys.forEach((key) => {
      const foundIdx = draft.options.findIndex(
        (o) => o.label.toUpperCase() === key.toUpperCase()
      );
      if (foundIdx !== -1 && options[foundIdx]) {
        correctOptionIds.push(options[foundIdx].id);
      }
    });

    const hasKeys = correctOptionIds.length > 0;
    const isAISupplemented =
      (draft.chapter?.includes('Chương 1') ?? false) ||
      (draft.chapter?.includes('Chương 2') ?? false) ||
      (draft.chapter?.includes('Chương 3') ?? false) ||
      (draft.explanation?.includes('AI bổ sung') ?? false);

    const answerStatus = hasKeys
      ? (isAISupplemented ? ('suggested' as const) : ('verified' as const))
      : ('missing' as const);

    const answerOrigin = hasKeys
      ? (isAISupplemented ? ('ai-suggestion' as const) : ('source' as const))
      : null;

    return {
      id: qId,
      setId: DEFAULT_SET_ID,
      kind: 'single' as const,
      text: draft.questionText,
      options,
      correctOptionIds: hasKeys ? correctOptionIds : null,
      answerStatus,
      answerOrigin,
      explanation: draft.explanation || undefined,
      tags: draft.chapter ? [draft.chapter] : ['Kinh tế & Môi trường'],
      chapterId: draft.chapter || undefined,
      createdAt: now,
      updatedAt: now,
    };
  });

  // Filter out question #27 (Chương 2 - Câu 17 missing image) and any missing key questions
  cachedQuestions = allParsed.filter(
    (q) => !EXCLUDED_LEGACY_QUESTION_IDS.includes(q.id) && q.answerStatus !== 'missing'
  );

  return cachedQuestions;
}

export const CANONICAL_QUIZ_SET: QuizSet = {
  id: DEFAULT_SET_ID,
  title: 'Kinh tế học và Môi trường',
  description:
    'Bộ đề ôn tập 178 câu hỏi trắc nghiệm qua 6 chương (104 đáp án chính thức từ tài liệu, 74 đáp án AI gợi ý có giải thích chi tiết).',
  schemaVersion: CANONICAL_CONTENT_VERSION,
  createdAt: 1729600000000,
  updatedAt: Date.now(),
};
