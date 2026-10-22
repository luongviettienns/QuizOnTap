import { CheckCircle2, AlertCircle, HelpCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/design/components/Button';

interface AnswerFeedbackProps {
  isCorrect: boolean | null;
  isMissingKey: boolean;
  explanation?: string;
  onNext: () => void;
  isLastQuestion: boolean;
}

export function AnswerFeedback({
  isCorrect,
  isMissingKey,
  explanation,
  onNext,
  isLastQuestion,
}: AnswerFeedbackProps) {
  return (
    <div className="mt-5 p-5 rounded-2xl border transition-all animate-in fade-in slide-in-from-bottom-2 duration-200 bg-white dark:bg-slate-900 shadow-sm border-slate-200 dark:border-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          {isMissingKey ? (
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 shrink-0">
              <HelpCircle className="w-5 h-5" />
            </div>
          ) : isCorrect ? (
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          ) : (
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}

          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              {isMissingKey
                ? 'Câu hỏi tự ôn tập'
                : isCorrect
                ? 'Chính xác!'
                : 'Chưa chính xác!'}
            </h4>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {isMissingKey
                ? 'Tài liệu nguồn chưa có đáp án xác nhận cho câu hỏi này.'
                : isCorrect
                ? 'Bạn đã chọn đúng phương án chính xác.'
                : 'Hãy xem lại lời giải thích bên dưới để củng cố kiến thức.'}
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          onClick={onNext}
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="shrink-0"
        >
          {isLastQuestion ? 'Hoàn thành' : 'Câu tiếp theo'}
        </Button>
      </div>

      {explanation && (
        <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-950/30 p-3 rounded-xl">
          <strong className="text-slate-800 dark:text-slate-100 font-semibold">Lời giải thích: </strong>
          {explanation}
        </div>
      )}
    </div>
  );
}
