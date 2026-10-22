/**
 * 4 Signature Option Colors — A, B, C, D
 * Designed for Focused Learning Studio: distinctive, accessible, and elegant.
 */

export interface OptionColorConfig {
  letter: string;
  name: string;
  badgeIdle: string;
  cardHover: string;
  badgeSelected: string;
  cardSelected: string;
}

export const OPTION_COLORS: Record<number, OptionColorConfig> = {
  0: {
    letter: 'A',
    name: 'Rose',
    badgeIdle:
      'bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/70',
    cardHover:
      'hover:border-rose-300 hover:bg-rose-50/40 dark:hover:border-rose-800/80 dark:hover:bg-rose-950/20',
    badgeSelected:
      'bg-rose-600 text-white shadow-sm shadow-rose-500/30',
    cardSelected:
      'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100 ring-2 ring-rose-400/50 shadow-xs',
  },
  1: {
    letter: 'B',
    name: 'Sky',
    badgeIdle:
      'bg-sky-100 text-sky-700 border border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/70',
    cardHover:
      'hover:border-sky-300 hover:bg-sky-50/40 dark:hover:border-sky-800/80 dark:hover:bg-sky-950/20',
    badgeSelected:
      'bg-sky-600 text-white shadow-sm shadow-sky-500/30',
    cardSelected:
      'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 text-sky-950 dark:text-sky-100 ring-2 ring-sky-400/50 shadow-xs',
  },
  2: {
    letter: 'C',
    name: 'Amber',
    badgeIdle:
      'bg-amber-100 text-amber-800 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/70',
    cardHover:
      'hover:border-amber-300 hover:bg-amber-50/40 dark:hover:border-amber-800/80 dark:hover:bg-amber-950/20',
    badgeSelected:
      'bg-amber-600 text-white shadow-sm shadow-amber-500/30',
    cardSelected:
      'border-amber-500 bg-amber-50/70 dark:bg-amber-950/40 text-amber-950 dark:text-amber-100 ring-2 ring-amber-400/50 shadow-xs',
  },
  3: {
    letter: 'D',
    name: 'Emerald',
    badgeIdle:
      'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/70',
    cardHover:
      'hover:border-emerald-300 hover:bg-emerald-50/40 dark:hover:border-emerald-800/80 dark:hover:bg-emerald-950/20',
    badgeSelected:
      'bg-emerald-600 text-white shadow-sm shadow-emerald-500/30',
    cardSelected:
      'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 ring-2 ring-emerald-400/50 shadow-xs',
  },
};

export function getOptionColor(index: number): OptionColorConfig {
  if (OPTION_COLORS[index]) {
    return OPTION_COLORS[index];
  }
  const letter = String.fromCharCode(65 + index);
  return {
    letter,
    name: 'Indigo',
    badgeIdle:
      'bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/70',
    cardHover:
      'hover:border-indigo-300 hover:bg-indigo-50/40 dark:hover:border-indigo-800/80 dark:hover:bg-indigo-950/20',
    badgeSelected:
      'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30',
    cardSelected:
      'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-100 ring-2 ring-indigo-400/50 shadow-xs',
  };
}
