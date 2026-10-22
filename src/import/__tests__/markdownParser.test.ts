import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { parseDocument } from '../markdownParser';

describe('Smart State Machine Parser', () => {
  it('correctly parses the 179-question real fixture into 6 chapters and expected counts', () => {
    const fixturePath = path.resolve(__dirname, '../../test/fixtures/real-179-questions.md');
    const content = fs.readFileSync(fixturePath, 'utf-8');
    const result = parseDocument(content);

    expect(result.drafts.length).toBe(179);

    // 104 câu có đáp án, 75 câu thiếu đáp án
    const verifiedCount = result.drafts.filter((d) => d.detectedKeys.length > 0).length;
    const missingCount = result.drafts.filter((d) => d.detectedKeys.length === 0).length;

    expect(verifiedCount).toBe(104);
    expect(missingCount).toBe(75);

    // Kiểm tra câu số 17 Chương 2 có cảnh báo nhắc hình vẽ
    const q17Ch2 = result.drafts.find((d) => d.chapter?.includes('Chương 2') && d.questionText.includes('PPF'));
    expect(q17Ch2).toBeDefined();

    // Kiểm tra câu số 30 Chương 5 chỉ có 3 lựa chọn
    const q30Ch5 = result.drafts.find((d) => d.chapter?.includes('Chương 5') && d.options.length === 3);
    expect(q30Ch5).toBeDefined();
  });

  it('handles multi-line text and messy inputs cleanly', () => {
    const raw = `
## Chương 1: Test Đơn Giản
Câu 1: Câu hỏi nhiều dòng
dòng thứ hai của câu hỏi?
A. Lựa chọn 1
nhiều dòng ở đáp án
B. Lựa chọn 2
Đáp án: A
Giải thích: Giải thích chi tiết
    `;
    const result = parseDocument(raw);
    expect(result.drafts.length).toBe(1);
    expect(result.drafts[0].questionText).toContain('dòng thứ hai của câu hỏi?');
    expect(result.drafts[0].options[0].text).toContain('nhiều dòng ở đáp án');
    expect(result.drafts[0].detectedKeys).toEqual(['A']);
    expect(result.drafts[0].explanation).toBe('Giải thích chi tiết');
  });

  it('correctly parses the supplemented document (Tai_lieu_on_tap_Kinh_te_hoc_va_Moi_truong_DA_Bo_sung.md)', () => {
    const filePath = path.resolve(__dirname, '../../../Tai_lieu_on_tap_Kinh_te_hoc_va_Moi_truong_DA_Bo_sung.md');
    const content = fs.readFileSync(filePath, 'utf-8');
    const result = parseDocument(content);

    expect(result.drafts.length).toBe(179);

    const withAnswers = result.drafts.filter((d) => d.detectedKeys.length > 0);
    const withoutAnswers = result.drafts.filter((d) => d.detectedKeys.length === 0);

    // 178 câu có đáp án, 1 câu duy nhất (Chương 2, Câu 17) thiếu hình vẽ
    expect(withAnswers.length).toBe(178);
    expect(withoutAnswers.length).toBe(1);

    const q17 = withoutAnswers[0];
    expect(q17.chapter).toContain('Chương 2');
    expect(q17.options.length).toBe(4);
    expect(q17.explanation).toContain('thiếu hình vẽ');
  });
});

