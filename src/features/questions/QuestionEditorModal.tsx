import { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';
import type { Question, Option } from '@/domain/contracts';
import { Modal } from '@/design/components/Modal';
import { Button } from '@/design/components/Button';
import { questionRepo } from '@/db/repositories';

interface QuestionEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  setId: string;
  questionToEdit?: Question | null;
  onSaved: () => void;
}

function generateUuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'opt_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
}

export function QuestionEditorModal({
  isOpen,
  onClose,
  setId,
  questionToEdit,
  onSaved,
}: QuestionEditorModalProps) {
  const [text, setText] = useState('');
  const [chapter, setChapter] = useState('');
  const [explanation, setExplanation] = useState('');
  const [options, setOptions] = useState<Option[]>([
    { id: generateUuid(), text: '' },
    { id: generateUuid(), text: '' },
    { id: generateUuid(), text: '' },
    { id: generateUuid(), text: '' },
  ]);
  const [correctOptionIds, setCorrectOptionIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (questionToEdit) {
      setText(questionToEdit.text);
      setChapter(questionToEdit.chapterId || (questionToEdit.tags && questionToEdit.tags[0]) || '');
      setExplanation(questionToEdit.explanation || '');
      setOptions(questionToEdit.options.map(o => ({ ...o })));
      setCorrectOptionIds(questionToEdit.correctOptionIds || []);
    } else {
      setText('');
      setChapter('');
      setExplanation('');
      setOptions([
        { id: generateUuid(), text: '' },
        { id: generateUuid(), text: '' },
        { id: generateUuid(), text: '' },
        { id: generateUuid(), text: '' },
      ]);
      setCorrectOptionIds([]);
    }
  }, [questionToEdit, isOpen]);

  const toggleCorrectOption = (optId: string) => {
    if (correctOptionIds.includes(optId)) {
      setCorrectOptionIds(correctOptionIds.filter(id => id !== optId));
    } else {
      setCorrectOptionIds([optId]); // single choice mode
    }
  };

  const handleOptionChange = (idx: number, val: string) => {
    const updated = [...options];
    updated[idx] = { ...updated[idx], text: val };
    setOptions(updated);
  };

  const addOption = () => {
    setOptions([...options, { id: generateUuid(), text: '' }]);
  };

  const removeOption = (idx: number) => {
    const removedId = options[idx].id;
    setOptions(options.filter((_, i) => i !== idx));
    setCorrectOptionIds(correctOptionIds.filter(id => id !== removedId));
  };

  const handleSave = async () => {
    if (!text.trim()) return;
    setIsSubmitting(true);
    try {
      const validOptions = options.filter(o => o.text.trim().length > 0);
      const isVerified = correctOptionIds.length > 0;
      const now = Date.now();

      const questionData: Question = {
        id: questionToEdit ? questionToEdit.id : generateUuid(),
        setId,
        kind: 'single',
        text: text.trim(),
        options: validOptions,
        correctOptionIds: isVerified ? correctOptionIds : null,
        answerStatus: isVerified ? 'verified' : 'missing',
        answerOrigin: isVerified ? 'manual' : null,
        explanation: explanation.trim() || undefined,
        chapterId: chapter.trim() || undefined,
        tags: chapter.trim() ? [chapter.trim()] : [],
        createdAt: questionToEdit ? questionToEdit.createdAt : now,
        updatedAt: now,
      };

      if (questionToEdit) {
        await questionRepo.update(questionToEdit.id, questionData);
      } else {
        await questionRepo.create(questionData);
      }

      onSaved();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={questionToEdit ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}
      maxWidth="xl"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Hủy bỏ
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!text.trim() || options.filter(o => o.text.trim()).length < 2}
            isLoading={isSubmitting}
          >
            Lưu câu hỏi
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Chương / Phân loại
          </label>
          <input
            type="text"
            value={chapter}
            onChange={(e) => setChapter(e.target.value)}
            placeholder="Ví dụ: Chương 1. Khái quát"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 px-3.5 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Nội dung câu hỏi *
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="Nhập nội dung câu hỏi..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
              Các phương án lựa chọn (Click nút tròn để đặt đáp án đúng)
            </label>
            <button
              type="button"
              onClick={addOption}
              className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              Thêm phương án
            </button>
          </div>

          <div className="space-y-2">
            {options.map((opt, idx) => {
              const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
              const label = labels[idx] || `${idx + 1}`;
              const isCorrect = correctOptionIds.includes(opt.id);

              return (
                <div key={opt.id} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleCorrectOption(opt.id)}
                    title="Đặt làm đáp án đúng"
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-bold transition shrink-0 ${
                      isCorrect
                        ? 'border-emerald-500 bg-emerald-500 text-white shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : label}
                  </button>
                  <input
                    type="text"
                    value={opt.text}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`Phương án ${label}...`}
                    className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 px-3 py-1.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => removeOption(idx)}
                      className="p-2 text-slate-400 hover:text-rose-500 transition"
                      title="Xóa phương án"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Lời giải thích / Căn cứ
          </label>
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            rows={2}
            placeholder="Giải thích lý do vì sao đáp án đúng..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
    </Modal>
  );
}
