import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface ExamTimerProps {
  deadlineEpochMs: number;
  onTimeUp: () => void;
}

export function ExamTimer({ deadlineEpochMs, onTimeUp }: ExamTimerProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(() => {
    return Math.max(0, Math.floor((deadlineEpochMs - Date.now()) / 1000));
  });

  useEffect(() => {
    const updateTimer = () => {
      const remaining = Math.max(0, Math.floor((deadlineEpochMs - Date.now()) / 1000));
      setRemainingSeconds(remaining);
      if (remaining <= 0) {
        onTimeUp();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [deadlineEpochMs, onTimeUp]);

  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  const formattedTime =
    hours > 0
      ? `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      : `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isCritical = remainingSeconds <= 60;
  const isWarning = remainingSeconds <= 300 && remainingSeconds > 60;

  return (
    <div
      role="timer"
      aria-label="Thời gian còn lại"
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-mono text-sm font-bold border transition-colors ${
        isCritical
          ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-800 animate-pulse'
          : isWarning
          ? 'bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-800'
          : 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700'
      }`}
    >
      <Clock className={`w-4 h-4 ${isCritical ? 'text-rose-600 dark:text-rose-400' : ''}`} />
      <span>{formattedTime}</span>
    </div>
  );
}
