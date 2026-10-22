import { ReactNode, useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  FileUp, 
  RotateCcw, 
  BarChart2, 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX, 
  Sparkles 
} from 'lucide-react';
import { AppRoute, MAIN_NAV_ITEMS } from './routes';

interface AppShellProps {
  currentPath: string;
  onNavigate: (path: AppRoute) => void;
  children: ReactNode;
}

export function AppShell({ currentPath, onNavigate, children }: AppShellProps) {
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('quizontap_theme') === 'dark';
  });
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    return localStorage.getItem('quizontap_mute') === 'true';
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('quizontap_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('quizontap_theme', 'light');
    }
  }, [isDark]);

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    localStorage.setItem('quizontap_mute', String(next));
  };

  const renderIcon = (name: string, className = 'w-5 h-5') => {
    switch (name) {
      case 'LayoutDashboard': return <LayoutDashboard className={className} />;
      case 'BookOpen': return <BookOpen className={className} />;
      case 'FileUp': return <FileUp className={className} />;
      case 'RotateCcw': return <RotateCcw className={className} />;
      case 'BarChart2': return <BarChart2 className={className} />;
      default: return <Sparkles className={className} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-4 shrink-0">
        <div className="flex items-center gap-2.5 px-3 py-4 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/20">
            Q
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
              QuizOnTap
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Focused Studio V2</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {MAIN_NAV_ITEMS.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.path)}
                className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60'
                }`}
              >
                {renderIcon(item.iconName, `w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : ''}`)}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Controls */}
        <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex items-center justify-between px-2">
          <button
            onClick={() => setIsDark(!isDark)}
            aria-label="Toggle theme"
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            onClick={toggleSound}
            aria-label="Toggle sound"
            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-sm">
              Q
            </div>
            <span className="font-bold text-slate-900 dark:text-white">QuizOnTap</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsDark(!isDark)}
              aria-label="Toggle theme"
              className="p-2 text-slate-500 dark:text-slate-400"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={toggleSound}
              aria-label="Toggle sound"
              className="p-2 text-slate-500 dark:text-slate-400"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-6">
          <div className="max-w-[1200px] mx-auto p-4 md:p-8">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur flex justify-around p-2 z-30">
          {MAIN_NAV_ITEMS.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.path)}
                className={`flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-xs font-medium transition ${
                  isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {renderIcon(item.iconName, 'w-5 h-5')}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
