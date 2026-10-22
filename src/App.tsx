import { useState } from 'react';
import { AppShell } from './app/AppShell';
import { ErrorBoundary } from './app/ErrorBoundary';
import { AppRoute } from './app/routes';

export function App() {
  const [currentPath, setCurrentPath] = useState<AppRoute>('/');

  return (
    <ErrorBoundary>
      <AppShell currentPath={currentPath} onNavigate={(path) => setCurrentPath(path)}>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-4 shadow-sm">
            <span className="text-2xl font-black">Q</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Chào mừng bạn đến với QuizOnTap V2
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-md">
            Hệ thống ôn tập trắc nghiệm thông minh, chạy cục bộ 100% trên máy tính. Dữ liệu của bạn luôn an toàn và riêng tư.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => setCurrentPath('/import')}
              className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/25 hover:bg-indigo-700 transition"
            >
              Nhập bộ đề đầu tiên
            </button>
            <button
              onClick={() => setCurrentPath('/library')}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
            >
              Xem thư viện đề
            </button>
          </div>
        </div>
      </AppShell>
    </ErrorBoundary>
  );
}

export default App;
