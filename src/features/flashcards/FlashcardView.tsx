import { useState, useEffect, useCallback } from 'react';
import type { Question } from '@/domain/contracts';
import { Card } from '@/design/components/Card';
import { Button } from '@/design/components/Button';
import { FlashcardCard } from './FlashcardCard';
import { ArrowLeft, ArrowRight, RotateCw, CheckCircle2, RotateCcw, X } from 'lucide-react';

interface FlashcardViewProps {
  questions: Question[];
  onFinish: () => void;
  onExit?: () => void;
}

export function FlashcardView({ questions, onFinish, onExit }: FlashcardViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [masteredCount, setMasteredCount] = useState(0);
  const [learningCount, setLearningCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleRate = useCallback(
    (mastered: boolean) => {
      if (mastered) {
        setMasteredCount((c) => c + 1);
      } else {
        setLearningCount((c) => c + 1);
      }

      if (currentIndex < questions.length - 1) {
        setCurrentIndex((i) => i + 1);
        setIsFlipped(false);
      } else {
        setIsCompleted(true);
      }
    },
    [currentIndex, questions.length]
  );

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setMasteredCount(0);
    setLearningCount(0);
    setIsCompleted(false);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === ' ') {
        e.preventDefault();
        handleFlip();
      } else if (isFlipped) {
        if (e.key === '1') {
          e.preventDefault();
          handleRate(false);
        } else if (e.key === '2') {
          e.preventDefault();
          handleRate(true);
        }
      } else {
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          if (currentIndex > 0) {
            setCurrentIndex((i) => i - 1);
            setIsFlipped(false);
          }
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          if (currentIndex < questions.length - 1) {
            setCurrentIndex((i) => i + 1);
            setIsFlipped(false);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isFlipped, handleFlip, handleRate, questions.length]);

  if (isCompleted) {
    const total = masteredCount + learningCount;
    const masteredPercent = total > 0 ? Math.round((masteredCount / total) * 100) : 0;

    return (
      <div className="max-w-xl mx-auto space-y-6 animate-in fade-in duration-300">
        <Card className="p-8 text-center space-y-6">
          <div className="inline-flex p-4 rounded-3xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Hoàn thành phiên lật thẻ!
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Bạn đã ôn tập toàn bộ {questions.length} flashcard trong bộ đề này.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                {masteredCount}
              </div>
              <div className="text-xs text-slate-500 font-medium">Đã thuộc ({masteredPercent}%)</div>
            </div>

            <div>
              <div className="text-2xl font-bold text-amber-500 font-mono">
                {learningCount}
              </div>
              <div className="text-xs text-slate-500 font-medium">Cần ôn lại ({100 - masteredPercent}%)</div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleRestart}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Lật lại từ đầu
            </Button>
            <Button variant="primary" onClick={onFinish}>
              Hoàn thành
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <Card className="text-center p-8">
        <p className="text-slate-600">Không có thẻ nào để học.</p>
        <Button onClick={onFinish} className="mt-4">
          Quay lại
        </Button>
      </Card>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-900 dark:text-white">
            Thẻ {currentIndex + 1} / {questions.length}
          </span>
          <span className="text-xs text-slate-400 font-mono">
            (Đã thuộc: {masteredCount})
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
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
        <div
          className="bg-primary-600 h-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 3D Card */}
      <FlashcardCard
        question={currentQuestion}
        isFlipped={isFlipped}
        onFlip={handleFlip}
      />

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (currentIndex > 0) {
                setCurrentIndex((i) => i - 1);
                setIsFlipped(false);
              }
            }}
            disabled={currentIndex === 0}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="flex-1 sm:flex-none"
          >
            Thẻ trước
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleFlip}
            leftIcon={<RotateCw className="w-4 h-4" />}
            className="flex-1 sm:flex-none"
          >
            Lật thẻ
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (currentIndex < questions.length - 1) {
                setCurrentIndex((i) => i + 1);
                setIsFlipped(false);
              }
            }}
            disabled={currentIndex === questions.length - 1}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="flex-1 sm:flex-none"
          >
            Thẻ sau
          </Button>
        </div>

        {/* Self-Rating buttons (active when flipped) */}
        {isFlipped ? (
          <div className="flex items-center gap-2 w-full sm:w-auto animate-in fade-in duration-200">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleRate(false)}
              className="flex-1 sm:flex-none border-rose-300 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950/40"
            >
              Chưa thuộc (1)
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleRate(true)}
              className="flex-1 sm:flex-none !bg-emerald-600 hover:!bg-emerald-700 shadow-emerald-500/20"
            >
              Đã thuộc (2)
            </Button>
          </div>
        ) : (
          <div className="text-xs text-slate-400 hidden sm:block">
            Nhấn <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">Space</kbd> để lật thẻ
          </div>
        )}
      </div>
    </div>
  );
}
