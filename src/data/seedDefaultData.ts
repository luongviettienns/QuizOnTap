import defaultQuizContent from './defaultQuiz.md?raw';
import { parseDocument } from '../import/markdownParser';
import { quizSetRepo } from '../db/repositories';
import { quizDb } from '../db/quizDb';
import type { Question, Option } from '../domain/contracts';

export const DEFAULT_SET_ID = 'set_kinh_te_va_moi_truong';

export async function seedDefaultQuizSet(): Promise<string> {
  // Check if already seeded and fully upgraded to 178 answered questions
  const existing = await quizSetRepo.getById(DEFAULT_SET_ID);
  if (existing) {
    const existingQuestions = await quizDb.questions.where('setId').equals(DEFAULT_SET_ID).toArray();
    const existingAnswered = existingQuestions.filter((q) => q.correctOptionIds && q.correctOptionIds.length > 0).length;
    if (existingQuestions.length === 179 && existingAnswered >= 178) {
      return DEFAULT_SET_ID;
    }
  }

  const parseResult = parseDocument(defaultQuizContent);
  const now = Date.now();

  const questions: Question[] = parseResult.drafts.map((draft, idx) => {
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

  // Atomic transaction
  await quizDb.transaction('rw', [quizDb.quizSets, quizDb.questions], async () => {
    await quizDb.quizSets.put({
      id: DEFAULT_SET_ID,
      title: 'Tài liệu ôn tập Kinh tế học và Môi trường',
      description: 'Ngân hàng 179 câu hỏi trắc nghiệm qua 6 chương (104 câu đáp án chính thức, 74 câu AI gợi ý, 1 câu thiếu hình vẽ)',
      schemaVersion: 2,
      createdAt: now,
      updatedAt: now,
    });

    await quizDb.questions.bulkPut(questions);
  });

  return DEFAULT_SET_ID;
}
