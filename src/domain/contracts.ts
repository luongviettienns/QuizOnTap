/**
 * Core Data Contracts V2 — QuizOnTap
 * Strict, pure TypeScript types. Independent of React, DOM, or database drivers.
 */

export type QuestionKind = 'single' | 'multiple';
export type AnswerStatus = 'missing' | 'suggested' | 'verified';
export type AnswerOrigin = 'source' | 'manual' | 'ai-suggestion' | null;
export type SessionMode = 'practice' | 'exam' | 'mistakes' | 'flashcard';

export interface Option {
  id: string;           // UUID bền vững; KHÔNG dùng chữ cái A/B/C/D làm ID
  text: string;         // Nội dung phương án (hỗ trợ Markdown)
}

export interface SourceRef {
  filename?: string;
  chapter?: string;
  questionNumber?: number;
  lineStart?: number;
  lineEnd?: number;
  sourceHash?: string;
  warnings?: string[];
}

export interface Question {
  id: string;                           // UUID
  setId: string;                        // ID bộ đề sở hữu
  kind: QuestionKind;                   // 'single' | 'multiple'
  text: string;                         // Nội dung câu hỏi
  options: Option[];                    // Danh sách phương án lựa chọn
  correctOptionIds: string[] | null;    // null nếu answerStatus === 'missing'
  answerStatus: AnswerStatus;           // 'missing' | 'suggested' | 'verified'
  answerOrigin: AnswerOrigin;           // Nguồn gốc đáp án
  explanation?: string;                 // Lời giải thích / căn cứ
  chapterId?: string;                   // ID chương / chủ đề
  tags: string[];                       // Nhãn phân loại
  source?: SourceRef;                   // Truy vết dòng và nguồn nhập
  createdAt: number;                    // Epoch ms
  updatedAt: number;                    // Epoch ms
}

export interface QuizSet {
  id: string;                           // UUID
  title: string;                        // Tên bộ đề
  description?: string;                 // Mô tả
  schemaVersion: 2;                     // Định danh version hợp đồng
  createdAt: number;                    // Epoch ms
  updatedAt: number;                    // Epoch ms
}

export interface QuizSession {
  id: string;                                     // UUID phiên làm bài
  setId: string;                                  // Thuộc bộ đề nào
  mode: SessionMode;                              // 'practice' | 'exam' | 'mistakes' | 'flashcard'
  status: 'in-progress' | 'submitted' | 'expired' | 'abandoned';
  questionIds: string[];                          // Thứ tự câu hỏi đã snapshot
  optionOrderByQuestion: Record<string, string[]>; // Thứ tự hiển thị phương án theo câu
  answersByQuestion: Record<string, string[]>;    // Lựa chọn của người dùng (Option UUIDs)
  flaggedQuestionIds: string[];                   // Các câu có gắn cờ 🚩
  startedAt: number;                              // Thời điểm bắt đầu
  deadlineAt: number | null;                      // Hạn nộp bài (Exam)
  submittedAt: number | null;                     // Thời điểm nộp bài
  questionSnapshotVersion: number;
}

export interface ExamResult {
  sessionId: string;
  correct: number;
  incorrect: number;
  unanswered: number;
  unscored: number;                     // Số câu bỏ qua chấm do thiếu verified answer
  scoredCount: number;                  // Tổng số câu đủ điều kiện tính điểm = correct + incorrect + unanswered
  attemptedScoredCount: number;         // Số câu có làm bài = correct + incorrect
  accuracyAmongAnswered: number | null; // correct / attemptedScoredCount * 100
  percent: number | null;               // correct / scoredCount * 100 (null nếu scoredCount === 0)
  chapterStats: Record<string, { correct: number; scored: number }>;
}

export interface ParseIssue {
  code: string;
  severity: 'error' | 'warning' | 'info';
  lineStart: number;
  lineEnd?: number;
  questionDraftId?: string;
  message: string;
  fixSuggestion?: string;
}

export interface QuestionDraft {
  tempId: string;
  rawText: string;
  questionText: string;
  options: { label: string; text: string }[];
  detectedKeys: string[];
  explanation?: string;
  chapter?: string;
  sourceLineStart: number;
  sourceLineEnd: number;
  issues: ParseIssue[];
}

export interface ParseResult {
  drafts: QuestionDraft[];
  issues: ParseIssue[];
  sourceFormat: 'markdown' | 'txt' | 'json' | 'csv' | 'xlsx';
}
