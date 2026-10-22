import { useState } from 'react';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';
import type { QuestionDraft } from '../../import/types';
import { Button } from '../../design/components/Button';
import { validateDraft } from '../../import/validator';

interface StepInlineFixProps {
  draft: QuestionDraft;
  onSave: (updated: QuestionDraft) => void;
  onCancel: () => void;
}

export function StepInlineFix({ draft, onSave, onCancel }: StepInlineFixProps) {
  const [questionText, setQuestionText] = useState(draft.questionText);
  const [chapter, setChapter] = useState(draft.chapter || '');
  const [explanation, setExplanation] = useState(draft.explanation || '');
  const [options, setOptions] = useState([...draft.options]);
  const [detectedKeys, setDetectedKeys] = useState<string[]>([...draft.detectedKeys]);

  const toggleKey = (label: string) => {
    if (detectedKeys.includes(label)) {
      setDetectedKeys(detectedKeys.filter(k => k !== label));
    } else {
      setDetectedKeys([label]); // Single choice mode mặc định
    }
  };

  const handleOptionChange = (idx: number, text: string) => {
    const updated = [...options];
    updated[idx] = { ...updated[idx], text };
    setOptions(updated);
  };

  const addOption = () => {
    const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
    const nextLabel = labels[options.length] || `Opt${options.length + 1}`;
    setOptions([...options, { label: nextLabel, text: '' }]);
  };

  const removeOption = (idx: number) => {
    const removedLabel = options[idx].label;
    const updated = options.filter((_, i) => i !== idx);
    setOptions(updated);
    setDetectedKeys(detectedKeys.filter(k => k !== removedLabel));
  };

  const handleSave = () => {
    const updatedDraft: QuestionDraft = {
      ...draft,
      questionText: questionText.trim(),
      chapter: chapter.trim() || undefined,
      explanation: explanation.trim() || undefined,
      options,
      detectedKeys,
    };
    updatedDraft.issues = validateDraft(updatedDraft);
    onSave(updatedDraft);
  };

  return (
    <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg space-y-5 max-w-2xl mx-auto">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Chỉnh sửa câu hỏi
        </h3>
        <span className="text-xs text-slate-400 font-mono">Dòng {draft.sourceLineStart}</span>
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
          Chương / Chủ đề
        </label>
        <input
          type="text"
          value={chapter}
          onChange={(e) => setChapter(e.target.value)}
          placeholder="Ví dụ: Chương 1. Tổng quan kinh tế học"
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
          Nội dung câu hỏi
        </label>
        <textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          rows={3}
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-3 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400">
            Các phương án lựa chọn (Click nút tròn để đặt đáp án đúng)
          </label>
          <button
            onClick={addOption}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" />
            Thêm phương án
          </button>
        </div>

        <div className="space-y-2">
          {options.map((opt, idx) => {
            const isCorrect = detectedKeys.includes(opt.label);
            return (
              <div key={opt.label || idx} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleKey(opt.label)}
                  title="Đặt làm đáp án đúng"
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-bold transition shrink-0 ${
                    isCorrect
                      ? 'border-emerald-500 bg-emerald-500 text-white shadow-sm'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  {isCorrect ? <CheckCircle2 className="w-4 h-4" /> : opt.label}
                </button>
                <input
                  type="text"
                  value={opt.text}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  placeholder={`Nội dung phương án ${opt.label}...`}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 px-3 py-1.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {options.length > 2 && (
                  <button
                    onClick={() => removeOption(idx)}
                    className="p-2 text-slate-400 hover:text-rose-500 transition"
                    title="Xóa phương án này"
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
          placeholder="Nhập lý do, công thức hoặc số điều luật..."
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <Button variant="outline" onClick={onCancel}>
          Hủy bỏ
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Lưu thay đổi
        </Button>
      </div>
    </div>
  );
}
