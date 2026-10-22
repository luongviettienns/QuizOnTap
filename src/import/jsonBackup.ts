import { quizSetRepo, questionRepo } from '../db/repositories';
import { quizDb } from '../db/quizDb';
import type { QuizSet, Question } from '../domain/contracts';
import { validateQuestion, validateQuizSet } from '../domain/schemas';

export interface QuizSetBackupData {
  schemaVersion: 2;
  exportedAt: number;
  set: QuizSet;
  questions: Question[];
}

/**
 * Trích xuất toàn bộ bộ đề và danh sách câu hỏi ra chuỗi JSON format
 */
export async function exportQuizSetToJson(setId: string): Promise<string> {
  const set = await quizSetRepo.getById(setId);
  if (!set) {
    throw new Error(`QuizSet with ID ${setId} not found`);
  }

  const questions = await questionRepo.listBySet(setId);

  const backupData: QuizSetBackupData = {
    schemaVersion: 2,
    exportedAt: Date.now(),
    set,
    questions,
  };

  return JSON.stringify(backupData, null, 2);
}

/**
 * Khôi phục hoặc nhập bộ đề từ chuỗi JSON backup
 */
export async function importJsonBackup(jsonString: string): Promise<{ set: QuizSet; questionCount: number }> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonString);
  } catch {
    throw new Error('Dữ liệu JSON không hợp lệ, không thể phân tích cú pháp');
  }

  const backup = parsed as Partial<QuizSetBackupData>;
  if (!backup.set || !backup.questions) {
    throw new Error('Định dạng sao lưu JSON không đúng chuẩn QuizOnTap');
  }

  // Validate set and questions
  const validatedSet = validateQuizSet(backup.set);
  const validatedQuestions: Question[] = [];

  for (const q of backup.questions) {
    validatedQuestions.push(validateQuestion(q));
  }

  // Ghi atomically vào Dexie
  await quizDb.transaction('rw', [quizDb.quizSets, quizDb.questions], async () => {
    // Nếu set đã tồn tại thì cập nhật, nếu chưa thì thêm mới
    await quizDb.quizSets.put(validatedSet);
    // Xóa câu hỏi cũ của set này trước khi nạp lại
    await quizDb.questions.where('setId').equals(validatedSet.id).delete();
    if (validatedQuestions.length > 0) {
      await quizDb.questions.bulkAdd(validatedQuestions);
    }
  });

  return {
    set: validatedSet,
    questionCount: validatedQuestions.length,
  };
}
