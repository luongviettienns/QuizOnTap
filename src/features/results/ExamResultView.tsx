import type { ExamResult, Question } from '@/domain/contracts';
import { Card } from '@/design/components/Card';
import { Button } from '@/design/components/Button';
import { CategoryBreakdown } from './CategoryBreakdown';
import { RotateCcw, BookOpen, Home, Award, CheckCircle2, XCircle, HelpCircle } from 'lucide-react';

interface ExamResultViewProps {
  result: ExamResult;
  questions?: Question[];
  answers?: Record<string, string[]>;
  onRetry?: () => void;
  onReviewMistakes?: () => void;
  onGoHome?: () => void;
}

export function ExamResultView({
  result,
  onRetry,
  onReviewMistakes,
  onGoHome,
}: ExamResultViewProps) {
  const percent = Math.round(result.percent ?? 0);
  const accuracy = Math.round(result.accuracyAmongAnswered ?? 0);

  let evaluation: {
    title: string;
    desc: string;
    badgeVariant: 'default' | 'missing' | 'suggested' | 'verified' | 'warning' | 'info';
    textColor: string;
  } = {
    title: 'Xuất sắc!',
    desc: 'Bạn đã nắm rất vững kiến thức và trả lời chính xác hầu hết câu hỏi.',
    badgeVariant: 'verified',
    textColor: 'text-emerald-600 dark:text-emerald-400',
  };

  if (percent < 50) {
    evaluation = {
      title: 'Cần nỗ lực hơn!',
      desc: 'Hãy xem lại các câu trả lời sai và luyện tập thêm các chương yếu điểm.',
      badgeVariant: 'warning' as const,
      textColor: 'text-rose-600 dark:text-rose-400',
    };
  } else if (percent < 80) {
    evaluation = {
      title: 'Đạt yêu cầu!',
      desc: 'Bạn đã vượt qua bài thi với kết quả khá. Hãy ôn lại một vài câu sai để đạt điểm tối đa.',
      badgeVariant: 'suggested' as const,
      textColor: 'text-amber-600 dark:text-amber-400',
    };
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Hero Score Card */}
      <Card className="p-8 text-center relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-primary-100 dark:bg-primary-950/40 rounded-full blur-2xl pointer-events-none" />

        <div className="inline-flex p-3 rounded-2xl bg-primary-50 dark:bg-primary-950/60 text-primary-600 dark:text-primary-400 mb-4 shadow-sm">
          <Award className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
          {evaluation.title}
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto mb-6">
          {evaluation.desc}
        </p>

        {/* Big numbers */}
        <div className="flex items-center justify-center gap-6 py-4 border-y border-slate-100 dark:border-slate-800 my-4">
          <div>
            <div className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
              Điểm số
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-mono mt-0.5">
              {result.correct}/{result.scoredCount}
            </div>
          </div>

          <div className="h-10 w-px bg-slate-200 dark:bg-slate-700" />

          <div>
            <div className="text-xs uppercase tracking-wider font-bold text-slate-500 dark:text-slate-400">
              Tỷ lệ đúng
            </div>
            <div className={`text-3xl sm:text-4xl font-extrabold font-mono mt-0.5 ${evaluation.textColor}`}>
              {percent}%
            </div>
          </div>
        </div>

        {/* Mini stats pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
          <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40 text-center">
            <div className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Đúng
            </div>
            <div className="text-lg font-bold text-emerald-700 dark:text-emerald-300 font-mono mt-0.5">
              {result.correct}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40 text-center">
            <div className="flex items-center justify-center gap-1 text-rose-600 dark:text-rose-400 text-xs font-semibold">
              <XCircle className="w-3.5 h-3.5" /> Sai
            </div>
            <div className="text-lg font-bold text-rose-700 dark:text-rose-300 font-mono mt-0.5">
              {result.incorrect}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-center">
            <div className="flex items-center justify-center gap-1 text-slate-500 text-xs font-semibold">
              Bỏ qua
            </div>
            <div className="text-lg font-bold text-slate-700 dark:text-slate-300 font-mono mt-0.5">
              {result.unanswered}
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40 text-center">
            <div className="flex items-center justify-center gap-1 text-amber-600 dark:text-amber-400 text-xs font-semibold">
              <HelpCircle className="w-3.5 h-3.5" /> Tự ôn
            </div>
            <div className="text-lg font-bold text-amber-700 dark:text-amber-300 font-mono mt-0.5">
              {result.unscored}
            </div>
          </div>
        </div>

        {result.attemptedScoredCount > 0 && (
          <p className="mt-4 text-xs text-slate-600 dark:text-slate-400 font-medium">
            Độ chính xác trong số câu đã làm:{' '}
            <strong className="text-slate-900 dark:text-slate-100 font-bold">{accuracy}%</strong>
          </p>
        )}
      </Card>

      {/* Chapter Breakdown */}
      {result.chapterStats && Object.keys(result.chapterStats).length > 0 && (
        <Card className="p-6">
          <CategoryBreakdown chapterStats={result.chapterStats} />
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {onGoHome && (
            <Button
              variant="outline"
              onClick={onGoHome}
              leftIcon={<Home className="w-4 h-4" />}
              className="flex-1 sm:flex-none"
            >
              Về thư viện
            </Button>
          )}

          {onRetry && (
            <Button
              variant="outline"
              onClick={onRetry}
              leftIcon={<RotateCcw className="w-4 h-4" />}
              className="flex-1 sm:flex-none"
            >
              Làm lại
            </Button>
          )}
        </div>

        {result.incorrect > 0 && onReviewMistakes && (
          <Button
            variant="primary"
            onClick={onReviewMistakes}
            leftIcon={<BookOpen className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Ôn lại câu sai ({result.incorrect})
          </Button>
        )}
      </div>
    </div>
  );
}
