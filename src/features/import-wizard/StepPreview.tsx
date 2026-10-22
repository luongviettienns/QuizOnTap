import { useState } from 'react';
import { CheckCircle2, AlertTriangle, FileQuestion, Edit3 } from 'lucide-react';
import type { QuestionDraft } from '../../import/types';
import { Badge } from '../../design/components/Badge';
import { Button } from '../../design/components/Button';

interface StepPreviewProps {
  drafts: QuestionDraft[];
  setTitle: string;
  onSetTitleChange: (title: string) => void;
  onEditDraft: (draft: QuestionDraft) => void;
  onCommit: () => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

export function StepPreview({
  drafts,
  setTitle,
  onSetTitleChange,
  onEditDraft,
  onCommit,
  onBack,
  isSubmitting = false,
}: StepPreviewProps) {
  const [filter, setFilter] = useState<'all' | 'verified' | 'missing' | 'issues'>('all');

  const verifiedCount = drafts.filter(d => d.detectedKeys.length > 0).length;
  const missingCount = drafts.filter(d => d.detectedKeys.length === 0).length;
  const issueCount = drafts.filter(d => d.issues.length > 0).length;

  const filteredDrafts = drafts.filter(d => {
    if (filter === 'verified') return d.detectedKeys.length > 0;
    if (filter === 'missing') return d.detectedKeys.length === 0;
    if (filter === 'issues') return d.issues.length > 0;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Title & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
            Tên bộ đề ôn tập
          </label>
          <input
            type="text"
            value={setTitle}
            onChange={(e) => onSetTitleChange(e.target.value)}
            placeholder="Nhập tên bộ đề..."
            className="w-full text-lg font-bold bg-transparent text-slate-900 dark:text-white border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-indigo-600 focus:outline-none transition pb-0.5"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
            Quay lại
          </Button>
          <Button variant="primary" onClick={onCommit} isLoading={isSubmitting}>
            Lưu vào thư viện ({drafts.length} câu)
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button
          onClick={() => setFilter('all')}
          className={`p-4 rounded-xl border text-left transition ${
            filter === 'all'
              ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Phát hiện</span>
            <FileQuestion className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold mt-1 text-slate-900 dark:text-white">
            {drafts.length} câu phát hiện
          </div>
        </button>

        <button
          onClick={() => setFilter('verified')}
          className={`p-4 rounded-xl border text-left transition ${
            filter === 'verified'
              ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600">Có đáp án</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold mt-1 text-emerald-700 dark:text-emerald-400">
            {verifiedCount} có đáp án
          </div>
        </button>

        <button
          onClick={() => setFilter('missing')}
          className={`p-4 rounded-xl border text-left transition ${
            filter === 'missing'
              ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600">Cần bổ sung</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold mt-1 text-amber-700 dark:text-amber-400">
            {missingCount} câu thiếu
          </div>
        </button>

        <button
          onClick={() => setFilter('issues')}
          className={`p-4 rounded-xl border text-left transition ${
            filter === 'issues'
              ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600">Cảnh báo / Lỗi</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-xl font-bold mt-1 text-rose-700 dark:text-rose-400">
            {issueCount} câu
          </div>
        </button>
      </div>

      {/* Draft Questions List */}
      <div className="space-y-3">
        {filteredDrafts.map((draft, idx) => {
          const hasKeys = draft.detectedKeys.length > 0;
          return (
            <div
              key={draft.tempId || idx}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-slate-400 font-mono">
                    #{idx + 1}
                  </span>
                  {draft.chapter && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {draft.chapter}
                    </span>
                  )}
                  {hasKeys ? (
                    <Badge variant="verified">Đáp án: {draft.detectedKeys.join(', ')}</Badge>
                  ) : (
                    <Badge variant="missing">Chưa có đáp án</Badge>
                  )}
                  {draft.issues.length > 0 && (
                    <Badge variant="warning">{draft.issues.length} cảnh báo</Badge>
                  )}
                </div>

                <button
                  onClick={() => onEditDraft(draft)}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 p-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Sửa câu này
                </button>
              </div>

              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                {draft.questionText}
              </p>

              {/* Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {draft.options.map((opt) => {
                  const isKey = draft.detectedKeys.includes(opt.label);
                  return (
                    <div
                      key={opt.label}
                      className={`flex items-start gap-2 p-2.5 rounded-xl border transition ${
                        isKey
                          ? 'border-emerald-300 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/40 font-medium text-emerald-900 dark:text-emerald-200'
                          : 'border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/40 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span className="font-bold shrink-0">{opt.label}.</span>
                      <span className="flex-1">{opt.text}</span>
                    </div>
                  );
                })}
              </div>

              {draft.explanation && (
                <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Giải thích: </span>
                  {draft.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
