import { useState, useEffect, useCallback } from 'react';
import { AppShell } from './app/AppShell';
import { ErrorBoundary } from './app/ErrorBoundary';
import { AppRoute } from './app/routes';
import type { Question, StudyProgress, StudySessionResult } from './domain/contracts';
import { quizDb } from './db/quizDb';
import { ensureCanonicalDefaultSet, DEFAULT_SET_ID } from './data/seedDefaultData';
import { getCanonicalQuestions } from './data/canonicalQuizData';
import { createStudySession, calculateStudyResult } from './domain/studyEngine';
import { StudyLanding } from './features/study/StudyLanding';
import { StudySessionView } from './features/study/StudySessionView';
import { StudyResultView } from './features/study/StudyResultView';
import { InsightsView } from './features/study/InsightsView';
import { ReleaseNotesView } from './features/releases/ReleaseNotesView';

export function App() {
  const [currentPath, setCurrentPath] = useState<AppRoute>('/');
  const [canonicalQuestions, setCanonicalQuestions] = useState<Question[]>([]);
  const [activeSession, setActiveSession] = useState<StudyProgress | null>(null);
  const [activeResult, setActiveResult] = useState<StudySessionResult | null>(null);
  const [lastInProgressSession, setLastInProgressSession] = useState<StudyProgress | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Initialize canonical database and find latest active session
  const initApp = useCallback(async () => {
    try {
      await ensureCanonicalDefaultSet();
      const questions = getCanonicalQuestions();
      setCanonicalQuestions(questions);

      // Check for in-progress session
      const inProg = await quizDb.studyProgress
        .where('status')
        .equals('in-progress')
        .reverse()
        .first();

      setLastInProgressSession(inProg || null);
    } catch (err) {
      console.error('Lỗi khi khởi động QuizOnTap V3:', err);
    } finally {
      setIsReady(true);
    }
  }, []);

  useEffect(() => {
    initApp();
  }, [initApp]);

  // Handle deep-links or legacy routes gracefully
  const handleNavigate = (path: string) => {
    if (path === '/insights') {
      setCurrentPath('/insights');
    } else if (path === '/releases') {
      setCurrentPath('/releases');
    } else {
      // Any other path (/library, /import, /review, etc.) maps safely to Home
      setCurrentPath('/');
    }
  };

  const handleStartNewStudy = async () => {
    const sessionId = `study_${Date.now()}`;
    const newSession = createStudySession(sessionId, DEFAULT_SET_ID, canonicalQuestions, Date.now());

    await quizDb.studyProgress.put(newSession);
    setActiveSession(newSession);
    setActiveResult(null);
    setLastInProgressSession(newSession);
    setCurrentPath('/');
  };

  const handleResumeStudy = async () => {
    if (!lastInProgressSession) {
      await handleStartNewStudy();
      return;
    }
    setActiveSession(lastInProgressSession);
    setActiveResult(null);
    setCurrentPath('/');
  };

  const handleFinishStudy = async (completedSession: StudyProgress) => {
    try {
      const attempts = await quizDb.answerAttempts
        .where('sessionId')
        .equals(completedSession.sessionId)
        .toArray();

      const result = calculateStudyResult(completedSession, attempts, canonicalQuestions);
      setActiveResult(result);
      setActiveSession(null);
      setLastInProgressSession(null);
      setCurrentPath('/');
    } catch (err) {
      console.error('Lỗi khi tính toán kết quả:', err);
    }
  };

  const handleSelectSessionFromHistory = async (session: StudyProgress) => {
    if (session.status === 'completed') {
      const attempts = await quizDb.answerAttempts
        .where('sessionId')
        .equals(session.sessionId)
        .toArray();

      const result = calculateStudyResult(session, attempts, canonicalQuestions);
      setActiveResult(result);
      setActiveSession(null);
      setCurrentPath('/');
    } else {
      setActiveSession(session);
      setActiveResult(null);
      setLastInProgressSession(session);
      setCurrentPath('/');
    }
  };

  if (!isReady) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-sm font-semibold text-slate-500">
        Đang khởi động không gian học tập Kinh tế học và Môi trường...
      </div>
    );
  }

  // Active Study Session View (Full focus)
  if (activeSession && currentPath === '/') {
    return (
      <ErrorBoundary>
        <AppShell currentPath={currentPath} onNavigate={handleNavigate}>
          <StudySessionView
            initialSession={activeSession}
            allQuestions={canonicalQuestions}
            onFinish={handleFinishStudy}
            onExit={async () => {
              // Persist and return to landing
              const updated = await quizDb.studyProgress.get(activeSession.sessionId);
              setLastInProgressSession(updated || null);
              setActiveSession(null);
            }}
          />
        </AppShell>
      </ErrorBoundary>
    );
  }

  // Active Result View
  if (activeResult && currentPath === '/') {
    return (
      <ErrorBoundary>
        <AppShell currentPath={currentPath} onNavigate={handleNavigate}>
          <StudyResultView
            result={activeResult}
            allQuestions={canonicalQuestions}
            onStartNew={handleStartNewStudy}
            onBackToHome={() => {
              setActiveResult(null);
              initApp();
            }}
          />
        </AppShell>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <AppShell currentPath={currentPath} onNavigate={handleNavigate}>
        {currentPath === '/insights' ? (
          <InsightsView
            onSelectSession={handleSelectSessionFromHistory}
            onStartNew={handleStartNewStudy}
          />
        ) : currentPath === '/releases' ? (
          <ReleaseNotesView />
        ) : (
          <StudyLanding
            currentSession={lastInProgressSession}
            onStartNew={handleStartNewStudy}
            onResume={handleResumeStudy}
            onViewStats={() => setCurrentPath('/insights')}
          />
        )}
      </AppShell>
    </ErrorBoundary>
  );
}

export default App;
