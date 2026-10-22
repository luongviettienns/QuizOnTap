/**
 * Calculates XP earned based on correct answers and combo streak.
 * Base: 10 XP per correct answer.
 * Combo Bonus: 5 additional XP per combo count.
 */
export function calculateXp(correctCount: number, combo: number = 0): number {
  if (correctCount <= 0) return 0;
  const base = correctCount * 10;
  const comboBonus = Math.max(0, combo) * 5;
  return base + comboBonus;
}
