import type { Question } from '@/domain/contracts';
import { Badge } from '@/design/components/Badge';
import { HelpCircle, CheckCircle2, RotateCw } from 'lucide-react';

interface FlashcardCardProps {
  question: Question;
  isFlipped: boolean;
  onFlip: () => void;
}

export function FlashcardCard({ question, isFlipped, onFlip }: FlashcardCardProps) {
  const isMissingKey =
    !question.correctOptionIds ||
    question.correctOptionIds.length === 0 ||
    question.answerStatus === 'missing';

  const correctOptions = question.options.filter((opt) =>
    question.correctOptionIds?.includes(opt.id)
  );

  return (
    <div
      data-testid="flashcard-card"
      onClick={onFlip}
      className="w-full min-h-[380px] sm:min-h-[420px] cursor-pointer [perspective:1000px] select-none group"
    >
      <div
        className={`relative w-full h-full min-h-[380px] sm:min-h-[420px] rounded-3xl transition-transform duration-500 ease-out [transform-style:preserve-3d] shadow-lg ${
          isFlipped ? '[transform:rotateY(180deg)]' : ''
        }`}
      >
        {/* FRONT FACE */}
        <div className="absolute inset-0 w-full h-full p-6 sm:p-8 rounded-3xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 [backface-visibility:hidden] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-6">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                  Mặt trước: Câu hỏi
                </span>
                {question.tags.map((tag) => (
                  <Badge key={tag} variant="default">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 group-hover:text-primary-600 transition-colors">
                <RotateCw className="w-3.5 h-3.5 animate-pulse" />
                <span>Bấm để lật</span>
              </div>
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
              {question.text}
            </h2>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>💡 Nhấn Space hoặc chạm vào thẻ để xem đáp án</span>
            <span className="font-semibold text-primary-600">Lật thẻ ➔</span>
          </div>
        </div>

        {/* BACK FACE */}
        <div className="absolute inset-0 w-full h-full p-6 sm:p-8 rounded-3xl border-2 border-primary-200 dark:border-primary-900 bg-gradient-to-b from-primary-50/50 to-white dark:from-slate-900 dark:to-slate-950 [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Mặt sau: Đáp án & Giải thích
                </span>
              </div>

              <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <RotateCw className="w-3.5 h-3.5" />
                <span>Bấm để lật lại</span>
              </div>
            </div>

            {/* Answer Display */}
            {isMissingKey ? (
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 mb-4">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold text-sm mb-1">
                  <HelpCircle className="w-4 h-4 shrink-0" />
                  <span>Câu hỏi tự ôn tập</span>
                </div>
                <p className="text-xs text-amber-700/80 dark:text-amber-400">
                  Tài liệu gốc chưa có đáp án được xác nhận chính thức. Hãy tham khảo lời giải thích bên dưới.
                </p>
              </div>
            ) : (
              <div className="space-y-2 mb-4">
                <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Đáp án chính xác:</span>
                </div>
                {correctOptions.map((opt) => (
                  <div
                    key={opt.id}
                    className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-sm font-semibold text-emerald-900 dark:text-emerald-100"
                  >
                    {opt.text}
                  </div>
                ))}
              </div>
            )}

            {/* Explanation */}
            {question.explanation && (
              <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-h-36 overflow-y-auto">
                <strong className="text-slate-900 dark:text-white font-semibold">
                  Lời giải thích:{' '}
                </strong>
                {question.explanation}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
            <span>Đánh giá mức độ ghi nhớ của bạn ở bên dưới 👇</span>
          </div>
        </div>
      </div>
    </div>
  );
}
