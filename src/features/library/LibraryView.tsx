import { useState } from 'react';
import { BookOpen, Plus, FileUp, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import type { QuizSet } from '@/domain/contracts';
import { quizSetRepo } from '@/db/repositories';
import { Button } from '@/design/components/Button';
import { Modal } from '@/design/components/Modal';

interface LibraryViewProps {
  quizSets: QuizSet[];
  onSelectSet: (setId: string) => void;
  onOpenImport: () => void;
  onRefresh: () => void;
  onSeedDefault?: () => Promise<void>;
}

export function LibraryView({
  quizSets,
  onSelectSet,
  onOpenImport,
  onRefresh,
  onSeedDefault,
}: LibraryViewProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setIsSubmitting(true);
    try {
      const created = await quizSetRepo.create({
        title: newTitle.trim(),
        description: newDesc.trim() || undefined,
      });
      setIsCreateOpen(false);
      setNewTitle('');
      setNewDesc('');
      onRefresh();
      onSelectSet(created.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (setId: string, title: string) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa bộ đề "${title}" và toàn bộ câu hỏi liên quan?`)) {
      await quizSetRepo.delete(setId);
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Thư viện bộ đề ôn tập
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Quản lý các môn học, ngân hàng câu hỏi và các đề thi thử
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onSeedDefault && (
            <Button
              variant="secondary"
              leftIcon={<Sparkles className="w-4 h-4 text-indigo-500" />}
              onClick={onSeedDefault}
              className="hidden sm:inline-flex"
            >
              Nạp đề 179 câu mẫu
            </Button>
          )}
          <Button variant="outline" leftIcon={<FileUp className="w-4 h-4" />} onClick={onOpenImport}>
            Nhập đề
          </Button>
          <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsCreateOpen(true)}>
            Tạo bộ đề mới
          </Button>
        </div>
      </div>

      {/* Empty State */}
      {quizSets.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 my-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-4 shadow-inner">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Chưa có bộ đề nào trong thư viện
          </h3>
          <p className="mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400">
            Hãy bắt đầu bằng cách nhập câu hỏi từ tài liệu Word/PDF đã có hoặc nạp bộ đề mẫu có sẵn.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            {onSeedDefault && (
              <Button
                variant="primary"
                leftIcon={<Sparkles className="w-4 h-4 text-amber-300" />}
                onClick={onSeedDefault}
              >
                Nạp đề Kinh tế & Môi trường (179 câu)
              </Button>
            )}
            <Button variant="outline" leftIcon={<FileUp className="w-4 h-4" />} onClick={onOpenImport}>
              Nhập bộ đề ngay
            </Button>
            <Button variant="secondary" onClick={() => setIsCreateOpen(true)}>
              Tạo đề trống
            </Button>
          </div>
        </div>
      ) : (
        /* Quiz Sets Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizSets.map((set) => (
            <div
              key={set.id}
              className="flex flex-col justify-between p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition leading-snug">
                    {set.title}
                  </h3>
                  <button
                    onClick={() => handleDelete(set.id, set.title)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition shrink-0"
                    title="Xóa bộ đề"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {set.description && (
                  <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {set.description}
                  </p>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {new Date(set.updatedAt).toLocaleDateString('vi-VN')}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  rightIcon={<ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />}
                  onClick={() => onSelectSet(set.id)}
                >
                  Mở bộ đề
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal tạo bộ đề */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Tạo bộ đề ôn tập mới"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Hủy
            </Button>
            <Button
              variant="primary"
              onClick={handleCreate}
              disabled={!newTitle.trim()}
              isLoading={isSubmitting}
            >
              Tạo bộ đề
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Tên bộ đề *
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Ví dụ: Kinh tế học vi mô ôn thi kỳ 1"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Mô tả ngắn
            </label>
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              rows={2}
              placeholder="Ghi chú về nguồn câu hỏi, năm học..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
