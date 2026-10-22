import { useState, useEffect, useCallback } from 'react';
import { AppShell } from './app/AppShell';
import { ErrorBoundary } from './app/ErrorBoundary';
import { AppRoute } from './app/routes';
import type { QuizSet, Question, ExamResult } from './domain/contracts';
import { quizSetRepo, questionRepo, resultRepo } from './db/repositories';
import { scoreExam } from './domain/scoring';
import { LibraryView } from './features/library/LibraryView';
import { QuizSetDetail } from './features/library/QuizSetDetail';
import { ImportWizard } from './features/import-wizard/ImportWizard';
import { PracticeView } from './features/practice/PracticeView';
import { ExamView } from './features/exam/ExamView';
import { ExamResultView } from './features/results/ExamResultView';
import { MistakeReviewView } from './features/review/MistakeReviewView';
import { FlashcardView } from './features/flashcards/FlashcardView';
import { playTone } from './gamification/audioSynth';
import { triggerConfetti } from './gamification/confettiEffect';
import { calculateStreak } from './gamification/streakTracker';
import { Card } from './design/components/Card';
import { Button } from './design/components/Button';
import { Badge } from './design/components/Badge';
import { BookOpen, Flame, Award, Sparkles, Layers, ArrowRight, Upload } from 'lucide-react';
import { seedDefaultQuizSet } from './data/seedDefaultData';

type ActiveMode = 'none' | 'practice' | 'exam' | 'results' | 'review' | 'flashcard';

