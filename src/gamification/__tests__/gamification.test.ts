import { describe, it, expect, beforeEach } from 'vitest';
import { calculateStreak } from '../streakTracker';
import { calculateXp } from '../xpCalculator';
import { isAudioMuted, playTone } from '../audioSynth';

describe('Gamification Logic', () => {
  it('increments streak when active on consecutive days', () => {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    const result = calculateStreak(yesterday, 3);
    expect(result.streak).toBe(4);
    expect(result.updatedDate).toBe(today);
  });

  it('keeps streak the same if already recorded today', () => {
    const today = new Date().toISOString().split('T')[0];
    const result = calculateStreak(today, 5);
    expect(result.streak).toBe(5);
    expect(result.updatedDate).toBe(today);
  });

  it('resets streak to 1 if more than 1 day has passed', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    const result = calculateStreak(threeDaysAgo, 10);
    expect(result.streak).toBe(1);
    expect(result.updatedDate).toBe(today);
  });

  it('calculates XP bonus based on combo streak', () => {
    const xpBase = calculateXp(1, 0);
    const xpWithCombo = calculateXp(1, 5);
    expect(xpWithCombo).toBeGreaterThan(xpBase);
  });
});

describe('Web Audio Synthesizer', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('detects mute state correctly from localStorage', () => {
    expect(isAudioMuted()).toBe(false);
    localStorage.setItem('quizontap_mute', 'true');
    expect(isAudioMuted()).toBe(true);
    localStorage.setItem('quizontap_mute', 'false');
    expect(isAudioMuted()).toBe(false);
  });

  it('safely handles playTone calls without throwing in non-audio or muted environments', () => {
    expect(() => {
      playTone('correct');
      playTone('wrong');
      playTone('victory');
      playTone('complete');
      playTone('flip');
      playTone('alert');
      playTone('click');
    }).not.toThrow();

    localStorage.setItem('quizontap_mute', 'true');
    expect(() => {
      playTone('correct');
    }).not.toThrow();
  });
});

