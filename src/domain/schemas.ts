import { z } from 'zod';
import type { Question, QuizSet, Option, QuizSession } from './contracts';

export const OptionSchema = z.object({
  id: z.string().min(1, 'Option ID must not be empty'),
  text: z.string().min(1, 'Option text must not be empty'),
});

export const SourceRefSchema = z.object({
  filename: z.string().optional(),
  chapter: z.string().optional(),
  questionNumber: z.number().optional(),
  lineStart: z.number().optional(),
  lineEnd: z.number().optional(),
  sourceHash: z.string().optional(),
  warnings: z.array(z.string()).optional(),
}).optional();

export const QuestionSchema = z.object({
  id: z.string().min(1),
  setId: z.string().min(1),
  kind: z.enum(['single', 'multiple']),
  text: z.string().min(1, 'Question text is required'),
  options: z.array(OptionSchema).min(1, 'Question must have at least one option'),
  correctOptionIds: z.array(z.string()).nullable(),
  answerStatus: z.enum(['missing', 'suggested', 'verified']),
  answerOrigin: z.enum(['source', 'manual', 'ai-suggestion']).nullable(),
  explanation: z.string().optional(),
  chapterId: z.string().optional(),
  tags: z.array(z.string()),
  source: SourceRefSchema,
  createdAt: z.number(),
  updatedAt: z.number(),
}).superRefine((data, ctx) => {
  // Ràng buộc 1: Nếu verified hoặc suggested -> correctOptionIds không được null hoặc rỗng
  if (data.answerStatus === 'verified' || data.answerStatus === 'suggested') {
    if (!data.correctOptionIds || data.correctOptionIds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Questions with verified or suggested answers must have non-empty correctOptionIds',
        path: ['correctOptionIds'],
      });
    } else {
      // Mọi ID trong correctOptionIds phải tồn tại trong options
      const optionIdSet = new Set(data.options.map((o: Option) => o.id));
      for (const id of data.correctOptionIds) {
        if (!optionIdSet.has(id)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `correctOptionId "${id}" not found in options`,
            path: ['correctOptionIds'],
          });
        }
      }
    }
  }

  // Ràng buộc 2: Nếu missing -> correctOptionIds bắt buộc là null
  if (data.answerStatus === 'missing') {
    if (data.correctOptionIds !== null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Questions with missing answer must have correctOptionIds as null',
        path: ['correctOptionIds'],
      });
    }
  }

  // Ràng buộc 3: single question chỉ có tối đa 1 correctOptionId nếu verified hoặc suggested
  if (data.kind === 'single' && (data.answerStatus === 'verified' || data.answerStatus === 'suggested') && data.correctOptionIds) {
    if (data.correctOptionIds.length > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Single choice question cannot have more than 1 correct option',
        path: ['correctOptionIds'],
      });
    }
  }
});

export const QuizSetSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  schemaVersion: z.literal(2),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export const QuizSessionSchema = z.object({
  id: z.string().min(1),
  setId: z.string().min(1),
  mode: z.enum(['practice', 'exam', 'mistakes', 'flashcard']),
  status: z.enum(['in-progress', 'submitted', 'expired', 'abandoned']),
  questionIds: z.array(z.string()),
  optionOrderByQuestion: z.record(z.array(z.string())),
  answersByQuestion: z.record(z.array(z.string())),
  flaggedQuestionIds: z.array(z.string()),
  startedAt: z.number(),
  deadlineAt: z.number().nullable(),
  submittedAt: z.number().nullable(),
  questionSnapshotVersion: z.number(),
});

/**
 * Validate a Question object against the schema and throw detailed Error on violation
 */
export function validateQuestion(question: unknown): Question {
  return QuestionSchema.parse(question) as Question;
}

/**
 * Validate a QuizSet object
 */
export function validateQuizSet(set: unknown): QuizSet {
  return QuizSetSchema.parse(set) as QuizSet;
}

/**
 * Validate a QuizSession object
 */
export function validateQuizSession(session: unknown): QuizSession {
  return QuizSessionSchema.parse(session) as QuizSession;
}