export function App() {
  const [currentPath, setCurrentPath] = useState<AppRoute>('/');
  const [quizSets, setQuizSets] = useState<QuizSet[]>([]);
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<ActiveMode>('none');
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [lastExamResult, setLastExamResult] = useState<ExamResult | null>(null);
  const [lastExamAnswers, setLastExamAnswers] = useState<Record<string, string[]>>({});
  const [streakInfo, setStreakInfo] = useState<{ streak: number; updatedDate: string }>({
    streak: 1,
    updatedDate: new Date().toISOString().split('T')[0],
  });

  const loadSets = useCallback(async () => {
    let list = await quizSetRepo.listAll();
    if (list.length === 0) {
      await seedDefaultQuizSet();
      list = await quizSetRepo.listAll();
    }
    setQuizSets(list);
  }, []);

  useEffect(() => {
    loadSets();

    // Load streak from localStorage
    try {
      const savedDate = localStorage.getItem('quizontap_last_study_date');
      const savedStreak = parseInt(localStorage.getItem('quizontap_streak') || '0', 10);
      const calculated = calculateStreak(savedDate, savedStreak);
      setStreakInfo(calculated);
      localStorage.setItem('quizontap_last_study_date', calculated.updatedDate);
      localStorage.setItem('quizontap_streak', calculated.streak.toString());
    } catch {
      // LocalStorage fallback
    }
  }, [loadSets]);

  const handleSeedDefault = async () => {
    const id = await seedDefaultQuizSet();
    await loadSets();
    setSelectedSetId(id);
    setCurrentPath('/library');
  };

  const handleStartMode = async (
    setId: string,
    mode: 'practice' | 'exam' | 'flashcard'
  ) => {
    const questions = await questionRepo.listBySet(setId);
    if (questions.length === 0) {
      alert('Bộ đề này chưa có câu hỏi nào. Hãy thêm câu hỏi hoặc nhập từ file.');
      return;
    }
    setActiveQuestions(questions);
    setActiveMode(mode);
  };

  const handleExamSubmit = async (
    answers: Record<string, string[]>,
    _durationSpentSeconds: number
  ) => {
    const sessionId = `ses_${Date.now()}`;
    const result = scoreExam(sessionId, activeQuestions, answers);
    setLastExamResult(result);
    setLastExamAnswers(answers);

    // Save result to DB
    await resultRepo.save(result);

    // Audio & Confetti
    if ((result.percent ?? 0) >= 80) {
      playTone('victory');
      triggerConfetti();
    } else {
      playTone('click');
    }

    setActiveMode('results');
  };

  const mistakeQuestions = activeQuestions.filter((q) => {
    if (!lastExamResult) return false;
    const userAns = lastExamAnswers[q.id] ?? [];
    if (!q.correctOptionIds || q.correctOptionIds.length === 0) return false;
    // Check if user answer matches correct
    if (userAns.length !== q.correctOptionIds.length) return true;
    return !userAns.every((id) => q.correctOptionIds?.includes(id));
  });

  // RENDER MODAL / ACTIVE STUDY SCREEN
  if (activeMode === 'practice') {
    return (
      <ErrorBoundary>
        <AppShell currentPath="/library" onNavigate={(path) => setCurrentPath(path)}>
          <PracticeView
            questions={activeQuestions}
            onFinish={() => {
              playTone('victory');
              setActiveMode('none');
            }}
            onExit={() => setActiveMode('none')}
          />
        </AppShell>
      </ErrorBoundary>
    );
  }

  if (activeMode === 'exam') {
    return (
      <ErrorBoundary>
        <AppShell currentPath="/library" onNavigate={(path) => setCurrentPath(path)}>
          <ExamView
            questions={activeQuestions}
            durationMinutes={Math.max(5, Math.ceil(activeQuestions.length * 0.75))}
            onSubmit={handleExamSubmit}
            onExit={() => {
              if (window.confirm('Bạn có chắc muốn thoát bài thi dở dang?')) {
                setActiveMode('none');
              }
            }}
          />
        </AppShell>
      </ErrorBoundary>
    );
  }

  if (activeMode === 'results' && lastExamResult) {
    return (
      <ErrorBoundary>
        <AppShell currentPath="/library" onNavigate={(path) => setCurrentPath(path)}>
          <ExamResultView
            result={lastExamResult}
            questions={activeQuestions}
            answers={lastExamAnswers}
            onRetry={() => setActiveMode('exam')}
            onReviewMistakes={() => setActiveMode('review')}
            onGoHome={() => setActiveMode('none')}
          />
        </AppShell>
      </ErrorBoundary>
    );
  }

  if (activeMode === 'review') {
    return (
      <ErrorBoundary>
        <AppShell currentPath="/library" onNavigate={(path) => setCurrentPath(path)}>
          <MistakeReviewView
            questions={mistakeQuestions}
            userAnswers={lastExamAnswers}
            onBack={() => setActiveMode('results')}
          />
        </AppShell>
      </ErrorBoundary>
    );
  }

  if (activeMode === 'flashcard') {
    return (
      <ErrorBoundary>
        <AppShell currentPath="/library" onNavigate={(path) => setCurrentPath(path)}>
          <FlashcardView
            questions={activeQuestions}
            onFinish={() => setActiveMode('none')}
            onExit={() => setActiveMode('none')}
          />
        </AppShell>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <AppShell
        currentPath={currentPath}
        onNavigate={(path) => {
          setSelectedSetId(null);
          setCurrentPath(path);
        }}
      >
        {/* IMPORT ROUTE */}
        {currentPath === '/import' && (
          <ImportWizard
            onCompleted={(setId: string) => {
              loadSets();
              setSelectedSetId(setId);
              setCurrentPath('/library');
            }}
            onCancel={() => setCurrentPath('/library')}
          />
        )}

        {/* LIBRARY ROUTE */}
        {currentPath === '/library' && (
          selectedSetId ? (
            <QuizSetDetail
              setId={selectedSetId}
              onBack={() => setSelectedSetId(null)}
              onStartPractice={(id) => handleStartMode(id, 'practice')}
              onStartExam={(id) => handleStartMode(id, 'exam')}
              onStartFlashcard={(id) => handleStartMode(id, 'flashcard')}
            />
          ) : (
            <LibraryView
              quizSets={quizSets}
              onSelectSet={(id) => setSelectedSetId(id)}
              onOpenImport={() => setCurrentPath('/import')}
              onRefresh={loadSets}
              onSeedDefault={handleSeedDefault}
            />
          )
        )}

        {/* HOME / DASHBOARD ROUTE */}
        {currentPath === '/' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Hero Welcome */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 p-8 text-white shadow-lg border border-indigo-500/20">
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold mb-4">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Focused Learning Studio • Chạy offline 100%</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Ôn tập trắc nghiệm thông minh với QuizOnTap
                </h1>
                <p className="mt-2 text-sm sm:text-base text-primary-100 leading-relaxed">
                  Luyện tập phản hồi tức thì, thi thử có bấm giờ deadline, lật thẻ Flashcard 3D và bảo mật tuyệt đối trên trình duyệt của bạn.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Button
                    variant="secondary"
                    onClick={handleSeedDefault}
                    leftIcon={<Sparkles className="w-4 h-4 text-amber-500" />}
                    className="!bg-white !text-indigo-700 hover:!bg-indigo-50 shadow-md font-bold"
                  >
                    Ôn tập ngay: Kinh tế học & Môi trường (179 câu)
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentPath('/import')}
                    leftIcon={<Upload className="w-4 h-4" />}
                    className="!text-white hover:!bg-white/10"
                  >
                    Nhập bộ đề mới
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setCurrentPath('/library')}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    className="!text-white hover:!bg-white/10"
                  >
                    Thư viện ({quizSets.length} đề)
                  </Button>
                </div>
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="p-5 flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Chuỗi ngày học liên tục</div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                    {streakInfo.streak} ngày 🔥
                  </div>
                </div>
              </Card>

              <Card className="p-5 flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-950/60 dark:text-primary-400">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Bộ đề trong thư viện</div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                    {quizSets.length} bộ đề
                  </div>
                </div>
              </Card>

              <Card className="p-5 flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Chế độ sẵn sàng</div>
                  <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-1 flex items-center gap-1">
                    <Badge variant="verified">Luyện tập</Badge>
                    <Badge variant="verified">Thi thử</Badge>
                    <Badge variant="verified">Flashcard</Badge>
                  </div>
                </div>
              </Card>
            </div>

            {/* Recent Sets section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary-600" />
                  <span>Bộ đề ôn tập gần đây</span>
                </h3>
                {quizSets.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPath('/library')}
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                  >
                    Xem tất cả
                  </Button>
                )}
              </div>

              {quizSets.length === 0 ? (
                <Card className="p-8 text-center space-y-3">
                  <div className="inline-flex p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                    Bạn chưa có bộ đề nào trong thư viện.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setCurrentPath('/import')}
                    leftIcon={<Upload className="w-4 h-4" />}
                  >
                    Nhập bộ đề ngay
                  </Button>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {quizSets.slice(0, 4).map((set) => (
                    <Card
                      key={set.id}
                      className="p-5 hover:border-primary-400 dark:hover:border-primary-600 transition-all cursor-pointer flex flex-col justify-between"
                      onClick={() => {
                        setSelectedSetId(set.id);
                        setCurrentPath('/library');
                      }}
                    >
                      <div>
                        <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
                          {set.title}
                        </h4>
                        <p className="text-xs text-slate-500 line-clamp-2">
                          {set.description || 'Chưa có mô tả cho bộ đề này.'}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="text-primary-600 dark:text-primary-400 font-semibold flex items-center gap-1">
                          Vào ôn tập <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                        <span className="text-slate-400">
                          {new Date(set.updatedAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </AppShell>
    </ErrorBoundary>
  );
}

export default App;
