interface CategoryBreakdownProps {
  chapterStats: Record<string, { correct: number; scored: number }>;
}

export function CategoryBreakdown({ chapterStats }: CategoryBreakdownProps) {
  const chapters = Object.entries(chapterStats);

  if (chapters.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
        Kết quả theo từng chương / nhóm
      </h3>

      <div className="space-y-2.5">
        {chapters.map(([chapterName, stats]) => {
          const percent =
            stats.scored > 0 ? Math.round((stats.correct / stats.scored) * 100) : 0;

          let barColor = 'bg-rose-500';
          let textColor = 'text-rose-600 dark:text-rose-400';

          if (percent >= 80) {
            barColor = 'bg-emerald-500';
            textColor = 'text-emerald-600 dark:text-emerald-400';
          } else if (percent >= 50) {
            barColor = 'bg-amber-500';
            textColor = 'text-amber-600 dark:text-amber-400';
          }

          return (
            <div
              key={chapterName}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60"
            >
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[65%]">
                  {chapterName}
                </span>
                <span className="font-mono text-slate-500 dark:text-slate-400">
                  <strong className={textColor}>{stats.correct}</strong> / {stats.scored}{' '}
                  <span className="ml-1 text-[11px] font-bold">({percent}%)</span>
                </span>
              </div>

              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${barColor}`}
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
