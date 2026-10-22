import { RELEASES } from '@/data/releases';
import { Card } from '@/design/components/Card';
import { Badge } from '@/design/components/Badge';
import { Sparkles, Calendar, CheckCircle2, GitCommit, AlertCircle } from 'lucide-react';

export function ReleaseNotesView() {
  const formatDateTime = (isoString: string | null) => {
    if (!isoString) return 'Dự kiến phát hành';
    try {
      const date = new Date(isoString);
      return date.toLocaleString('vi-VN', {
        timeZone: 'Asia/Ho_Chi_Minh',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }) + ' (GMT+7)';
    } catch {
      return isoString;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-indigo-600" />
          <span>Nhật ký phiên bản & Cập nhật</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Lịch sử phát triển và các tính năng mới qua từng phiên bản của QuizOnTap.
        </p>
      </div>

      <div className="space-y-6">
        {RELEASES.map((rel, idx) => {
          const isLatest = idx === 0;

          return (
            <Card
              key={rel.version}
              className={`p-6 sm:p-8 space-y-5 ${
                isLatest
                  ? 'border-indigo-300 dark:border-indigo-800 ring-2 ring-indigo-500/10'
                  : ''
              }`}
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
                    v{rel.version}
                  </span>
                  {isLatest && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-600 text-white">
                      Đang sử dụng
                    </span>
                  )}
                  <Badge variant={rel.type === 'major' ? 'verified' : 'default'}>
                    {rel.type.toUpperCase()}
                  </Badge>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDateTime(rel.releasedAt)}
                  </span>
                  {rel.gitCommit && (
                    <span className="flex items-center gap-1 font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      <GitCommit className="w-3 h-3" />
                      {rel.gitCommit}
                    </span>
                  )}
                </div>
              </div>

              {/* Title */}
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                {rel.title}
              </h2>

              {/* Highlights */}
              {rel.highlights.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Điểm mới nổi bật
                  </h3>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                    {rel.highlights.map((h, hIdx) => (
                      <li key={hIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Fixes */}
              {rel.fixes.length > 0 && (
                <div className="space-y-2 pt-1">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Cải tiến & Sửa lỗi
                  </h3>
                  <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400 list-disc list-inside">
                    {rel.fixes.map((f, fIdx) => (
                      <li key={fIdx}>{f}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Breaking Changes if any */}
              {rel.breakingChanges && rel.breakingChanges.length > 0 && (
                <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Thay đổi quan trọng về trải nghiệm người dùng</span>
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 pl-1 text-[11px] text-amber-800 dark:text-amber-300">
                    {rel.breakingChanges.map((b, bIdx) => (
                      <li key={bIdx}>{b}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
