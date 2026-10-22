import { describe, it, expect } from 'vitest';
import {
  createStudySession,
  applyStudyAnswer,
  advanceStudyNext,
  calculateStudyResult,
} from '../studyEngine';
import type { Question } from '../contracts';

describe('StudyEngine Domain Logic (5-Wrong Remediation & 178 Mastery)', () => {
  const dummyQuestions: Question[] = Array.from({ length: 178 }, (_, i) => ({
    id: `q_${i + 1}`,
    setId: 'set_kinh_te_va_moi_truong',
    kind: 'single',
    text: `Câu hỏi ${i + 1}`,
    options: [
      { id: `opt_${i + 1}_a`, text: 'Đáp án A' },
      { id: `opt_${i + 1}_b`, text: 'Đáp án B' },
    ],
    correctOptionIds: [`opt_${i + 1}_a`],
    answerStatus: 'verified',
    answerOrigin: 'source',
    chapterId: `Chương ${(i % 6) + 1}`,
    tags: [`Chương ${(i % 6) + 1}`],
    createdAt: 1000,
    updatedAt: 1000,
  }));

  it('initializes a fresh study session with 178 ordered questions', () => {
    const session = createStudySession('test_session', 'set_kinh_te_va_moi_truong', dummyQuestions, 12345);
    expect(session.sessionId).toBe('test_session');
    expect(session.phase).toBe('MAIN');
    expect(session.questionOrder.length).toBe(178);
    expect(session.mainCursor).toBe(0);
    expect(session.masteredIds.length).toBe(0);
    expect(session.pendingWrongIds.length).toBe(0);
  });

  it('marks question mastered when answered correctly on first pass', () => {
    const session = createStudySession('test_session', 'set_kinh_te_va_moi_truong', dummyQuestions, 12345);
    const q1Id = session.questionOrder[0];

    const { updatedSession, attempt } = applyStudyAnswer(session, q1Id, [`opt_${q1Id.replace('q_', '')}_a`], dummyQuestions);

    expect(attempt.correct).toBe(true);
    expect(attempt.phase).toBe('MAIN');
    expect(updatedSession.masteredIds).toContain(q1Id);
    expect(updatedSession.pendingWrongIds.length).toBe(0);

    const advanced = advanceStudyNext(updatedSession);
    expect(advanced.mainCursor).toBe(1);
    expect(advanced.phase).toBe('MAIN');
  });

  it('accumulates wrong questions and triggers REMEDIATION batch when reaching 5 unique wrongs', () => {
    let session = createStudySession('test_session', 'set_kinh_te_va_moi_truong', dummyQuestions, 12345);

    // Answer first 4 questions incorrectly
    for (let i = 0; i < 4; i++) {
      const qId = session.questionOrder[session.mainCursor];
      const { updatedSession } = applyStudyAnswer(session, qId, ['wrong_opt'], dummyQuestions);
      session = advanceStudyNext(updatedSession);
      expect(session.phase).toBe('MAIN');
      expect(session.pendingWrongIds.length).toBe(i + 1);
    }

    // Answer 5th question incorrectly -> should trigger REMEDIATION on advance
    const q5Id = session.questionOrder[session.mainCursor];
    const { updatedSession } = applyStudyAnswer(session, q5Id, ['wrong_opt'], dummyQuestions);
    expect(updatedSession.pendingWrongIds.length).toBe(5);

    session = advanceStudyNext(updatedSession);
    expect(session.phase).toBe('REMEDIATION');
    expect(session.remediationIds.length).toBe(5);
    expect(session.remediationCursor).toBe(0);
    expect(session.remediationRound).toBe(1);
    expect(session.pendingWrongIds.length).toBe(0);
    expect(session.reviewBatchCount).toBe(1);
  });

  it('handles multi-round remediation until all 5 questions are resolved', () => {
    let session = createStudySession('test_session', 'set_kinh_te_va_moi_truong', dummyQuestions, 12345);

    // Answer 5 questions wrong to enter remediation
    for (let i = 0; i < 5; i++) {
      const qId = session.questionOrder[session.mainCursor];
      const { updatedSession } = applyStudyAnswer(session, qId, ['wrong_opt'], dummyQuestions);
      session = advanceStudyNext(updatedSession);
    }
    expect(session.phase).toBe('REMEDIATION');

    // Round 1: answer 3 correct, 2 wrong
    for (let i = 0; i < 5; i++) {
      const qId = session.remediationIds[session.remediationCursor];
      const correctOpt = `opt_${qId.replace('q_', '')}_a`;
      // Questions 0, 1, 2 correct, 3 and 4 wrong
      const selected = i < 3 ? [correctOpt] : ['wrong_opt'];
      const { updatedSession } = applyStudyAnswer(session, qId, selected, dummyQuestions);
      session = advanceStudyNext(updatedSession);
    }

    // After round 1 ends, round 2 must start with the 2 unresolved questions
    expect(session.phase).toBe('REMEDIATION');
    expect(session.remediationRound).toBe(2);
    expect(session.remediationIds.length).toBe(2);
    expect(session.remediationCursor).toBe(0);

    // Round 2: answer both correct
    for (let i = 0; i < 2; i++) {
      const qId = session.remediationIds[session.remediationCursor];
      const correctOpt = `opt_${qId.replace('q_', '')}_a`;
      const { updatedSession } = applyStudyAnswer(session, qId, [correctOpt], dummyQuestions);
      session = advanceStudyNext(updatedSession);
    }

    // Now remediation is clean! Should return to MAIN at index 5
    expect(session.phase).toBe('MAIN');
    expect(session.mainCursor).toBe(5);
  });

  it('creates tail batch for leftover 1-4 wrong questions at the end of 178 questions', () => {
    let session = createStudySession('test_session', 'set_kinh_te_va_moi_truong', dummyQuestions, 12345);

    // Answer 176 correctly, 2 incorrectly
    for (let i = 0; i < 178; i++) {
      const qId = session.questionOrder[session.mainCursor];
      const correctOpt = `opt_${qId.replace('q_', '')}_a`;
      const selected = i === 10 || i === 20 ? ['wrong_opt'] : [correctOpt];
      const { updatedSession } = applyStudyAnswer(session, qId, selected, dummyQuestions);
      session = advanceStudyNext(updatedSession);
    }

    // At the end of question 178, because 2 questions were wrong, it must trigger tail batch
    expect(session.phase).toBe('REMEDIATION');
    expect(session.remediationIds.length).toBe(2);
    expect(session.mainCursor).toBe(178);

    // Resolve the tail batch
    for (let i = 0; i < 2; i++) {
      const qId = session.remediationIds[session.remediationCursor];
      const correctOpt = `opt_${qId.replace('q_', '')}_a`;
      const { updatedSession } = applyStudyAnswer(session, qId, [correctOpt], dummyQuestions);
      session = advanceStudyNext(updatedSession);
    }

    // Now all 178 questions are mastered -> COMPLETED
    expect(session.phase).toBe('COMPLETED');
    expect(session.status).toBe('completed');
    expect(session.masteredIds.length).toBe(178);
  });

  it('allows completion directly if all 178 are answered correctly on first pass', () => {
    let session = createStudySession('test_session', 'set_kinh_te_va_moi_truong', dummyQuestions, 12345);

    for (let i = 0; i < 178; i++) {
      const qId = session.questionOrder[session.mainCursor];
      const correctOpt = `opt_${qId.replace('q_', '')}_a`;
      const { updatedSession } = applyStudyAnswer(session, qId, [correctOpt], dummyQuestions);
      session = advanceStudyNext(updatedSession);
    }

    expect(session.phase).toBe('COMPLETED');
    expect(session.status).toBe('completed');
    expect(session.masteredIds.length).toBe(178);
    expect(session.reviewBatchCount).toBe(0);
  });

  it('calculates comprehensive study results auditably from attempts', () => {
    let session = createStudySession('test_session', 'set_kinh_te_va_moi_truong', dummyQuestions, 12345);
    const attempts = [];

    // Question 1 correct, Question 2 wrong then correct
    const q1 = session.questionOrder[0];
    const r1 = applyStudyAnswer(session, q1, [`opt_${q1.replace('q_', '')}_a`], dummyQuestions);
    session = advanceStudyNext(r1.updatedSession);
    attempts.push(r1.attempt);

    const q2 = session.questionOrder[1];
    const r2 = applyStudyAnswer(session, q2, ['wrong_opt'], dummyQuestions);
    session = advanceStudyNext(r2.updatedSession);
    attempts.push(r2.attempt);

    // In a tail/remediation run, answer q2 correctly
    const r3 = applyStudyAnswer(session, q2, [`opt_${q2.replace('q_', '')}_a`], dummyQuestions);
    attempts.push(r3.attempt);

    session.masteredIds = [q1, q2];
    session.phase = 'COMPLETED';
    session.status = 'completed';

    const result = calculateStudyResult(session, attempts, dummyQuestions);
    expect(result.firstPassCorrectCount).toBe(1);
    expect(result.firstPassWrongCount).toBe(1);
    expect(result.totalAttempts).toBe(3);
    expect(result.correctAttempts).toBe(2);
    expect(result.wrongAttempts).toBe(1);
    expect(result.uniqueEverWrongCount).toBe(1);
  });
});
