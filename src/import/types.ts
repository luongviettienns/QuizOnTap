import type { ParseIssue, QuestionDraft, ParseResult } from '../domain/contracts';

export type { ParseIssue, QuestionDraft, ParseResult };

export interface ParserOptions {
  defaultChapter?: string;
  sourceFilename?: string;
}
