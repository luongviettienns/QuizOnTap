import { Flag } from 'lucide-react';

interface QuestionMatrixProps {
  totalQuestions: number;
  currentIndex: number;
  answeredIndices: Set<number>;
  flaggedIndices: Set<number>;
  onSelectIndex: (index: number) => void;
}

export function QuestionMatrix({
  totalQuestions,
  currentIndex,
  answeredIndices,
  flaggedIndices,
  onSelectIndex,
}: QuestionMatrixProps) {
  return (
    <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
        <span>Ma trận câu hỏi ({totalQuestions})</span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-primary-600 inline-block" /> Đã làm
          </span>
          <span className="flex items-center gap-1">
            <Flag className="w-2.5 h-2.5 text-amber-500 fill-amber-500 inline-block" /> Đã gắn cờ
          </span>
        </div>
      </div>

      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 max-h-60 overflow-y-auto p-1">
        {Array.from({ length: totalQuestions }, (_, index) => {
          const isCurrent = index === currentIndex;
          const isAnswered = answeredIndices.has(index);
          const isFlagged = flaggedIndices.has(index);

          let cellClass =
            'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800';

          if (isAnswered) {
            cellClass =
              'border-primary-500 bg-primary-600 text-white font-medium hover:bg-primary-700';
          }

          if (isCurrent) {
            cellClass += ' ring-2 ring-primary-400 ring-offset-2 dark:ring-offset-slate-900 font-bold';
          }

          return (
            <button
              key={index}
              type="button"
              data-testid={`matrix-item-${index}`}
              data-flagged={isFlagged ? 'true' : 'false'}
              data-answered={isAnswered ? 'true' : 'false'}
              onClick={() => onSelectIndex(index)}
              className={`relative h-9 rounded-lg border text-xs flex items-center justify-center transition-all ${cellClass}`}
            >
              <span>{index + 1}</span>
              {isFlagged && (
                <span className="absolute -top-1 -right-1 text-amber-500 fill-amber-500">
                  <Flag className="w-3 h-3 fill-amber-500 stroke-amber-600 drop-shadow-sm" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
