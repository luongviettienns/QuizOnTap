import Dexie, { type Table } from 'dexie';
import type { QuizSet, Question, QuizSession, ExamResult } from '../domain/contracts';

export interface ImportLog {
  id: string;
  setId: string;
  importedAt: number;
  totalParsed: number;
  verifiedCount: number;
  missingCount: number;
  sourceHash?: string;
}

export class QuizDatabase extends Dexie {
  quizSets!: Table<QuizSet, string>;
  questions!: Table<Question, string>;
  sessions!: Table<QuizSession, string>;
  results!: Table<ExamResult, string>;
  importLogs!: Table<ImportLog, string>;

  constructor() {
    super('QuizOnTapDB');

    // Schema version 2
    this.version(2).stores({
      quizSets: 'id, updatedAt, createdAt',
      questions: 'id, setId, chapterId, answerStatus, updatedAt, [setId+chapterId]',
      sessions: 'id, setId, status, startedAt, mode',
      results: 'sessionId, setId, submittedAt',
      importLogs: 'id, setId, importedAt',
    });
  }
}

export const quizDb = new QuizDatabase();
