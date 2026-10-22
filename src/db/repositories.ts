import { quizDb } from './quizDb';
import type { QuizSet, Question, QuizSession, ExamResult } from '../domain/contracts';

function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'id_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
}

export const quizSetRepo = {
  async create(data: { title: string; description?: string }): Promise<QuizSet> {
    const now = Date.now();
    const newSet: QuizSet = {
      id: generateId(),
      title: data.title,
      description: data.description,
      schemaVersion: 2,
      createdAt: now,
      updatedAt: now,
    };
    await quizDb.quizSets.add(newSet);
    return newSet;
  },

  async getById(id: string): Promise<QuizSet | undefined> {
    return await quizDb.quizSets.get(id);
  },

  async listAll(): Promise<QuizSet[]> {
    return await quizDb.quizSets.orderBy('updatedAt').reverse().toArray();
  },

  async update(id: string, updates: Partial<QuizSet>): Promise<void> {
    await quizDb.quizSets.update(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },

  async delete(id: string): Promise<void> {
    await quizDb.transaction('rw', [quizDb.quizSets, quizDb.questions, quizDb.sessions, quizDb.results], async () => {
      await quizDb.questions.where('setId').equals(id).delete();
      await quizDb.sessions.where('setId').equals(id).delete();
      await quizDb.results.where('setId').equals(id).delete();
      await quizDb.quizSets.delete(id);
    });
  },
};

export const questionRepo = {
  async create(question: Question): Promise<void> {
    await quizDb.questions.add(question);
    await quizSetRepo.update(question.setId, {});
  },

  async batchCreate(questions: Question[]): Promise<void> {
    if (questions.length === 0) return;
    await quizDb.transaction('rw', [quizDb.questions, quizDb.quizSets], async () => {
      await quizDb.questions.bulkAdd(questions);
      const setId = questions[0].setId;
      await quizDb.quizSets.update(setId, { updatedAt: Date.now() });
    });
  },

  async getById(id: string): Promise<Question | undefined> {
    return await quizDb.questions.get(id);
  },

  async listBySet(setId: string): Promise<Question[]> {
    return await quizDb.questions.where('setId').equals(setId).toArray();
  },

  async listByChapter(setId: string, chapterId: string): Promise<Question[]> {
    return await quizDb.questions
      .where('[setId+chapterId]')
      .equals([setId, chapterId])
      .toArray();
  },

  async countBySet(setId: string): Promise<number> {
    return await quizDb.questions.where('setId').equals(setId).count();
  },

  async update(id: string, updates: Partial<Question>): Promise<void> {
    await quizDb.questions.update(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },

  async delete(id: string): Promise<void> {
    await quizDb.questions.delete(id);
  },
};

export const sessionRepo = {
  async create(session: QuizSession): Promise<QuizSession> {
    await quizDb.sessions.add(session);
    return session;
  },

  async getById(id: string): Promise<QuizSession | undefined> {
    return await quizDb.sessions.get(id);
  },

  async updateAnswer(sessionId: string, questionId: string, optionIds: string[]): Promise<void> {
    const session = await quizDb.sessions.get(sessionId);
    if (!session) return;

    const answers = { ...session.answersByQuestion, [questionId]: optionIds };
    await quizDb.sessions.update(sessionId, { answersByQuestion: answers });
  },

  async toggleFlag(sessionId: string, questionId: string): Promise<void> {
    const session = await quizDb.sessions.get(sessionId);
    if (!session) return;

    const flags = new Set(session.flaggedQuestionIds);
    if (flags.has(questionId)) {
      flags.delete(questionId);
    } else {
      flags.add(questionId);
    }
    await quizDb.sessions.update(sessionId, { flaggedQuestionIds: Array.from(flags) });
  },

  async submitSession(sessionId: string): Promise<void> {
    await quizDb.sessions.update(sessionId, {
      status: 'submitted',
      submittedAt: Date.now(),
    });
  },
};

export const resultRepo = {
  async save(result: ExamResult): Promise<ExamResult> {
    await quizDb.results.put(result);
    return result;
  },

  async getBySessionId(sessionId: string): Promise<ExamResult | undefined> {
    return await quizDb.results.get(sessionId);
  },

  async listBySet(setId: string): Promise<ExamResult[]> {
    return await quizDb.results.where('setId').equals(setId).reverse().sortBy('submittedAt');
  },
};
