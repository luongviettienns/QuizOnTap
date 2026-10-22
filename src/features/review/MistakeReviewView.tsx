import { useState } from 'react';
import type { Question } from '@/domain/contracts';
import { Card } from '@/design/components/Card';
import { Button } from '@/design/components/Button';
import { Badge } from '@/design/components/Badge';
import { ArrowLeft, CheckCircle2, Check, AlertCircle, BookOpen } from 'lucide-react';
import { playTone } from '@/gamification/audioSynth';
import { getOptionColor } from '@/design/optionColors';

interface MistakeReviewViewProps {
  questions: Question[];
  userAnswers: Record<string, string[]>;
  onBack: () => void;
  onMastered?: (questionId: string) => void;
}

export function MistakeReviewView({
  questions,
  userAnswers,
  onBack,
  onMastered,
}: MistakeReviewViewProps) {
  const [masteredIds, setMasteredIds] = useState<Set<string>>(() => new Set());
  const [selectedTag, setSelectedTag] = useState<string>('all');

  const activeMistakes = questions.filter((q) => !masteredIds.has(q.id));

  // Extract all unique tags
  const allTags = Array.from(
    new Set(questions.flatMap((q) => q.tags ?? []))
  );

  const displayedMistakes = activeMistakes.filter((q) => {
    if (selectedTag === 'all') return true;
    return q.tags?.includes(selectedTag);
  });

  const handleMarkMastered = (questionId: string) => {
    playTone('correct');
    setMasteredIds((prev) => {
      const next = new Set(prev);
      next.add(questionId);
      return next;
    });
    if (onMastered) {
      onMastered(questionId);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Quay lại kết quả
          </Button>

          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary-600" />
            <span>Ôn tập câu trả lời sai</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 font-mono">
              {activeMistakes.length} câu
            </span>
          </h2>
        </div>

        {/* Filter by tag */}
        {allTags.length > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setSelectedTag('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedTag === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              Tất cả
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedTag === tag
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      {displayedMistakes.length === 0 ? (
        <Card className="text-center p-12 space-y-3">
          <div className="inline-flex p-3 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Tuyệt vời! Bạn đã thành thạo tất cả các câu sai!
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Không còn câu hỏi nào cần ôn tập trong danh sách này.
          </p>
          <Button variant="primary" onClick={onBack} className="mt-4">
            Quay lại
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {displayedMistakes.map((question, index) => {
            const userChosen = userAnswers[question.id] ?? [];
            const correctIds = question.correctOptionIds ?? [];

            return (
              <Card key={question.id} className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-500">
                      Câu #{index + 1}
                    </span>
                    {question.tags.map((tag) => (
                      <Badge key={tag} variant="default">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkMastered(question.id)}
                    leftIcon={<Check className="w-3.5 h-3.5" />}
                    className="text-xs text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:bg-emerald-950/40"
                  >
                    Đã thành thạo
                  </Button>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-relaxed mb-4">
                  {question.text}
                </h3>

                {/* Options comparison */}
                <div className="space-y-2 mb-4">
                  {question.options.map((option, optIdx) => {
                    const isCorrect = correctIds.includes(option.id);
                    const isUserChoice = userChosen.includes(option.id);
                    const colorConfig = getOptionColor(optIdx);

                    let itemClass =
                      'border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20 text-slate-600 dark:text-slate-300';
                    let badgeClass = colorConfig.badgeIdle;

                    if (isCorrect) {
                      itemClass =
                        'border-emerald-300 dark:border-emerald-700 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-100 font-medium';
                      badgeClass = 'bg-emerald-500 text-white font-bold';
                    } else if (isUserChoice) {
                      itemClass =
                        'border-rose-300 dark:border-rose-700 bg-rose-50/60 dark:bg-rose-950/30 text-rose-950 dark:text-rose-100 line-through';
                      badgeClass = 'bg-rose-500 text-white font-bold';
                    }

                    return (
                      <div
                        key={option.id}
                        className={`p-3 rounded-xl border flex items-start gap-3 text-xs sm:text-sm ${itemClass}`}
                      >
                        <span
                          className={`w-6 h-6 rounded-md inline-flex items-center justify-center text-xs shrink-0 ${badgeClass}`}
                        >
                          {colorConfig.letter}
                        </span>
                        <div className="flex-1 pt-0.5 flex items-center justify-between gap-2">
                          <span>{option.text}</span>
                          {isCorrect && (
                            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0 not-italic">
                              ✓ Đáp án đúng
                            </span>
                          )}
                          {isUserChoice && !isCorrect && (
                            <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 shrink-0 not-italic">
                              ✗ Bạn đã chọn
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {question.explanation && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-semibold text-slate-900 dark:text-white">
                        Giải thích:{' '}
                      </strong>
                      {question.explanation}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
