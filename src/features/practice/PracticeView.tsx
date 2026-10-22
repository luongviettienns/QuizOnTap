import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Question } from '@/domain/contracts';
import { Card } from '@/design/components/Card';
import { Button } from '@/design/components/Button';
import { Badge } from '@/design/components/Badge';
import { AnswerFeedback } from './AnswerFeedback';
import { X, Shuffle } from 'lucide-react';
import { playTone } from '@/gamification/audioSynth';
import { getOptionColor } from '@/design/optionColors';

interface PracticeViewProps {
  questions: Question[];
  onFinish: () => void;
  onExit?: () => void;
}

export function PracticeView({ questions, onFinish, onExit }: PracticeViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [shouldShuffleOptions, setShouldShuffleOptions] = useState(false);
  const [shuffledSeed, setShuffledSeed] = useState(0);

  const currentQuestion: Question | undefined = questions[currentIndex];

  const options = useMemo(() => {
    if (!currentQuestion) return [];
    if (!shouldShuffleOptions) return currentQuestion.options;
    // Simple deterministic shuffle per question based on seed
    const opts = [...currentQuestion.options];
    for (let i = opts.length - 1; i > 0; i--) {
      const j = (i * 31 + shuffledSeed) % (i + 1);
      const temp = opts[i];
      opts[i] = opts[j];
      opts[j] = temp;
    }
    return opts;
  }, [currentQuestion, shouldShuffleOptions, shuffledSeed]);

  const isMissingKey =
    !currentQuestion?.correctOptionIds ||
    currentQuestion.correctOptionIds.length === 0 ||
    currentQuestion.answerStatus === 'missing';

  const isCorrect = useMemo(() => {
    if (!currentQuestion || isMissingKey || !selectedOptionId) return null;
    return currentQuestion.correctOptionIds?.includes(selectedOptionId) ?? false;
  }, [currentQuestion, isMissingKey, selectedOptionId]);

  const handleSelectOption = useCallback(
    (optId: string) => {
      if (isAnswered || !currentQuestion) return;
      setSelectedOptionId(optId);
      setIsAnswered(true);

      if (isMissingKey) {
        playTone('click');
      } else if (currentQuestion.correctOptionIds?.includes(optId)) {
        playTone('correct');
      } else {
        playTone('wrong');
      }
    },
    [isAnswered, currentQuestion, isMissingKey]
  );

  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      playTone('click');
      setCurrentIndex((prev) => prev + 1);
      setSelectedOptionId(null);
      setIsAnswered(false);
    } else {
      playTone('complete');
      onFinish();
    }
  }, [currentIndex, questions.length, onFinish]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in input or modal
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (!isAnswered && options.length > 0) {
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
      <Card className="text-center p-8">
        <p className="text-slate-600 dark:text-slate-300">Không có câu hỏi nào để luyện tập.</p>
        <Button onClick={onFinish} className="mt-4">
          Quay lại
        </Button>
      </Card>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Bar: Progress & Exit */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            Câu {currentIndex + 1} / {questions.length}
          </span>
          {currentQuestion.tags.map((tag) => (
            <Badge key={tag} variant="default">
              {tag}
            </Badge>
          ))}
          {isMissingKey ? (
            <Badge variant="missing">Chưa có key</Badge>
          ) : currentQuestion.answerStatus === 'suggested' ? (
            <Badge variant="suggested">AI gợi ý</Badge>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setShouldShuffleOptions((prev) => !prev);
              setShuffledSeed((s) => s + 1);
            }}
            title={shouldShuffleOptions ? 'Tắt xáo trộn đáp án' : 'Bật xáo trộn đáp án'}
            className={`p-2 rounded-xl border text-xs flex items-center gap-1 transition-colors ${
              shouldShuffleOptions
                ? 'bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 border-primary-300 dark:border-primary-800'
                : 'text-slate-500 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Xáo đáp án</span>
          </button>

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
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
        <div
          className="bg-primary-600 h-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Question Card */}
      <Card className="p-6 sm:p-8">
        <div className="mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
            {currentQuestion.text}
          </h2>
        </div>

        {/* Options List */}
        <div className="space-y-3">
          {options.map((option, idx) => {
            const isSelected = selectedOptionId === option.id;
            const isOptionCorrect = currentQuestion.correctOptionIds?.includes(option.id);
            const colorConfig = getOptionColor(idx);

            let optionStyle = `border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 ${colorConfig.cardHover} text-slate-800 dark:text-slate-200`;
            let badgeStyle = colorConfig.badgeIdle;

            if (isAnswered) {
              if (isMissingKey) {
                if (isSelected) {
                  optionStyle =
                    'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-amber-950 dark:text-amber-100 ring-2 ring-amber-400/50 shadow-xs';
                  badgeStyle = 'bg-amber-500 text-white font-bold';
                } else {
                  optionStyle =
                    'opacity-40 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 text-slate-400';
                  badgeStyle = 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500';
                }
              } else {
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
            }

            return (
              <button
                key={option.id}
                type="button"
                disabled={isAnswered}
                onClick={() => handleSelectOption(option.id)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-start gap-3.5 focus:outline-none focus:ring-2 focus:ring-primary-500 ${optionStyle}`}
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
            isMissingKey={isMissingKey}
            explanation={currentQuestion.explanation}
            onNext={handleNext}
            isLastQuestion={currentIndex === questions.length - 1}
          />
        )}
      </Card>

      {/* Footer shortcut tips */}
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
