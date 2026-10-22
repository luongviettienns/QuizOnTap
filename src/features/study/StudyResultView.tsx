import type { StudySessionResult, Question } from '@/domain/contracts';
import { Card } from '@/design/components/Card';
import { Button } from '@/design/components/Button';
import { Badge } from '@/design/components/Badge';
import {
  Trophy,
  RotateCcw,
  AlertTriangle,
  ArrowLeft,
  BookOpen,
} from 'lucide-react';

interface StudyResultViewProps {
  result: StudySessionResult;
  allQuestions: Question[];
  onStartNew: () => void;
  onBackToHome: () => void;
}

export function StudyResultView({
  result,
  onStartNew,
  onBackToHome,
}: StudyResultViewProps) {
  const durationMinutes = Math.floor(result.durationMs / 60000);
  const durationSeconds = Math.floor((result.durationMs % 60000) / 1000);
  const formattedDuration =
    durationMinutes > 0
      ? `${durationMinutes} phút ${durationSeconds} giây`
      : `${durationSeconds} giây`;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Celebration Hero Card */}
      <Card className="p-8 sm:p-10 text-center space-y-6 relative overflow-hidden border-emerald-200 dark:border-emerald-900/60 bg-gradient-to-b from-emerald-50/60 to-white dark:from-emerald-950/20 dark:to-slate-900">
        <div className="inline-flex p-4 rounded-3xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400 shadow-md shadow-emerald-500/10">
          <Trophy className="w-12 h-12" />
        </div>

        <div className="space-y-2 max-w-xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Hoàn thành tuyệt đối 178/178 câu!
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Chúc mừng bạn đã hoàn tất toàn bộ lộ trình và khắc phục 100% các câu sai. Bạn đã chính thức làm chủ toàn diện ngân hàng câu hỏi môn Kinh tế học và Môi trường.
          </p>
        </div>

        {/* 4 Core Invariants Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-2 text-left">
          <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-emerald-200/60 dark:border-slate-700 shadow-xs">
            <div className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">Đã nắm vững</div>
            <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 font-mono">
              178 / 178
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">100% mục tiêu</div>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">Đúng lần đầu</div>
            <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1 font-mono">
              {result.firstPassCorrectCount} / 178
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Tỷ lệ {result.firstPassAccuracyPercent}%</div>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="text-xs text-amber-600 dark:text-amber-400 font-semibold">Cần ôn lại</div>
            <div className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1 font-mono">
              {result.uniqueEverWrongCount} câu
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">{result.remediationBatchCount} cụm ôn 5 câu</div>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs">
            <div className="text-xs text-slate-500 font-semibold">Thời gian học</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-1.5 leading-snug">
              {formattedDuration}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Tổng {result.totalAttempts} lượt làm</div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Button
            variant="primary"
            size="lg"
            onClick={onStartNew}
            leftIcon={<RotateCcw className="w-5 h-5" />}
            className="shadow-md shadow-indigo-600/20"
          >
            Làm lại lượt ôn tập mới
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={onBackToHome}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Trở về trang chủ
          </Button>
        </div>
      </Card>

      {/* Chapter Breakdown */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          <span>Thống kê chi tiết theo 6 chương</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {result.chapterStats.map((ch) => {
            const pct = Math.round((ch.firstPassCorrect / ch.totalQuestions) * 100);
            return (
              <Card key={ch.chapterId} className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {ch.chapterId}
                  </span>
                  <Badge variant={pct >= 80 ? 'verified' : pct >= 50 ? 'suggested' : 'missing'}>
                    {pct}% đúng đầu
                  </Badge>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs text-slate-500 pt-1">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{ch.totalQuestions}</div>
                    <div className="text-[10px]">Tổng câu</div>
                  </div>
                  <div>
                    <div className="font-bold text-emerald-600">{ch.firstPassCorrect}</div>
                    <div className="text-[10px]">Đúng đầu</div>
                  </div>
                  <div>
                    <div className="font-bold text-amber-600">{ch.firstPassWrong}</div>
                    <div className="text-[10px]">Cần ôn</div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Hardest Questions Review */}
      {result.hardestQuestions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>Những câu hỏi cần chú ý nhất ({result.hardestQuestions.length} câu)</span>
          </h2>

          <div className="space-y-3">
            {result.hardestQuestions.map((q) => (
              <Card key={q.questionId} className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                      Sai {q.wrongCount} lần
                    </span>
                    {q.chapterId && <Badge variant="default">{q.chapterId}</Badge>}
                    {q.isSuggested && <Badge variant="suggested">AI gợi ý</Badge>}
                  </div>
                </div>

                <p className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed">
                  {q.questionText}
                </p>

                {q.firstWrongOptionText && (
                  <div className="text-xs text-rose-700 dark:text-rose-400 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60">
                    <strong>Phương án bạn chọn sai đầu tiên: </strong>
                    {q.firstWrongOptionText}
                  </div>
                )}

                {q.explanation && (
                  <div className="text-xs text-slate-600 dark:text-slate-300 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <strong className="text-slate-900 dark:text-white font-semibold">
                      Giải thích chuẩn:{' '}
                    </strong>
                    {q.explanation}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
