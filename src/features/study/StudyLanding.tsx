import { useState } from 'react';
import {
  Play,
  RotateCcw,
  Eye,
  EyeOff,
  Lock,
  Layers,
  Award,
} from 'lucide-react';
import type { Question, StudyProgress } from '@/domain/contracts';
import { getCanonicalQuestions } from '@/data/canonicalQuizData';
import { getOptionColor } from '@/design/optionColors';
import { Button } from '@/design/components/Button';
import { Badge } from '@/design/components/Badge';
import { Card } from '@/design/components/Card';

interface StudyLandingProps {
  currentSession: StudyProgress | null;
  onStartNew: () => void;
  onResume: () => void;
  onViewStats: () => void;
}

export function StudyLanding({
  currentSession,
  onStartNew,
  onResume,
  onViewStats,
}: StudyLandingProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const questions: Question[] = getCanonicalQuestions();

  const verifiedCount = questions.filter((q) => q.answerStatus === 'verified').length;
  const suggestedCount = questions.filter((q) => q.answerStatus === 'suggested').length;

  const hasInProgress = currentSession && currentSession.status === 'in-progress';
  const progressPercent = currentSession
    ? Math.round((currentSession.masteredIds.length / 178) * 100)
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Hero Subject Card */}
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-6 sm:p-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-500/10 via-sky-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <Badge variant="verified">178 câu hợp lệ</Badge>
            <Badge variant="default">6 chương giáo trình</Badge>
            <Badge variant="suggested">Chống nhìn trước</Badge>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Kinh tế học và Môi trường
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              Hệ thống ôn luyện thông minh cố định: tự động xáo câu hỏi & đáp án, học lại theo cụm 5 câu sai, chỉ hoàn thành khi bạn đã thực sự nắm vững toàn bộ 178 câu.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tổng câu hỏi</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">178</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Đáp án gốc</div>
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{verifiedCount}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">AI gợi ý</div>
              <div className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">{suggestedCount}</div>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">Quy tắc ôn</div>
              <div className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">5 câu sai</div>
            </div>
          </div>

          {/* In-Progress Session Status */}
          {hasInProgress && (
            <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 space-y-3">
              <div className="flex items-center justify-between gap-3 text-xs sm:text-sm">
                <span className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                  Phiên học đang diễn ra
                </span>
                <span className="font-mono text-indigo-700 dark:text-indigo-300 font-semibold">
                  Nắm vững: {currentSession.masteredIds.length} / 178 ({progressPercent}%)
                </span>
              </div>

              <div className="w-full bg-indigo-100 dark:bg-indigo-900/50 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="text-xs text-indigo-800/80 dark:text-indigo-300 flex items-center justify-between">
                <span>Vị trí hiện tại: Câu {currentSession.mainCursor + 1}</span>
                {currentSession.pendingWrongIds.length > 0 && (
                  <span>Nợ ôn tập: {currentSession.pendingWrongIds.length}/5 câu</span>
                )}
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            {hasInProgress ? (
              <>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={onResume}
                  leftIcon={<Play className="w-5 h-5 ml-0.5" />}
                  className="shadow-md shadow-indigo-600/20"
                >
                  Tiếp tục lượt đang học
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    if (window.confirm('Bạn có chắc chắn muốn bỏ dở phiên hiện tại và bắt đầu lượt ôn tập mới với thứ tự đảo hoàn toàn mới?')) {
                      onStartNew();
                    }
                  }}
                  leftIcon={<RotateCcw className="w-4 h-4" />}
                >
                  Bắt đầu lượt mới
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                size="lg"
                onClick={onStartNew}
                leftIcon={<Play className="w-5 h-5 ml-0.5" />}
                className="shadow-md shadow-indigo-600/20"
              >
                Bắt đầu ôn tập (178 câu)
              </Button>
            )}

            <Button
              variant="ghost"
              size="lg"
              onClick={onViewStats}
              leftIcon={<Award className="w-4 h-4" />}
            >
              Xem thống kê tiến trình
            </Button>
          </div>
        </div>
      </div>

      {/* Study Rules Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 space-y-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
            1
          </div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Tự động xáo trộn</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Mỗi lượt ôn mới đảo ngẫu nhiên thứ tự toàn bộ 178 câu và vị trí các phương án A, B, C, D nhằm loại bỏ thói quen học vẹt theo vị trí.
          </p>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm">
            2
          </div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Luyện lại theo nhóm 5 câu sai</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Cứ khi tích lũy đủ 5 câu sai, hệ thống lập tức tạm dừng câu mới và đưa bạn vào phiên ôn lại đúng 5 câu đó cho tới khi trả lời đúng toàn bộ.
          </p>
        </Card>

        <Card className="p-5 space-y-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-sm">
            3
          </div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Đạt 178/178 mới hoàn thành</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Bài ôn tập chỉ được cấp báo cáo thành công khi bạn đã tự mình khắc phục mọi câu sai và đạt thành thạo tuyệt đối 178/178 câu.
          </p>
        </Card>
      </div>

      {/* Locked Preview Section (Che nội dung trước khi xem) */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-600" />
              <span>Nội dung chi tiết bộ đề</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isRevealed
                ? 'Đang hiển thị toàn bộ 178 câu hỏi kèm đáp án chính xác'
                : 'Mặc định bị khóa để đảm bảo trải nghiệm ôn thi công tâm'}
            </p>
          </div>

          <Button
            variant={isRevealed ? 'outline' : 'secondary'}
            size="sm"
            onClick={() => setIsRevealed(!isRevealed)}
            leftIcon={isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          >
            {isRevealed ? 'Ẩn lại nội dung' : 'Xem nội dung bộ đề'}
          </Button>
        </div>

        {/* LOCKED STATE (Secure placeholder - no real question text in DOM) */}
        {!isRevealed ? (
          <div className="p-8 sm:p-12 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 inline-flex items-center justify-center shadow-xs">
              <Lock className="w-6 h-6" />
            </div>

            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Nội dung câu hỏi và đáp án đang được khóa
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Để tránh nhìn trước đáp án làm giảm hiệu quả tự luyện tập, danh sách câu hỏi chỉ được hiển thị khi bạn chủ động nhấn xem.
              </p>
            </div>

            {/* Skeleton Mockup */}
            <div className="max-w-xl mx-auto pt-4 space-y-2.5 opacity-50 select-none pointer-events-none">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4 mx-auto" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded-md w-1/2 mx-auto" />
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="h-9 bg-slate-200 dark:bg-slate-800 rounded-xl" />
                <div className="h-9 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              </div>
            </div>

            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRevealed(true)}
                leftIcon={<Eye className="w-4 h-4" />}
              >
                Mở khóa xem nội dung ({questions.length} câu)
              </Button>
            </div>
          </div>
        ) : (
          /* REVEALED STATE (Loaded on demand only) */
          <div className="space-y-3.5 animate-in fade-in duration-200">
            {questions.map((q, idx) => (
              <div
                key={q.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-400 font-mono">#{idx + 1}</span>
                    {q.chapterId && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {q.chapterId}
                      </span>
                    )}
                    {q.answerStatus === 'verified' ? (
                      <Badge variant="verified">Đáp án gốc</Badge>
                    ) : (
                      <Badge variant="suggested">AI gợi ý</Badge>
                    )}
                  </div>
                </div>

                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
                  {q.text}
                </p>

                {/* 4 Colored Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {q.options.map((opt, optIdx) => {
                    const colorConfig = getOptionColor(optIdx);
                    const isCorrect = q.correctOptionIds?.includes(opt.id);
                    return (
                      <div
                        key={opt.id}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border ${
                          isCorrect
                            ? 'border-emerald-300 bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-950/40 font-semibold text-emerald-950 dark:text-emerald-100'
                            : 'border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        <span
                          className={`w-5 h-5 rounded-md inline-flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            isCorrect
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : colorConfig.badgeIdle
                          }`}
                        >
                          {colorConfig.letter}
                        </span>
                        <span className="pt-0.5 leading-snug flex-1">{opt.text}</span>
                        {isCorrect && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                            ✓ Đúng
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation if present */}
                {q.explanation && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                    <strong className="text-slate-900 dark:text-white font-semibold">
                      Giải thích:{' '}
                    </strong>
                    {q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
