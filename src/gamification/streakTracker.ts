export interface StreakResult {
  streak: number;
  updatedDate: string;
}

/**
 * Calculates user's study streak based on last active date.
 * If active today: streak unchanged.
 * If active yesterday: streak + 1.
 * If older or never: reset streak to 1.
 */
export function calculateStreak(
  lastDate: string | null,
  currentStreak: number = 0,
  referenceDate: Date = new Date()
): StreakResult {
  const today = referenceDate.toISOString().split('T')[0];

  if (!lastDate) {
    return { streak: 1, updatedDate: today };
  }

  if (lastDate === today) {
    return { streak: currentStreak || 1, updatedDate: today };
  }

  const yesterdayDate = new Date(referenceDate.getTime() - 86400000);
  const yesterday = yesterdayDate.toISOString().split('T')[0];

  if (lastDate === yesterday) {
    return { streak: (currentStreak || 0) + 1, updatedDate: today };
  }

  // Broken streak
  return { streak: 1, updatedDate: today };
}
