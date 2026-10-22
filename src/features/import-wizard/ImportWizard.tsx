import { useState } from 'react';
import type { QuestionDraft, ParseResult } from '../../import/types';
import { parseDocument } from '../../import/markdownParser';
import { parseCsv } from '../../import/csvParser';
import { quizSetRepo, questionRepo } from '../../db/repositories';
import type { Question, Option } from '../../domain/contracts';
import { StepUpload } from './StepUpload';
import { StepPreview } from './StepPreview';
import { StepInlineFix } from './StepInlineFix';

interface ImportWizardProps {
  onCompleted: (setId: string) => void;
  onCancel: () => void;
}

function generateUuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'uuid_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
}

export function ImportWizard({ onCompleted, onCancel }: ImportWizardProps) {
  const [step, setStep] = useState<'upload' | 'preview' | 'fix'>('upload');
  const [drafts, setDrafts] = useState<QuestionDraft[]>([]);
  const [editingDraft, setEditingDraft] = useState<QuestionDraft | null>(null);
  const [setTitle, setSetTitle] = useState('Bộ đề ôn tập mới');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAnalyze = (content: string, format: 'markdown' | 'csv') => {
    setIsLoading(true);
    try {
      let result: ParseResult;
      if (format === 'csv') {
        result = parseCsv(content);
      } else {
        result = parseDocument(content);
      }

      setDrafts(result.drafts);

      // Đặt tên đề mặc định dựa trên chương đầu tiên nếu có
      if (result.drafts.length > 0 && result.drafts[0].chapter) {
        setSetTitle(result.drafts[0].chapter);
      }

      setStep('preview');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveFixedDraft = (updated: QuestionDraft) => {
    setDrafts(prev => prev.map(d => d.tempId === updated.tempId ? updated : d));
    setEditingDraft(null);
    setStep('preview');
  };

  const handleCommit = async () => {
    if (drafts.length === 0) return;
    setIsSubmitting(true);

    try {
      // 1. Tạo QuizSet
      const newSet = await quizSetRepo.create({
        title: setTitle.trim() || 'Bộ đề ôn tập mới',
        description: `Nạp tự động ${drafts.length} câu hỏi`,
      });

      // 2. Chuyển đổi drafts thành Question domain models
      const questionsToSave: Question[] = [];
      const now = Date.now();

      for (let i = 0; i < drafts.length; i++) {
        const draft = drafts[i];
        
        // Tạo stable UUID cho từng option
        const labelToIdMap: Record<string, string> = {};
        const options: Option[] = draft.options.map(opt => {
          const optId = generateUuid();
          labelToIdMap[opt.label.toUpperCase()] = optId;
          return {
            id: optId,
            text: opt.text,
          };
        });

        // Ánh xạ detectedKeys sang option UUIDs
        let correctOptionIds: string[] | null = null;
        let answerStatus: Question['answerStatus'] = 'missing';

        if (draft.detectedKeys.length > 0) {
          const matchedIds = draft.detectedKeys
            .map(k => labelToIdMap[k.toUpperCase()])
            .filter(Boolean);

          if (matchedIds.length > 0) {
            correctOptionIds = matchedIds;
            answerStatus = 'verified';
          }
        }

        const question: Question = {
          id: generateUuid(),
          setId: newSet.id,
          kind: 'single',
          text: draft.questionText,
          options,
          correctOptionIds,
          answerStatus,
          answerOrigin: answerStatus === 'verified' ? 'source' : null,
          explanation: draft.explanation,
          chapterId: draft.chapter,
          tags: draft.chapter ? [draft.chapter] : [],
          source: {
            lineStart: draft.sourceLineStart,
            lineEnd: draft.sourceLineEnd,
          },
          createdAt: now,
          updatedAt: now,
        };

        questionsToSave.push(question);
      }

      // 3. Batch lưu vào IndexedDB
      await questionRepo.batchCreate(questionsToSave);

      // 4. Hoàn tất và chuyển hướng
      onCompleted(newSet.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-2">
      {step === 'upload' && (
        <StepUpload onAnalyze={handleAnalyze} onCancel={onCancel} isLoading={isLoading} />
      )}

      {step === 'preview' && (
        <StepPreview
          drafts={drafts}
          setTitle={setTitle}
          onSetTitleChange={setSetTitle}
          onEditDraft={(draft) => {
            setEditingDraft(draft);
            setStep('fix');
          }}
          onCommit={handleCommit}
          onBack={() => setStep('upload')}
          isSubmitting={isSubmitting}
        />
      )}

      {step === 'fix' && editingDraft && (
        <StepInlineFix
          draft={editingDraft}
          onSave={handleSaveFixedDraft}
          onCancel={() => {
            setEditingDraft(null);
            setStep('preview');
          }}
        />
      )}
    </div>
  );
}
