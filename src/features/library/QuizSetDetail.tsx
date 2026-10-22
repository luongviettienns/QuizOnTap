import { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Play, 
  Clock, 
  Layers, 
  Plus, 
  Download, 
  Trash2, 
  Edit2 
} from 'lucide-react';
import type { QuizSet, Question } from '@/domain/contracts';
import { questionRepo, quizSetRepo } from '@/db/repositories';
import { exportQuizSetToJson } from '@/import/jsonBackup';
import { Button } from '@/design/components/Button';
import { Badge } from '@/design/components/Badge';
import { QuestionEditorModal } from '../questions/QuestionEditorModal';
import { getOptionColor } from '@/design/optionColors';

interface QuizSetDetailProps {
  setId: string;
  onBack: () => void;
  onStartPractice: (setId: string) => void;
  onStartExam: (setId: string) => void;
  onStartFlashcard: (setId: string) => void;
}

export function QuizSetDetail({
  setId,
  onBack,
  onStartPractice,
  onStartExam,
  onStartFlashcard,
}: QuizSetDetailProps) {
  const [quizSet, setQuizSet] = useState<QuizSet | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const set = await quizSetRepo.getById(setId);
      if (set) setQuizSet(set);
      const list = await questionRepo.listBySet(setId);
      setQuestions(list);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [setId]);

  const handleExportJson = async () => {
    try {
      const jsonStr = await exportQuizSetToJson(setId);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `quizontap_${quizSet?.title || 'set'}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Lỗi khi xuất file backup:', err);
    }
  };

  const handleDeleteQuestion = async (qId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) {
      await questionRepo.delete(qId);
      loadData();
    }
  };

  if (isLoading || !quizSet) {
    return (
      <div className="py-12 text-center text-sm text-slate-500">
        Đang tải thông tin bộ đề...
      </div>
    );
  }

  const verifiedCount = questions.filter(q => q.answerStatus === 'verified').length;
  const suggestedCount = questions.filter(q => q.answerStatus === 'suggested').length;
  const answerableCount = verifiedCount + suggestedCount;
  const missingCount = questions.filter(q => q.answerStatus === 'missing').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Trở về Thư viện
          </button>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {quizSet.title}
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {quizSet.description || 'Chưa có mô tả'} • Cập nhật lúc {new Date(quizSet.updatedAt).toLocaleDateString('vi-VN')}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />} onClick={handleExportJson}>
            Xuất JSON
          </Button>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => {
              setEditingQuestion(null);
              setIsEditorOpen(true);
            }}
          >
            Thêm câu hỏi
          </Button>
        </div>
      </div>

      {/* Mode Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => onStartPractice(setId)}
          disabled={questions.length === 0}
          className="flex items-center gap-3.5 p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 dark:border-indigo-900/60 dark:bg-indigo-950/30 text-left hover:border-indigo-400 transition group disabled:opacity-50"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition">
            <Play className="w-5 h-5 ml-0.5" />
          </div>
          <div>
            <div className="text-sm font-bold text-indigo-950 dark:text-indigo-200">Luyện tập (Drill)</div>
            <div className="text-xs text-indigo-700/80 dark:text-indigo-400">Làm tự do, phản hồi ngay</div>
          </div>
        </button>

        <button
          onClick={() => onStartExam(setId)}
          disabled={answerableCount === 0}
          className="flex items-center gap-3.5 p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/60 dark:bg-emerald-950/30 text-left hover:border-emerald-400 transition group disabled:opacity-50"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-emerald-950 dark:text-emerald-200">Thi thử (Exam)</div>
            <div className="text-xs text-emerald-700/80 dark:text-emerald-400">Bấm giờ & ma trận ({answerableCount} câu)</div>
          </div>
        </button>

        <button
          onClick={() => onStartFlashcard(setId)}
          disabled={questions.length === 0}
          className="flex items-center gap-3.5 p-4 rounded-xl border border-amber-200 bg-amber-50/50 dark:border-amber-900/60 dark:bg-amber-950/30 text-left hover:border-amber-400 transition group disabled:opacity-50"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-amber-950 dark:text-amber-200">Flashcard 3D</div>
            <div className="text-xs text-amber-700/80 dark:text-amber-400">Lật thẻ ôn tập trí nhớ</div>
          </div>
        </button>
      </div>

      {/* KPI Stats */}
      <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
        <span>Tổng số: <strong className="text-slate-800 dark:text-slate-200">{questions.length}</strong> câu</span>
        <span>•</span>
        <span className="text-emerald-600">Có đáp án: <strong>{answerableCount}</strong> {suggestedCount > 0 && `(${verifiedCount} gốc + ${suggestedCount} AI gợi ý)`}</span>
        <span>•</span>
        <span className="text-amber-600">Cần bổ sung: <strong>{missingCount}</strong></span>
      </div>

      {/* Question List */}
      <div className="space-y-3">
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
                ) : q.answerStatus === 'suggested' ? (
                  <Badge variant="suggested">AI gợi ý</Badge>
                ) : (
                  <Badge variant="missing">Chưa có đáp án</Badge>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setEditingQuestion(q);
                    setIsEditorOpen(true);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Sửa câu hỏi"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteQuestion(q.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title="Xóa câu hỏi"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{q.text}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {q.options.map((opt, optIdx) => {
                const colorConfig = getOptionColor(optIdx);
                const isCorrect = q.correctOptionIds?.includes(opt.id);
                return (
                  <div
                    key={opt.id}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border ${
                      isCorrect
                        ? 'border-emerald-300 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/40 font-medium text-emerald-900 dark:text-emerald-200'
                        : 'border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span
                      className={`w-5 h-5 rounded-md inline-flex items-center justify-center text-[10px] font-bold shrink-0 ${
                        isCorrect
                          ? 'bg-emerald-500 text-white shadow-xs'
                          : colorConfig.badgeIdle
                      }`}
                    >
                      {colorConfig.letter}
                    </span>
                    <span className="pt-0.5 leading-snug">{opt.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <QuestionEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingQuestion(null);
        }}
        setId={setId}
        questionToEdit={editingQuestion}
        onSaved={loadData}
      />
    </div>
  );
}
