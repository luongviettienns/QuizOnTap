import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Question, StudyProgress } from '@/domain/contracts';
import { applyStudyAnswer, advanceStudyNext } from '@/domain/studyEngine';
import { quizDb } from '@/db/quizDb';
import { Card } from '@/design/components/Card';
import { Button } from '@/design/components/Button';
import { Badge } from '@/design/components/Badge';
import { AnswerFeedback } from '../practice/AnswerFeedback';
import { getOptionColor } from '@/design/optionColors';
import { playTone } from '@/gamification/audioSynth';
import { X, AlertCircle } from 'lucide-react';

interface StudySessionViewProps {
  initialSession: StudyProgress;
  allQuestions: Question[];
  onFinish: (session: StudyProgress) => void;
  onExit: () => void;
}

export function StudySessionView({
  initialSession,
  allQuestions,
  onFinish,
  onExit,
}: StudySessionViewProps) {
  const [session, setSession] = useState<StudyProgress>(initialSession);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Map questions by ID for O(1) lookup
  const questionMap = useMemo(() => {
    const map = new Map<string, Question>();
    allQuestions.forEach((q) => map.set(q.id, q));
    return map;
  }, [allQuestions]);

  // Determine current active question based on phase
  const currentQuestionId = useMemo(() => {
    if (session.phase === 'REMEDIATION') {
      return session.remediationIds[session.remediationCursor];
    }
    return session.questionOrder[session.mainCursor];
  }, [session.phase, session.remediationIds, session.remediationCursor, session.questionOrder, session.mainCursor]);

  const currentQuestion = currentQuestionId ? questionMap.get(currentQuestionId) : undefined;

  // Options shuffled deterministically according to session snapshot
  const options = useMemo(() => {
    if (!currentQuestion) return [];
    const order = session.optionOrderByQuestion[currentQuestion.id];
    if (!order) return currentQuestion.options;

    const optMap = new Map(currentQuestion.options.map((o) => [o.id, o]));
    const result: typeof currentQuestion.options = [];
    order.forEach((optId) => {
      const opt = optMap.get(optId);
      if (opt) result.push(opt);
    });
    // Fallback if missing
    currentQuestion.options.forEach((opt) => {
      if (!result.some((r) => r.id === opt.id)) result.push(opt);
    });
    return result;
  }, [currentQuestion, session.optionOrderByQuestion]);

  const isCorrect = useMemo(() => {
    if (!currentQuestion || !selectedOptionId) return null;
    return currentQuestion.correctOptionIds?.includes(selectedOptionId) ?? false;
  }, [currentQuestion, selectedOptionId]);

  // Save session state to Dexie
  const persistSession = useCallback(async (updated: StudyProgress) => {
    try {
      await quizDb.studyProgress.put(updated);
    } catch (err) {
      console.error('Lỗi khi lưu tiến trình học:', err);
    }
  }, []);

  const handleSelectOption = useCallback(
    async (optId: string) => {
      if (isAnswered || isSubmitting || !currentQuestion) return;
      setIsSubmitting(true);
      setSelectedOptionId(optId);
      setIsAnswered(true);

      const { updatedSession, attempt, isCorrect: wasCorrect } = applyStudyAnswer(
        session,
        currentQuestion.id,
        [optId],
        allQuestions
      );

      // Play sound
      if (wasCorrect) {
        playTone('correct');
      } else {
        playTone('wrong');
      }

      setSession(updatedSession);

      // Persist atomically
      try {
        await quizDb.transaction('rw', [quizDb.studyProgress, quizDb.answerAttempts], async () => {
          await quizDb.studyProgress.put(updatedSession);
          await quizDb.answerAttempts.put(attempt);
        });
      } catch (err) {
        console.error('Lỗi khi ghi attempt:', err);
      } finally {
        setIsSubmitting(false);
      }
    },
    [isAnswered, isSubmitting, currentQuestion, session, allQuestions]
  );

  const handleNext = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const advanced = advanceStudyNext(session);

    if (advanced.phase === 'REMEDIATION' && session.phase === 'MAIN') {
      playTone('alert');
    } else if (advanced.phase === 'COMPLETED') {
      playTone('victory');
    } else {
      playTone('click');
    }

    setSession(advanced);
    setSelectedOptionId(null);
    setIsAnswered(false);
    setIsSubmitting(false);

    await persistSession(advanced);

    if (advanced.phase === 'COMPLETED') {
      onFinish(advanced);
    }
  }, [isSubmitting, session, persistSession, onFinish]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (!isAnswered && options.length > 0) {
        const key = e.key.toUpperCase();
        const indexByKey: Record<string, number> = {
          '1': 0, '2': 1, '3': 2, '4': 3,
          'A': 0, 'B': 1, 'C': 2, 'D': 3,
        };

        if (key in indexByKey) {
          const idx = indexByKey[key];
          if (idx < options.length) {
            e.preventDefault();
            handleSelectOption(options[idx].id);
          }
        }
      } else if (isAnswered) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          handleNext();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswered, options, handleSelectOption, handleNext]);

  if (!currentQuestion) {
    return (
      <Card className="text-center p-8 space-y-4">
        <p className="text-slate-600 dark:text-slate-300">Không tìm thấy câu hỏi hoặc phiên học đã hoàn tất.</p>
        <Button onClick={onExit}>Trở về màn hình chính</Button>
      </Card>
    );
  }

  const isRemediation = session.phase === 'REMEDIATION';
  const totalQuestions = session.questionOrder.length;
  const mainProgressPercent = Math.round((session.mainCursor / totalQuestions) * 100);
  const masteredPercent = Math.round((session.masteredIds.length / totalQuestions) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-in fade-in duration-200">
      {/* Top Bar Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          {!isRemediation ? (
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Câu {session.mainCursor + 1} / {totalQuestions}
            </span>
          ) : (
            <span className="text-sm font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              Ôn lại câu {session.remediationCursor + 1} / {session.remediationIds.length}
            </span>
          )}

          {currentQuestion.chapterId && (
            <Badge variant="default">{currentQuestion.chapterId}</Badge>
          )}

          {currentQuestion.answerStatus === 'verified' ? (
            <Badge variant="verified">Đáp án gốc</Badge>
          ) : (
            <Badge variant="suggested">AI gợi ý</Badge>
          )}

          {/* Pending wrong accumulator indicator */}
          {!isRemediation && session.pendingWrongIds.length > 0 && (
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
              Nợ ôn: {session.pendingWrongIds.length}/5
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
            Nắm vững: <strong className="text-emerald-600 dark:text-emerald-400">{session.masteredIds.length}</strong>/{totalQuestions} ({masteredPercent}%)
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onExit}
            leftIcon={<X className="w-4 h-4" />}
          >
            Tạm dừng
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ease-out ${
            isRemediation ? 'bg-amber-500' : 'bg-indigo-600'
          }`}
          style={{ width: `${isRemediation ? Math.round(((session.remediationCursor + 1) / session.remediationIds.length) * 100) : mainProgressPercent}%` }}
        />
      </div>

      {/* REMEDIATION NOTICE BANNER */}
      {isRemediation && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/60 flex items-start gap-3 text-amber-900 dark:text-amber-200">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm space-y-1">
            <div className="font-bold">
              Đang trong phiên ôn lại nhóm câu sai — Vòng {session.remediationRound} (Lô #{session.reviewBatchCount})
            </div>
            <p className="text-amber-800/80 dark:text-amber-300 text-xs">
              Bạn cần làm đúng các câu trong nhóm này trước khi tiếp tục các câu hỏi mới.
            </p>
          </div>
        </div>
      )}

      {/* Question Card */}
      <Card className="p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
            {currentQuestion.text}
          </h2>
        </div>

        {/* 4 Colored Options */}
        <div className="space-y-3">
          {options.map((option, idx) => {
            const isSelected = selectedOptionId === option.id;
            const isOptionCorrect = currentQuestion.correctOptionIds?.includes(option.id);
            const colorConfig = getOptionColor(idx);

            let optionStyle = `border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 ${colorConfig.cardHover} text-slate-800 dark:text-slate-200`;
            let badgeStyle = colorConfig.badgeIdle;

            if (isAnswered) {
              if (isOptionCorrect) {
                optionStyle =
                  'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 shadow-sm ring-2 ring-emerald-500/50';
                badgeStyle = 'bg-emerald-600 text-white font-bold';
              } else if (isSelected && !isOptionCorrect) {
                optionStyle =
                  'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100 ring-2 ring-rose-400/50';
                badgeStyle = 'bg-rose-600 text-white font-bold';
              } else {
                optionStyle =
                  'opacity-40 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-slate-400';
                badgeStyle = 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500';
              }
            }

            return (
              <button
                key={option.id}
                type="button"
                disabled={isAnswered || isSubmitting}
                onClick={() => handleSelectOption(option.id)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${optionStyle}`}
              >
                <span
                  className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold shrink-0 transition-colors ${badgeStyle}`}
                >
                  {colorConfig.letter}
                </span>
                <span className="text-sm sm:text-base leading-relaxed pt-0.5">{option.text}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback Area */}
        {isAnswered && (
          <AnswerFeedback
            isCorrect={isCorrect}
            isMissingKey={false}
            explanation={currentQuestion.explanation}
            onNext={handleNext}
            isLastQuestion={false}
          />
        )}
      </Card>

      {/* Footer Shortcut Tips */}
      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 px-2 font-medium">
        <span>
          💡 Phím tắt: <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-[10px]">1-4</kbd> hoặc{' '}
          <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-[10px]">A-D</kbd> để chọn
        </span>
        {isAnswered && (
          <span>
            Bấm <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-mono text-[10px]">Space</kbd> để tiếp tục
          </span>
        )}
      </div>
    </div>
  );
}
