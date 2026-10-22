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
  schemaVersion: number;                // Định danh version hợp đồng (v2 hoặc v3)
  createdAt: number;                    // Epoch ms
  updatedAt: number;                    // Epoch ms
}

export type StudyPhase = 'MAIN' | 'REMEDIATION' | 'COMPLETED' | 'ABANDONED';

export interface StudyProgress {
  sessionId: string;
  setId: string;
  contentVersion: number;
  status: 'in-progress' | 'completed' | 'abandoned';
  phase: StudyPhase;
  questionOrder: string[];               // Đúng 178 ID câu hỏi đã đảo cố định
  optionOrderByQuestion: Record<string, string[]>; // Thứ tự phương án cố định từng câu
  mainCursor: number;                   // Vị trí câu hỏi mới đang làm
  masteredIds: string[];                // Danh sách câu đã làm đúng (mục tiêu 178/178)
  pendingWrongIds: string[];            // Tối đa 5 câu sai trước khi chuyển sang Remediation
  remediationIds: string[];             // Danh sách câu trong lô ôn hiện tại (tối đa 5)
  remediationCursor: number;            // Vị trí câu đang làm trong lô ôn
  remediationRound: number;             // Vòng ôn tập trong lô hiện tại (1, 2, ...)
  remediationUnresolvedIds: string[];   // Các câu sai ở vòng hiện tại cần làm lại ở vòng kế
  attemptCount: number;                 // Tổng số lượt trả lời (kể cả ôn lại)
  wrongAttemptCount: number;            // Tổng số lượt trả lời sai
  reviewBatchCount: number;             // Số lô ôn tập đã kích hoạt
  startedAt: number;                    // Thời điểm bắt đầu
  completedAt: number | null;           // Thời điểm hoàn thành
  accumulatedActiveMs: number;          // Tổng thời gian thao tác
}

export interface AnswerAttempt {
  id: string;                           // UUID duy nhất (chống double-submit)
  sessionId: string;
  questionId: string;
  selectedOptionIds: string[];
  correct: boolean;
  phase: 'MAIN' | 'REMEDIATION';
  batchNo: number | null;
  createdAt: number;
}

export interface ChapterStudyStat {
  chapterId: string;
  totalQuestions: number;
  firstPassCorrect: number;
  firstPassWrong: number;
  totalAttempts: number;
  mastered: number;
}

export interface HardestQuestionStat {
  questionId: string;
  questionText: string;
  wrongCount: number;
  firstWrongOptionText?: string;
  explanation?: string;
  isSuggested: boolean;
  chapterId?: string;
}

export interface StudySessionResult {
  sessionId: string;
  totalEligible: number;                // 178
  masteredCount: number;                // 178 khi hoàn thành
  firstPassCorrectCount: number;
  firstPassWrongCount: number;
  firstPassAccuracyPercent: number;
  totalAttempts: number;
  correctAttempts: number;
  wrongAttempts: number;
  uniqueEverWrongCount: number;
  remediationBatchCount: number;
  startedAt: number;
  completedAt: number;
  durationMs: number;
  chapterStats: ChapterStudyStat[];
  hardestQuestions: HardestQuestionStat[];
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
