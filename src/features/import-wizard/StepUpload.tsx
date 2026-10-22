import { useState, ChangeEvent, DragEvent } from 'react';
import { UploadCloud, FileText, Clipboard, AlertCircle } from 'lucide-react';
import { Button } from '../../design/components/Button';

interface StepUploadProps {
  onAnalyze: (content: string, format: 'markdown' | 'csv') => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export function StepUpload({ onAnalyze, onCancel, isLoading = false }: StepUploadProps) {
  const [tab, setTab] = useState<'upload' | 'paste'>('upload');
  const [textInput, setTextInput] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    setErrorMsg('');
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['md', 'txt', 'csv'].includes(ext || '')) {
      setErrorMsg('Chỉ hỗ trợ file .md, .txt hoặc .csv');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        onAnalyze(content, ext === 'csv' ? 'csv' : 'markdown');
      }
    };
    reader.onerror = () => {
      setErrorMsg('Không thể đọc file. Vui lòng thử lại.');
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-xl mx-auto">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Kéo thả file hoặc dán văn bản
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Hỗ trợ bóc tách thông minh tài liệu Word/PDF đã xuất sang Markdown (.md), Text (.txt) hoặc bảng tính (.csv)
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => { setTab('upload'); setErrorMsg(''); }}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition ${
            tab === 'upload'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          Tải file lên
        </button>
        <button
          onClick={() => { setTab('paste'); setErrorMsg(''); }}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition ${
            tab === 'paste'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Clipboard className="w-4 h-4" />
          Dán văn bản
        </button>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-3 text-sm bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 rounded-xl border border-rose-200 dark:border-rose-900/60 max-w-xl mx-auto">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Upload Dropzone */}
      {tab === 'upload' && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-2xl transition max-w-xl mx-auto ${
            dragActive
              ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white/50 dark:bg-slate-900/40'
          }`}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-3 shadow-inner">
            <FileText className="w-7 h-7" />
          </div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            Kéo thả file .md, .txt hoặc .csv vào đây
          </p>
          <p className="mt-1 text-xs text-slate-400">hoặc bấm để chọn file từ máy</p>

          <label className="mt-4 cursor-pointer">
            <span className="rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 transition">
              Chọn file từ máy
            </span>
            <input
              type="file"
              accept=".md,.txt,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      )}

      {/* Bulk Textarea */}
      {tab === 'paste' && (
        <div className="max-w-xl mx-auto space-y-4">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            rows={10}
            placeholder="Dán nội dung câu hỏi tại đây... (Ví dụ: Câu 1: ... A. ... B. ... Đáp án: A)"
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition font-mono"
          />
          <div className="flex justify-end gap-2.5">
            {onCancel && (
              <Button variant="ghost" onClick={onCancel}>
                Hủy bỏ
              </Button>
            )}
            <Button
              variant="primary"
              disabled={textInput.trim().length === 0}
              isLoading={isLoading}
              onClick={() => onAnalyze(textInput, 'markdown')}
            >
              Phân tích tài liệu
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
