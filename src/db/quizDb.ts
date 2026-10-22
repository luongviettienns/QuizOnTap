import Dexie, { type Table } from 'dexie';
import type {
  QuizSet,
  Question,
  QuizSession,
  ExamResult,
  StudyProgress,
  AnswerAttempt,
} from '../domain/contracts';

export interface ImportLog {
  id: string;
  setId: string;
  importedAt: number;
  totalParsed: number;
  verifiedCount: number;
  missingCount: number;
  sourceHash?: string;
}

export interface AppMetadataRecord {
  key: string;
  value: unknown;
  updatedAt: number;
}

export class QuizDatabase extends Dexie {
  quizSets!: Table<QuizSet, string>;
  questions!: Table<Question, string>;
  sessions!: Table<QuizSession, string>;
  results!: Table<ExamResult, string>;
  importLogs!: Table<ImportLog, string>;
  studyProgress!: Table<StudyProgress, string>;
  answerAttempts!: Table<AnswerAttempt, string>;
  appMetadata!: Table<AppMetadataRecord, string>;

  constructor() {
    super('QuizOnTapDB');

    // Schema version 2 (Legacy)
    this.version(2).stores({
      quizSets: 'id, updatedAt, createdAt',
      questions: 'id, setId, chapterId, answerStatus, updatedAt, [setId+chapterId]',
      sessions: 'id, setId, status, startedAt, mode',
      results: 'sessionId, setId, submittedAt',
      importLogs: 'id, setId, importedAt',
    });

    // Schema version 3 (Focused 178 Study Engine)
    this.version(3).stores({
      quizSets: 'id, updatedAt, createdAt',
      questions: 'id, setId, chapterId, answerStatus, updatedAt, [setId+chapterId]',
      sessions: 'id, setId, status, startedAt, mode',
      results: 'sessionId, setId, submittedAt',
      importLogs: 'id, setId, importedAt',
      studyProgress: 'sessionId, setId, status, phase, contentVersion, startedAt, completedAt',
      answerAttempts: 'id, sessionId, questionId, phase, correct, createdAt',
      appMetadata: 'key, updatedAt',
    });
  }
}

export const quizDb = new QuizDatabase();
