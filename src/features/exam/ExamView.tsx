import { useState, useMemo, useCallback, useEffect } from 'react';
import type { Question } from '@/domain/contracts';
import { Card } from '@/design/components/Card';
import { Button } from '@/design/components/Button';
import { Badge } from '@/design/components/Badge';
import { Modal } from '@/design/components/Modal';
import { ExamTimer } from './ExamTimer';
import { QuestionMatrix } from './QuestionMatrix';
import { Flag, ArrowLeft, ArrowRight, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { playTone } from '@/gamification/audioSynth';
import { getOptionColor } from '@/design/optionColors';

interface ExamViewProps {
  questions: Question[];
  durationMinutes: number;
  onSubmit: (answers: Record<string, string[]>, durationSpentSeconds: number) => void;
  onExit?: () => void;
}

export function ExamView({
  questions,
  durationMinutes,
  onSubmit,
  onExit,
}: ExamViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [flaggedIndices, setFlaggedIndices] = useState<Set<number>>(() => new Set());
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const startedAtEpoch = useMemo(() => Date.now(), []);
  const deadlineEpochMs = useMemo(
    () => startedAtEpoch + durationMinutes * 60 * 1000,
    [startedAtEpoch, durationMinutes]
  );

  const currentQuestion = questions[currentIndex];

  const answeredIndices = useMemo(() => {
    const set = new Set<number>();
    questions.forEach((q, idx) => {
      const selected = answers[q.id];
      if (selected && selected.length > 0) {
        set.add(idx);
      }
    });
    return set;
  }, [questions, answers]);

  const handleToggleFlag = useCallback((index: number) => {
    playTone('click');
    setFlaggedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  const handleSelectOption = useCallback(
    (questionId: string, optionId: string) => {
      playTone('click');
      setAnswers((prev) => ({
        ...prev,
        [questionId]: [optionId],
      }));
    },
    []
  );

  const handleConfirmSubmit = useCallback(() => {
    playTone('complete');
    const durationSpent = Math.max(1, Math.round((Date.now() - startedAtEpoch) / 1000));
    onSubmit(answers, durationSpent);
  }, [answers, startedAtEpoch, onSubmit]);

  const handleTimeUp = useCallback(() => {
    handleConfirmSubmit();
  }, [handleConfirmSubmit]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        handleToggleFlag(currentIndex);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setCurrentIndex((i) => Math.max(0, i - 1));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setCurrentIndex((i) => Math.min(questions.length - 1, i + 1));
      } else if (currentQuestion) {
        const key = e.key.toUpperCase();
        const indexByKey: Record<string, number> = {
          '1': 0,
          '2': 1,
          '3': 2,
          '4': 3,
          'A': 0,
          'B': 1,
          'C': 2,
          'D': 3,
        };
        if (key in indexByKey) {
          const optIdx = indexByKey[key];
          if (optIdx < currentQuestion.options.length) {
            e.preventDefault();
            handleSelectOption(currentQuestion.id, currentQuestion.options[optIdx].id);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, currentQuestion, handleSelectOption, handleToggleFlag, questions.length]);

  if (!currentQuestion) {
    return (
      <Card className="text-center p-8">
        <p className="text-slate-600 dark:text-slate-300">Không có câu hỏi trong đề thi.</p>
        {onExit && (
          <Button onClick={onExit} className="mt-4">
            Thoát
          </Button>
        )}
      </Card>
    );
  }

  const isCurrentFlagged = flaggedIndices.has(currentIndex);
  const currentSelectedOptionId = answers[currentQuestion.id]?.[0] ?? null;
  const answeredCount = answeredIndices.size;
  const unansweredCount = questions.length - answeredCount;
  const flaggedCount = flaggedIndices.size;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Sticky Header: Timer, Stats & Submit */}
      <div className="sticky top-2 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ExamTimer deadlineEpochMs={deadlineEpochMs} onTimeUp={handleTimeUp} />
          <span className="hidden sm:inline-block text-xs text-slate-500 dark:text-slate-400">
            Đã làm: <strong className="text-slate-800 dark:text-white">{answeredCount}</strong> / {questions.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onExit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onExit}
              leftIcon={<X className="w-4 h-4" />}
            >
              Thoát
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsConfirmModalOpen(true)}
            rightIcon={<CheckCircle2 className="w-4 h-4" />}
          >
            Nộp bài
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Question Column */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  Câu {currentIndex + 1}
                </span>
                {currentQuestion.tags.map((tag) => (
                  <Badge key={tag} variant="default">
                    {tag}
                  </Badge>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleToggleFlag(currentIndex)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                  isCurrentFlagged
                    ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800'
                    : 'text-slate-500 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                aria-label={isCurrentFlagged ? 'Bỏ gắn cờ' : 'Gắn cờ'}
              >
                <Flag
                  className={`w-3.5 h-3.5 ${
                    isCurrentFlagged ? 'fill-amber-500 text-amber-600' : 'text-slate-400'
                  }`}
                />
                <span>{isCurrentFlagged ? 'Đã gắn cờ' : 'Gắn cờ'}</span>
              </button>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed mb-6">
              {currentQuestion.text}
            </h2>

            {/* Options List */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = currentSelectedOptionId === option.id;
                const colorConfig = getOptionColor(idx);

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelectOption(currentQuestion.id, option.id)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3.5 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                      isSelected
                        ? colorConfig.cardSelected
                        : `border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 ${colorConfig.cardHover} text-slate-800 dark:text-slate-200`
                    }`}
                  >
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                        isSelected
                          ? colorConfig.badgeSelected
                          : colorConfig.badgeIdle
                      }`}
                    >
                      {colorConfig.letter}
                    </span>
                    <span className="text-sm sm:text-base leading-relaxed pt-0.5">{option.text}</span>
                  </button>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  playTone('click');
                  setCurrentIndex((i) => Math.max(0, i - 1));
                }}
                disabled={currentIndex === 0}
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Câu trước
              </Button>

              <span className="text-xs text-slate-400">
                {currentIndex + 1} / {questions.length}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  playTone('click');
                  setCurrentIndex((i) => Math.min(questions.length - 1, i + 1));
                }}
                disabled={currentIndex === questions.length - 1}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Câu sau
              </Button>
            </div>
          </Card>
        </div>

        {/* Matrix Column */}
        <div className="lg:col-span-1 space-y-4">
          <QuestionMatrix
            totalQuestions={questions.length}
            currentIndex={currentIndex}
            answeredIndices={answeredIndices}
            flaggedIndices={flaggedIndices}
            onSelectIndex={setCurrentIndex}
          />
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Xác nhận nộp bài thi"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Bạn có chắc chắn muốn nộp bài thi ngay bây giờ? Sau khi nộp, bạn sẽ không thể chỉnh sửa đáp án.
          </p>

          <div className="grid grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center">
            <div>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {answeredCount}
              </div>
              <div className="text-xs text-slate-500">Đã làm</div>
            </div>

            <div>
              <div className="text-xl font-bold text-rose-500">
                {unansweredCount}
              </div>
              <div className="text-xs text-slate-500">Chưa làm: {unansweredCount}</div>
            </div>

            <div>
              <div className="text-xl font-bold text-amber-500">
                {flaggedCount}
              </div>
              <div className="text-xs text-slate-500">Gắn cờ</div>
            </div>
          </div>

          {unansweredCount > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>Lưu ý: Bạn vẫn còn {unansweredCount} câu chưa trả lời!</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button
              variant="outline"
              onClick={() => setIsConfirmModalOpen(false)}
            >
              Tiếp tục làm bài
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setIsConfirmModalOpen(false);
                handleConfirmSubmit();
              }}
            >
              Xác nhận nộp bài
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
