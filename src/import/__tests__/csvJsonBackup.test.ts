import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { parseCsv } from '../csvParser';
import { exportQuizSetToJson, importJsonBackup } from '../jsonBackup';
import { quizSetRepo, questionRepo } from '../../db/repositories';
import { quizDb } from '../../db/quizDb';

describe('CSV and JSON Serializers', () => {
  beforeEach(async () => {
    await quizDb.delete();
    await quizDb.open();
  });

  it('parses structured CSV content correctly', () => {
    const csvData = `Câu hỏi,Lựa chọn A,Lựa chọn B,Lựa chọn C,Lựa chọn D,Đáp án,Giải thích,Chương
"Lạm phát là gì?","Sự tăng giá chung","Sự giảm giá chung","Không đổi","Cả A và B",A,"Định nghĩa chuẩn","Kinh tế học vĩ mô"`;
    const result = parseCsv(csvData);
    expect(result.drafts.length).toBe(1);
    expect(result.drafts[0].questionText).toBe('Lạm phát là gì?');
    expect(result.drafts[0].options.length).toBe(4);
    expect(result.drafts[0].detectedKeys).toEqual(['A']);
    expect(result.drafts[0].explanation).toBe('Định nghĩa chuẩn');
    expect(result.drafts[0].chapter).toBe('Kinh tế học vĩ mô');
  });

  it('performs JSON backup export and import roundtrip flawlessly', async () => {
    const set = await quizSetRepo.create({ title: 'Đề Thi Thử Backup', description: 'Mô tả test' });
    await questionRepo.create({
      id: 'q-backup-1',
      setId: set.id,
      kind: 'single',
      text: 'Câu hỏi backup?',
      options: [
        { id: 'opt-1', text: 'Đáp án 1' },
        { id: 'opt-2', text: 'Đáp án 2' }
      ],
      correctOptionIds: ['opt-1'],
      answerStatus: 'verified',
      answerOrigin: 'manual',
      explanation: 'Giải thích',
      tags: ['Chương 1'],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    const jsonBackupStr = await exportQuizSetToJson(set.id);
    expect(jsonBackupStr).toContain('Đề Thi Thử Backup');

    // Xóa bộ đề khỏi DB
    await quizSetRepo.delete(set.id);
    expect(await quizSetRepo.getById(set.id)).toBeUndefined();

    // Khôi phục từ backup
    const restored = await importJsonBackup(jsonBackupStr);
    expect(restored.set.title).toBe('Đề Thi Thử Backup');
    expect(restored.questionCount).toBe(1);

    const questions = await questionRepo.listBySet(restored.set.id);
    expect(questions.length).toBe(1);
    expect(questions[0].text).toBe('Câu hỏi backup?');
  });
});
